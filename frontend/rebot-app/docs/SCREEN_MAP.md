# 화면 경로

| 영역 | 경로 | 설명 |
| --- | --- | --- |
| 시작 | `/` | RE:BOT 스플래시 |
| 인증 | `/login`, `/signup` | 로그인·회원가입 |
| 설문 | `/onboarding/basic`, `/onboarding/profile` | 기본 정보·수면 정보 |
| 홈 | `/(tabs)/home` | 날씨, 빠른 시작, 컨디션 체크 |
| 원인 추적 | `/(tabs)/diagnosis` | 증상·사진 입력 |
| 원인 추적 | `/diagnosis/loading` | 분석 로딩 |
| 원인 추적 | `/diagnosis/candidates` | 원인 후보 선택 |
| 원인 추적 | `/diagnosis/result` | 추천 해결 방법 |
| 원인 추적 | `/diagnosis/product` | 제품 추천 동의 |
| AI 솔루션 | `/(tabs)/solution` | 상황 입력 |
| AI 솔루션 | `/solution/suggestion` | 현실적 행동 제안 |
| AI 솔루션 | `/solution/feedback` | 도움 여부 피드백 |
| 마켓 | `/(tabs)/market` | 추천·인기 상품, 검색, 장바구니 진입 |
| 마켓 | `/market/list` | 카테고리별 전체 상품 (더보기) |
| 마켓 | `/market/cart` | 장바구니 |
| 마이페이지 | `/(tabs)/profile` | 회원 메뉴 |
| 리포트 | `/profile/report` | UI 시안용 건강 리포트 |
| 마이페이지 | `/profile/edit` | 회원정보 수정 (아이디·한줄소개·프로필 사진) |
| 마이페이지 | `/profile/notifications` | 알림 설정 on/off |
| 마이페이지 | `/profile/support` | 고객센터 메뉴 |
| 마이페이지 | `/profile/support/email` | 익명 이메일 문의 |
| 마이페이지 | `/profile/support/terms` | 이용약관·주의사항 |

Figma 기준 프레임은 402×874입니다. 앱에서는 고정 좌표 대신 안전영역과 Flexbox를 사용해 화면 크기에 대응합니다.
