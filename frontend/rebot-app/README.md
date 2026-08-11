# RE:BOT Frontend

Expo SDK 54, React Native, TypeScript, Expo Router로 만든 RE:BOT 앱입니다. Supabase Auth로 로그인하고 FastAPI에 Access Token을 전달합니다. OpenAI API 키는 프론트에 포함되지 않습니다.

## 준비

- Node.js 20.19 이상
- pnpm 10
- 실행 중인 RE:BOT FastAPI 백엔드
- 마이그레이션이 적용된 Supabase 프로젝트

```powershell
pnpm install
Copy-Item .env.example .env
```

`.env`의 공개 연결 값을 환경에 맞게 수정합니다.

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000
```

`EXPO_PUBLIC_*` 값은 앱 번들에서 볼 수 있으므로 OpenAI 키, `service_role` 키, 기타 비밀값을 절대 넣지 않습니다.

## 실행

```powershell
pnpm start
```

웹 또는 에뮬레이터에서는 `http://localhost:8000`을 사용할 수 있습니다. 같은 Wi-Fi의 실제 휴대폰에서 Expo Go를 사용한다면 `localhost` 대신 개발 PC의 내부 IP를 사용합니다.

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.0.10:8000
```

백엔드도 외부 기기 요청을 받을 수 있게 실행합니다.

```powershell
cd ../../../backend
.\.venv\Scripts\uvicorn.exe app.main:app --reload --host 0.0.0.0
```

## 검증

```powershell
pnpm typecheck
pnpm lint
```

## 실제 연결 범위

- 이메일 회원가입·로그인·로그아웃·세션 복원
- Supabase Auth 기반 카카오 OAuth 로그인
- 프로필·계정 정보 수정
- 일일 컨디션 저장
- 증상·이미지 업로드·AI 원인 분석·행동 추천
- 대안 생성과 추천 피드백
- 주간 AI 리포트
- 동의 기반 상품 조회와 로컬 장바구니

실제 결제 API는 아직 구성되지 않았으며 UI에 데모로 명확히 표시됩니다. 프로필 사진, 한줄 소개, 알림 설정은 현재 실행 중인 앱의 로컬 상태만 사용합니다.

## 카카오 로그인 설정

1. [Kakao Developers](https://developers.kakao.com/)에서 앱을 만들고 카카오 로그인을 활성화합니다.
2. 카카오 앱의 REST API 키에 아래 Redirect URI를 등록합니다.

   ```text
   https://jdhassvacgsgkisvtcxi.supabase.co/auth/v1/callback
   ```

3. 동의 항목에서 `profile_nickname`, `profile_image`를 설정합니다. 이메일이 필요하면 Biz App 전환 후 `account_email`도 설정합니다.
4. Supabase Dashboard의 **Authentication → Providers → Kakao**에서 REST API 키와 Client Secret을 입력하고 Provider를 활성화합니다. 이메일 동의를 받지 않는다면 **Allow users without an email**도 활성화합니다.
5. Supabase의 **Authentication → URL Configuration → Redirect URLs**에 다음 주소를 추가합니다.

   ```text
   rebot://auth/callback
   http://localhost:8081/auth/callback
   ```

Expo Go에서는 실행 중 표시되는 `exp://.../--/auth/callback` 주소도 Redirect URLs에 추가해야 합니다. 고정된 콜백을 사용하려면 개발 빌드에서 테스트합니다.
