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
함께 생성합니다. 백엔드의 DB와 Storage 요청에도 사용자 JWT의 RLS가 적용되며,
최상위 리소스는 `user_id`, 하위 리소스는 소유한 상위 리소스를 통해 접근을 제한합니다.

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
| POST/PATCH | `/api/profile` | 프로필 생성/수정 및 특이사항 AI 자동 분류 |
| GET | `/api/profile/wellness` | 반복 증상 빈도와 등록 건강 정보 조회 |
| POST/GET | `/api/logs` | 생활 기록 생성/목록, `?days=7` 지원 |
| GET/PATCH/DELETE | `/api/logs/{id}` | 본인 생활 기록 조회/수정/삭제 |
| POST/GET | `/api/symptoms` | 증상 생성/목록 |
| GET/DELETE | `/api/symptoms/{id}` | 본인 증상 조회/삭제 |
| POST | `/api/symptoms/{id}/image` | 이미지 업로드 (`multipart/form-data`) |
| POST | `/api/analysis` | 생활 기록 기반 원인 후보 최대 3개 생성 |
| GET | `/api/analysis` | 본인 자가진단 이력 목록 |
| GET | `/api/analysis/{id}` | 본인 자가진단 상세 (후보 포함) |
| POST | `/api/analysis/{id}/select` | 후보 선택 또는 `candidate_id: null` |
| GET | `/api/analysis/{id}/chat` | 해당 자가진단의 AI 채팅 메시지 조회 |
| POST | `/api/analysis/{id}/chat` | 사용자 메시지 전송, AI 답변 생성 및 대화 저장 |
| POST | `/api/recommendations` | 선택 결과에 맞춘 작은 행동 생성 |
| POST | `/api/recommendations/{id}/feedback` | positive/negative 피드백 저장 |
| POST | `/api/recommendations/{id}/alternative` | 부정 피드백 기반 더 작은 대안 생성 |
| GET | `/api/reports/weekly` | 주간 AI 건강 리포트 생성/조회 |
| GET | `/api/reports/monthly` | 월간 AI 건강 리포트 생성/조회 |
| GET | `/api/products` | 동의 후 활성 제품 목록 |
| GET | `/api/products/search?q=` | 동의 후 제품명 검색 |
| GET | `/api/products/recommended?tags=` | 동의 후 DB 태그 제품 조회 |

제품 API는 `consent=true`가 반드시 필요합니다. 추천 태그는 `sleep`, `exercise`,
`hydration`, `desk_environment`만 허용합니다. OpenAI는 제품명이나 URL을 만들지 않고,
앱은 데이터베이스에 등록된 `purchase_url`만 엽니다.

프로필의 `special_notes`는 질환·알레르기·복용 항목 등을 구분하지 않고 한 문장으로
입력하는 필드입니다. 서버는 입력에 명시된 사실만 Structured Output으로 분류해
`special_notes_classification`에 저장하며, 이 결과를 진단으로 취급하지 않습니다.
행동 추천에는 최근 좋아요/싫어요 행동과 부정 피드백 사유가 함께 전달되어 다음
제안의 개인화 문맥으로 사용됩니다. 이는 모델 파인튜닝이 아니라 사용자별 문맥 반영입니다.

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

AI 채팅 요청:

```json
POST /api/analysis/{analysis_id}/chat
{
  "content": "이 결과를 생활 속에서 어떻게 확인해볼 수 있을까요?"
}
```

채팅은 완료된 본인 분석에서만 사용할 수 있습니다. 최근 대화와 해당 분석의 증상,
후보, 최신 추천이 AI 문맥으로 전달되며 사용자 메시지와 AI 답변은 한 턴으로 함께
저장됩니다.

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
- `app/services`: 분석, 추천, 웰니스 프로필, Storage 비즈니스 로직
- `app/repositories`: ownership 조건이 포함된 Supabase 쿼리
- `app/prompts`: 의료 진단을 방지하는 AI 지침
- `app/core`: 환경설정, 인증, 통일 오류 처리
- `sql/schema.sql`: Supabase용 전체 SQL
- `tests`: API와 서비스 Mock 테스트
