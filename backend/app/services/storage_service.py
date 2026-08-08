from pathlib import Path
from uuid import UUID, uuid4

from fastapi import UploadFile
from supabase import Client

from app.core.config import Settings
from app.core.exceptions import AppError

CONTENT_TYPE_EXTENSIONS = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


class StorageService:
    bucket_name = "wellness-images"

    def __init__(self, client: Client, settings: Settings) -> None:
        self.client = client
        self.settings = settings

    async def upload_symptom_image(self, user_id: UUID, file: UploadFile) -> str:
        extension = CONTENT_TYPE_EXTENSIONS.get(file.content_type or "")
        original_extension = Path(file.filename or "").suffix.lower()
        if extension is None or original_extension not in {".jpg", ".jpeg", ".png", ".webp"}:
            raise AppError("INVALID_IMAGE_TYPE", "지원하지 않는 이미지 형식입니다.", 422)

        max_bytes = self.settings.max_image_size_mb * 1024 * 1024
        contents = await file.read(max_bytes + 1)
        if len(contents) > max_bytes:
            raise AppError(
                "IMAGE_TOO_LARGE",
                f"이미지는 {self.settings.max_image_size_mb}MB 이하여야 합니다.",
                413,
            )
        if not contents:
            raise AppError("INVALID_IMAGE_TYPE", "빈 이미지 파일은 업로드할 수 없습니다.", 422)

        path = f"{user_id}/{uuid4()}{extension}"
        try:
            self.client.storage.from_(self.bucket_name).upload(
                path,
                contents,
                file_options={"content-type": file.content_type, "upsert": "false"},
            )
        except Exception as exc:
            raise AppError("DATABASE_ERROR", "이미지를 저장하지 못했습니다.", 503) from exc
        return path

    def remove(self, path: str) -> None:
        try:
            self.client.storage.from_(self.bucket_name).remove([path])
        except Exception:
            # Best-effort rollback; no secret or user content is logged.
            return

