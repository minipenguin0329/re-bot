# RE:BOT Backend

RE:BOT은 생활 기록을 바탕으로 사용자가 직접 확인할 수 있는 생활습관 관련 후보와
작은 행동을 제안하는 웰니스 서비스입니다. 의료 진단이나 처방을 제공하지 않습니다.

## 1. 준비물

- Python 3.12 이상
- Supabase 프로젝트
- OpenAI Platform API 키

비밀키를 Git에 커밋하거나 프론트엔드 코드에 넣지 마세요. 프론트엔드는 Supabase
로그인 후 받은 Access Token만 백엔드에 전달합니다.

## 2. 가상환경과 의존성 설치

PowerShell 기준입니다.

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

macOS/Linux에서는 활성화 명령만 `source .venv/bin/activate`로 바꾸면 됩니다.

## 3. 환경변수 설정

```powershell
Copy-Item .env.example .env
```

`.env`에 실제 값을 입력합니다.

| 변수 | 용도 |
| --- | --- |
| `OPENAI_API_KEY` | 백엔드 전용 OpenAI API 키 |
| `OPENAI_MODEL` | Responses API에서 사용할 모델 ID |
| `SUPABASE_URL` | Supabase 프로젝트 URL |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase 공개 publishable 키 |
| `ALLOWED_ORIGINS` | 쉼표로 구분한 프론트엔드 origin |
| `ENVIRONMENT` | `development` 또는 배포 환경 이름 |
| `MAX_IMAGE_SIZE_MB` | 이미지 최대 크기, 기본 5MB |

`OPENAI_API_KEY`는 절대 프론트엔드로 전달하지 않습니다. 백엔드는 사용자 Access Token으로
Supabase를 호출하므로 service-role 키를 요구하지 않습니다.

## 4. Supabase 준비

1. Supabase 프로젝트의 **SQL Editor**를 엽니다.
2. [`sql/schema.sql`](sql/schema.sql) 전체를 붙여 넣고 실행합니다.
3. Authentication에서 사용할 로그인 공급자를 설정합니다.
4. SQL이 생성한 `wellness-images` 버킷이 private인지 확인합니다.

스키마는 테이블, 제약조건, 외래키, 인덱스, RLS 정책과 비공개 Storage 버킷을
함께 생성합니다. 백엔드의 DB와 Storage 요청에도 사용자 JWT의 RLS가 적용되며, 모든
repository 쿼리에는 인증된 `user_id` ownership 조건을 별도로 넣었습니다.

## 5. OpenAI 연결 확인

`.env`에 실제 키와 모델을 넣은 뒤 다음 개발용 명령을 한 번 실행합니다.

```powershell
python -m app.scripts.check_openai
```

정상이면 `OpenAI connection: ok`가 출력됩니다. 이 호출은 Responses API와 Pydantic
Structured Outputs를 사용하며 API 키나 응답 본문을 로그에 출력하지 않습니다.

## 6. 서버 실행

```powershell
uvicorn app.main:app --reload
```

- 상태 확인: <http://localhost:8000/health>
- Swagger UI: <http://localhost:8000/docs>
- OpenAPI JSON: <http://localhost:8000/openapi.json>

## 7. 인증 방식

Supabase Auth 로그인 후 받은 Access Token을 모든 개인 API에 보냅니다.

```http
Authorization: Bearer SUPABASE_ACCESS_TOKEN
```

URL이나 request body에는 `user_id`를 보내지 않습니다. 백엔드가 Access Token을
Supabase Auth로 검증하고 사용자 ID를 결정합니다.

## 8. 주요 API

| Method | Path | 설명 |
| --- | --- | --- |
| GET | `/health` | 서버 상태 |
| GET | `/api/me` | 현재 인증 사용자와 프로필 |
| POST/PATCH | `/api/profile` | 프로필 생성/수정 |
| POST/GET | `/api/logs` | 생활 기록 생성/목록, `?days=7` 지원 |
| GET/PATCH/DELETE | `/api/logs/{id}` | 본인 생활 기록 조회/수정/삭제 |
| POST/GET | `/api/symptoms` | 증상 생성/목록 |
| GET/DELETE | `/api/symptoms/{id}` | 본인 증상 조회/삭제 |
| POST | `/api/symptoms/{id}/image` | 이미지 업로드 (`multipart/form-data`) |
| POST | `/api/analysis` | 생활 기록 기반 원인 후보 최대 3개 생성 |
| POST | `/api/analysis/{id}/select` | 후보 선택 또는 `candidate_id: null` |
| POST | `/api/recommendations` | 선택 결과에 맞춘 작은 행동 생성 |
| POST | `/api/recommendations/{id}/feedback` | positive/negative 피드백 저장 |
| POST | `/api/recommendations/{id}/alternative` | 부정 피드백 기반 더 작은 대안 생성 |
| GET | `/api/reports/weekly` | 최근 7일 리포트 생성/저장 |
| GET | `/api/reports/monthly` | 이번 달 리포트 생성/저장 |
| GET | `/api/products` | 동의 후 활성 제품 목록 |
| GET | `/api/products/search?q=` | 동의 후 제품명 검색 |
| GET | `/api/products/recommended?tags=` | 동의 후 DB 태그 제품 조회 |

제품 API는 `consent=true`가 반드시 필요합니다. 추천 태그는 `sleep`, `exercise`,
`hydration`, `desk_environment`만 허용합니다. OpenAI는 제품명을 만들지 않습니다.

## 9. 핵심 요청 예시

증상 분석:

```json
POST /api/analysis
{
  "symptom_id": "00000000-0000-0000-0000-000000000000"
}
```

후보 선택:

```json
POST /api/analysis/{analysis_id}/select
{
  "candidate_id": null
}
```

`null`은 제시된 후보 중 해당되는 것이 없다는 뜻입니다.

추천 요청:

```json
POST /api/recommendations
{
  "analysis_id": "00000000-0000-0000-0000-000000000000"
}
```

모든 오류는 다음 형태입니다.

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "기록을 찾을 수 없습니다."
  }
}
```

## 10. 테스트

테스트는 OpenAI와 Supabase를 Mock으로 대체하므로 실제 API 비용이 발생하지 않습니다.

```powershell
pytest
```

## 11. 폴더 구조

- `app/api/routes`: HTTP endpoint
- `app/schemas`: Pydantic request/response 및 AI Structured Output
- `app/services`: 분석, 추천, 리포트, Storage 비즈니스 로직
- `app/repositories`: ownership 조건이 포함된 Supabase 쿼리
- `app/prompts`: 의료 진단을 방지하는 AI 지침
- `app/core`: 환경설정, 인증, 통일 오류 처리
- `sql/schema.sql`: Supabase용 전체 SQL
- `tests`: API와 서비스 Mock 테스트
