# RE:BOT Supabase

이 디렉터리는 실제 Supabase 프로젝트를 재현하기 위한 마이그레이션을 보관합니다.

## 구성

- `migrations/20260809000000_initial_schema.sql`: 테이블, 인덱스, 기본 RLS 정책, private Storage 버킷
- `migrations/20260809010000_storage_rls.sql`: 사용자별 이미지 폴더 Storage 정책
- `migrations/20260809020000_performance_advisor_fixes.sql`: 외래키 인덱스와 RLS 성능 최적화
- `migrations/20260810000000_product_catalog.sql`: 상품 가격 필드와 초기 웰니스 상품 카탈로그
- `migrations/20260818000000_special_notes_classification.sql`: 단일 특이사항과 AI 분류 결과 필드
- `migrations/20260818010000_product_purchase_urls.sql`: 초기 상품의 외부 제품 검색 URL
- `backend/sql/schema.sql`: SQL Editor에서 수동 실행할 때 사용하는 동일 스키마
- `frontend/rebot-app/src/types/database.types.ts`: 마이그레이션 스키마에 대응하는 TypeScript 타입

## 적용

Supabase CLI를 사용하는 경우 프로젝트를 연결한 뒤 실행합니다.

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

CLI를 사용하지 않으면 Supabase Dashboard의 SQL Editor에서
`backend/sql/schema.sql` 전체를 실행합니다.

## 프론트팀에 전달할 값

다음 공개 값만 전달합니다.

- 프로젝트 이름: `REBOT`
- 프로젝트 ref: `jdhassvacgsgkisvtcxi`

```env
EXPO_PUBLIC_SUPABASE_URL=https://jdhassvacgsgkisvtcxi.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_HGYc1tEOdKw1KmJS5UaHdQ_v79Dd-VY
EXPO_PUBLIC_API_BASE_URL=https://YOUR_BACKEND_HOST
```

`service_role` 키, 데이터베이스 비밀번호, OpenAI API 키는 전달하거나 커밋하지 않습니다.

프론트는 Supabase Auth만 직접 사용하고, 애플리케이션 데이터는 Access Token과 함께
FastAPI에 요청합니다. 백엔드는 사용자 Access Token으로 Supabase를 호출하므로 모든 DB와
Storage 작업에 RLS가 적용되며, 저장소 쿼리에서도 `user_id` 소유권 필터를 추가로 강제합니다.
