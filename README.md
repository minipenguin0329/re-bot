# RE:BOT

RE:BOT은 생활 기록과 사용자가 입력한 불편 상황을 바탕으로 가능한 원인을 함께 되짚고, 현실적으로 실행 가능한 웰니스 행동을 제안하는 앱입니다. 의료 진단이나 처방을 제공하지 않습니다.

## 구성

- `backend/`: FastAPI, OpenAI Responses API, Supabase Auth·Database·Storage 연동
- `frontend/rebot-app/`: Expo SDK 54, React Native, Expo Router 앱
- `supabase/migrations/`: 테이블, RLS, Storage, 상품 카탈로그 마이그레이션

## 현재 연결된 흐름

- Supabase 이메일 회원가입·로그인·세션 유지
- Access Token을 포함한 프론트 → FastAPI 인증 요청
- 프로필 생성·수정과 일일 컨디션 기록
- 증상 저장, 선택 이미지 업로드, AI 원인 분석
- 원인 후보 선택, 행동 추천, 대안 및 피드백
- 주간 AI 웰니스 리포트
- 사용자 동의 후 상품 카탈로그 조회와 로컬 장바구니

## 시작 순서

1. Supabase 마이그레이션을 적용합니다.
2. `backend/.env.example`을 참고해 `backend/.env`를 작성합니다.
3. 백엔드를 실행합니다.
4. `frontend/rebot-app/.env.example`을 참고해 프론트 환경변수를 작성합니다.
5. Expo 앱을 실행합니다.

자세한 명령과 보안 주의사항은 [`backend/README.md`](backend/README.md), [`frontend/rebot-app/README.md`](frontend/rebot-app/README.md), [`supabase/README.md`](supabase/README.md)를 확인하세요.

`OPENAI_API_KEY`와 Supabase 비밀 키는 Git이나 `EXPO_PUBLIC_*` 변수에 넣지 않습니다.
