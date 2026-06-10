# Oh My Clipboard

`Oh My Clipboard`는 macOS 메뉴바에서 동작하는 Electron 기반 클립보드 히스토리 앱입니다. 최근 복사한 텍스트를 다시 열어 복사할 수 있고, 중요한 항목은 잠가서 유지할 수 있습니다.

## 언어별 보기

- [한국어](#korean)
- [English](#english)
- [日本語](#japanese)
- [中文](#chinese)

## 다운로드

- 소개 페이지: https://jgmh99.github.io/OH-MY-CLIPBOARD/
- 최신 릴리즈: [GitHub Releases](https://github.com/jgmh99/OH-MY-CLIPBOARD/releases)
- 직접 받을 파일: 릴리즈의 `Oh My Clipboard-...-arm64.dmg`

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

릴리즈 산출물은 DMG 하나만 올립니다. 앱 내 업데이트 확인은 GitHub Releases의 최신 버전을 비교하고, 새 버전이 있으면 릴리즈 페이지를 엽니다. 자동 설치나 macOS 서명용 Secrets는 필요하지 않습니다.

## 업데이트 후 앱이 2개로 보일 때

DMG를 열어서 새 버전을 설치하면, 기존에 설치된 앱과 새로 받은 설치 파일이 같이 보일 수 있습니다. 이건 정상입니다.

- 설치된 앱은 `/Applications/Oh My Clipboard.app` 입니다.
- 새로 받은 DMG는 설치용 파일입니다.
- 업데이트할 때는 새 DMG 안의 앱을 `/Applications`에 덮어쓰기 하고, 기존 앱이 뜨면 `Replace`를 선택하세요.
- 설치가 끝나면 DMG 파일은 지워도 됩니다.

<a id="korean"></a>
## Korean

`Oh My Clipboard`는 macOS 메뉴바에서 동작하는 Electron 기반 클립보드 히스토리 앱입니다. 최근 복사한 텍스트를 다시 열어 복사할 수 있고, 중요한 항목은 잠가서 유지할 수 있습니다.

<a id="english"></a>
## English

`Oh My Clipboard` is a macOS menu bar clipboard history app built with Electron. You can reopen recent copied text, lock important items, and quickly access history from the menu bar.

<a id="japanese"></a>
## Japanese

`Oh My Clipboard` は、macOS のメニューバーで動作する Electron ベースのクリップボード履歴アプリです。最近コピーしたテキストを再度コピーでき、重要な項目はロックして保持できます。

<a id="chinese"></a>
## Chinese

`Oh My Clipboard` 是一款运行在 macOS 菜单栏中的 Electron 剪贴板历史应用。你可以重新复制最近复制过的文本，并将重要项目锁定保留。

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
