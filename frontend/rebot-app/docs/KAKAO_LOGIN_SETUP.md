# 카카오 로그인 설정

앱 코드는 Supabase OAuth를 사용합니다. 아래 대시보드 설정까지 완료해야 실제 로그인이 동작합니다.

## 1. Kakao Developers

카카오 애플리케이션에서 다음 값을 설정합니다.

- 카카오 로그인: 활성화
- Redirect URI:
  - `https://jdhassvacgsgkisvtcxi.supabase.co/auth/v1/callback`
- 동의 항목:
  - 닉네임: 필수 또는 선택
  - 이메일: 서비스에서 필요할 경우 필수 또는 선택

`앱 키`에서 REST API 키를 확인하고, 필요한 경우 `보안 > Client Secret`을 생성해 활성화합니다.

## 2. Supabase

`Authentication > Sign In / Providers > Kakao`에서 다음을 설정합니다.

- Kakao provider: 활성화
- Client ID: Kakao REST API 키
- Client Secret: Kakao Client Secret을 활성화했다면 입력

`Authentication > URL Configuration > Redirect URLs`에는 실행 환경별 앱 콜백을 등록합니다.

- 개발/배포 빌드: `rebot://auth/callback`
- Expo Go: 터미널에 연결된 주소를 사용한
  `exp://<개발 PC IP>:8081/--/auth/callback`

Expo Go 주소는 네트워크와 개발 PC IP에 따라 바뀔 수 있습니다. 팀 개발 중에는 현재 주소를
개별 등록하거나, Supabase가 허용하는 glob 패턴을 사용해 개발용 주소를 제한적으로 허용합니다.
운영 환경에서는 `rebot://auth/callback`처럼 고정된 앱 scheme을 사용합니다.

## 3. 앱 환경 변수

`frontend/rebot-app/.env`에 다음 값이 있어야 합니다.

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Expo Go에서는 `EXPO_PUBLIC_AUTH_REDIRECT_URL`을 설정하지 않습니다. 앱이 현재 Expo Go 주소를
자동 생성합니다. 개발 빌드나 배포 앱에서 고정 주소를 쓰려면 다음을 추가합니다.

```env
EXPO_PUBLIC_AUTH_REDIRECT_URL=rebot://auth/callback
```

환경 변수를 바꾼 뒤에는 Metro를 종료하고 `pnpm exec expo start --lan --clear`로 다시 시작합니다.
