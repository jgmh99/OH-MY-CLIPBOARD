# Oh My Clipboard

`Oh My Clipboard`는 macOS 메뉴바에서 동작하는 Electron 기반 클립보드 히스토리 앱입니다. 최근 복사한 텍스트를 다시 열어 복사할 수 있고, 중요한 항목은 잠가서 유지할 수 있습니다.

## 주요 기능

- 메뉴바에서 빠르게 열리는 클립보드 기록 창
- 항목 복사, 삭제, 잠금
- 다국어 UI
  - 한국어
  - English
  - 日本語
  - 中文
- 설정 UI
  - `On / Off` 항목은 토글 스위치
  - 3개 선택지는 세그먼트 컨트롤
  - 그 외 항목은 커스텀 드롭다운

## 실행

```bash
npm run dev
```

## 배포 빌드

```bash
npm run dist
```

## 자동 릴리즈

`main` 브랜치에 머지되면 GitHub Actions가 자동으로 릴리즈를 만듭니다. 릴리즈는 `semantic-release` 기준으로 동작하므로, 커밋 메시지는 `feat:`, `fix:`, `refactor:` 같은 Conventional Commits 형식을 쓰는 게 좋습니다.

PR에서는 commitlint가 커밋 메시지를 검사합니다. `main`에 들어가는 변경은 conventional commit 형식을 유지해야 릴리즈가 자동으로 올라갑니다.

자동 릴리즈를 쓰려면 GitHub Repository Secrets에 아래 값을 등록해야 합니다.

- `MAC_CSC_LINK`
- `MAC_CSC_KEY_PASSWORD`

릴리즈 산출물은 DMG, ZIP, `latest-mac.yml`입니다. 앱 내 업데이트 확인은 이 메타데이터를 읽어서 동작합니다.

## 폴더 구조

```text
.
├─ index.html
├─ main.js
├─ preload.js
├─ renderer
│  ├─ scripts
│  │  ├─ app.js
│  │  ├─ settings-config.js
│  │  └─ translations.js
│  └─ styles
│     └─ app.css
└─ README.md
```

## 파일 역할

- `main.js`
  - Electron 메인 프로세스
  - 트레이, 단축키, 설정 저장, 클립보드 감시 담당
- `preload.js`
  - 렌더러에 안전한 IPC API 노출
- `index.html`
  - 화면 골격만 담당
- `renderer/scripts/settings-config.js`
  - 설정 메타데이터
  - 어떤 설정이 토글/세그먼트/드롭다운인지 정의
- `renderer/scripts/translations.js`
  - 언어별 텍스트 정의
- `renderer/scripts/app.js`
  - 렌더러 UI 생성, 이벤트 바인딩, 상태 렌더링
- `renderer/styles/app.css`
  - 전체 스타일

## 사용자 설정 위치

앱 설정과 캐시는 macOS의 아래 경로에 저장됩니다.

```text
~/Library/Application Support/oh-my-clipboard
```

초기 상태로 되돌리려면 이 폴더를 삭제하면 됩니다.

## 설정 항목

- 언어
- 로그인 시 실행
- 전역 단축키
- 테마
- 텍스트 크기
- 최대 기록 수
- 중복 저장 방지
- 최소 텍스트 길이
- 최대 텍스트 길이
- 클립보드 추적
- 포커스 해제 시 자동 닫기
