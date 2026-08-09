# RE:BOT Frontend

원인을 모를 때는 가능한 원인을 함께 되짚고, 원인을 알 때는 현실적으로 실행 가능한 선택을 제안하는 AI 웰니스 앱의 UI 프로젝트입니다.

## 기술 구성

- Expo SDK 54
- React Native
- TypeScript
- Expo Router

## 실행

```bash
pnpm install
pnpm start
```

터미널에 표시되는 QR 코드를 Expo Go로 스캔하거나 `w`를 눌러 웹 화면을 확인합니다.

## 폴더 구조

```text
app/                    # 화면과 경로
  (tabs)/               # 하단 탭 화면
  diagnosis/            # 원인 추적 세부 화면
  onboarding/           # 초기 설문 화면
  profile/              # 마이페이지 세부 화면
  solution/             # 상황별 솔루션 세부 화면
src/
  components/           # 재사용 UI 컴포넌트
  theme/                # 색상·간격·글꼴 크기 토큰
assets/                 # 이미지·아이콘·폰트
docs/                   # 협업 문서
```

## 협업 규칙

1. 최신 `main`에서 기능 브랜치를 생성합니다.
2. 한 브랜치에는 한 화면 또는 한 기능만 작업합니다.
3. 화면 파일은 `app/`, 공통 UI는 `src/components/`에 작성합니다.
4. API 호출은 이후 `src/services/`, API 응답 타입은 `src/types/`에 추가합니다.
5. `.env`와 비밀 키는 커밋하지 않습니다.

브랜치 예시:

```text
feature/fe-login
feature/fe-diagnosis
feature/fe-market
```

커밋 예시:

```text
feat: 로그인 화면 UI 구현
style: 원인 후보 카드 간격 수정
fix: 솔루션 화면 이동 오류 수정
```

## 현재 범위

- Figma 기반 UI
- 화면 이동과 로컬 UI 상태
- 샘플 웰니스 데이터

실제 로그인, 데이터베이스, 이미지 업로드, OpenAI API 및 상품 API 연결은 포함하지 않습니다.

## 백엔드·Supabase 연동

`.env.example`을 `.env`로 복사해서 공개 연결 값을 사용합니다. Expo 앱의 클라이언트 환경
변수는 `EXPO_PUBLIC_` 접두사를 사용합니다.

```env
EXPO_PUBLIC_SUPABASE_URL=https://jdhassvacgsgkisvtcxi.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_HGYc1tEOdKw1KmJS5UaHdQ_v79Dd-VY
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000
```

- 프론트는 Supabase Auth로 로그인하고 세션을 유지합니다.
- 개인 데이터와 이미지, OpenAI 기능은 FastAPI를 통해 사용합니다.
- 인증 API 요청에는 `Authorization: Bearer SUPABASE_ACCESS_TOKEN`을 전달합니다.
- 연결 확인 API는 `GET /api/me`, 전체 명세는 백엔드 `/docs`에서 확인합니다.
- 실제 DB 타입은 `src/types/database.types.ts`에 있습니다.

`service_role` 키와 OpenAI API 키는 앱에 넣지 않습니다.
