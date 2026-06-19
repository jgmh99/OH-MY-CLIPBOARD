# Oh My Clipboard

[한국어](./README.ko.md) | [English](./README.en.md) | [日本語](./README.ja.md) | [中文](./README.zh.md)

`Oh My Clipboard`는 macOS 메뉴바에서 실행되는 클립보드 히스토리 앱입니다. 사용자가 복사한 텍스트와 이미지를 기록하고, 필요한 항목을 다시 복사하거나 잠금 처리해 유지할 수 있도록 설계했습니다. Electron 메인 프로세스는 트레이, 전역 단축키, 클립보드 감시, macOS 설정 연동을 담당하고, 렌더러는 React 기반 UI로 구성했습니다.

이 프로젝트는 단순한 클립보드 저장 도구가 아니라, 데스크탑 앱에서 필요한 프로세스 분리, 안전한 IPC 브리지, 로컬 설정 저장, 다국어 UI, 릴리즈 자동화까지 포함한 포트폴리오 프로젝트입니다.

## 프로젝트 목표

- macOS 메뉴바에서 빠르게 접근할 수 있는 가벼운 유틸리티 앱 구현
- Electron main, preload, renderer 책임을 명확히 분리
- React 컴포넌트 기반으로 유지보수 가능한 UI 구성
- 사용자 입력과 설정 값을 검증해 안정적인 데스크탑 앱 동작 보장
- GitHub Releases 기반 업데이트 확인과 DMG 배포 흐름 구성

## 주요 기능

- 메뉴바 트레이 앱
  - Dock에 상시 노출되지 않고 macOS 메뉴바에서 동작합니다.
  - 트레이 아이콘 클릭 또는 전역 단축키로 히스토리 창을 열 수 있습니다.

- 클립보드 히스토리
  - 텍스트와 이미지 클립보드 항목을 감시합니다.
  - 최근 항목을 다시 복사할 수 있습니다.
  - 중복 저장 방지, 최소/최대 텍스트 길이 제한을 지원합니다.

- 항목 관리
  - 항목 복사, 삭제, 잠금 기능을 제공합니다.
  - 잠긴 항목은 기록 정리나 삭제에서 보호됩니다.

- 설정 UI
  - 언어, 테마, 텍스트 크기, 최대 기록 수, 자동 숨김, 추적 일시정지 등을 설정할 수 있습니다.
  - 전역 단축키는 UI에서 직접 녹화해 변경할 수 있습니다.

- 다국어 지원
  - 한국어, 영어, 일본어, 중국어 UI를 지원합니다.
  - 트레이 메뉴와 React 렌더러 텍스트를 모두 언어 설정에 맞춰 갱신합니다.

- 업데이트 확인
  - GitHub Releases의 최신 버전을 조회합니다.
  - 현재 앱 버전보다 새 버전이 있으면 릴리즈 페이지를 열 수 있습니다.

## 기술 스택

- Electron
  - macOS 메뉴바 앱, BrowserWindow, Tray, globalShortcut, clipboard API 사용
- React
  - 히스토리, 설정, 업데이트 패널을 컴포넌트 단위로 구성
- Vite
  - React 렌더러 빌드 및 개발 서버 구성
- CommonJS main modules
  - Electron main 프로세스는 기능별 CommonJS 모듈로 분리
- electron-builder
  - macOS DMG 패키징
- semantic-release
  - Conventional Commits 기반 릴리즈 자동화

## 아키텍처

```text
main.js
  앱 초기화와 모듈 조립만 담당

main/
  clipboard-reader.js    클립보드 텍스트/이미지 읽기
  clipboard-history.js   히스토리 상태와 항목 동작
  settings-store.js      설정 저장, 로드, 검증
  window-manager.js      Electron 창 생성과 위치 제어
  tray-controller.js     메뉴바 트레이와 메뉴 구성
  shortcuts.js           전역 단축키 등록
  ipc-handlers.js        renderer 요청 처리
  update-service.js      GitHub Releases 업데이트 확인

preload.js
  contextBridge로 안전한 IPC API만 renderer에 노출

src/
  React renderer
```

메인 프로세스는 OS와 직접 통신하는 책임을 갖고, 렌더러는 `window.clipboardApp`으로 노출된 제한된 API만 사용합니다. 이 구조는 `nodeIntegration: false`, `contextIsolation: true` 환경에서 동작하도록 설계했습니다.

## React 컴포넌트 구조

```text
src/
  App.jsx
  clipboard-api.js
  components/
    HistoryPanel.jsx
    HistoryItem.jsx
    SettingsPanel.jsx
    SettingRow.jsx
    ShortcutControl.jsx
    UpdateSection.jsx
    Sidebar.jsx
    Toast.jsx
  data/
    settings-config.js
    translations.js
  utils/
    history.js
    messages.js
    settings.js
    shortcuts.js
    updates.js
```

`App.jsx`는 앱 상태와 Electron API 호출을 조립하고, 실제 화면은 `components/` 아래의 작은 컴포넌트가 담당합니다. 설정 항목은 `settings-config.js`의 메타데이터를 기반으로 렌더링되어, 새 설정을 추가할 때 UI 변경 범위를 줄일 수 있습니다.

## 실행

의존성 설치:

```bash
npm install
```

개발 실행:

```bash
npm run dev
```

프로덕션 렌더러 빌드:

```bash
npm run build
```

빌드된 렌더러로 Electron 실행:

```bash
npm start
```

macOS DMG 빌드:

```bash
npm run dist
```

## 사용자 설정 위치

앱 설정은 macOS의 아래 경로에 저장됩니다.

```text
~/Library/Application Support/oh-my-clipboard/settings.json
```

초기 상태로 되돌리려면 앱을 종료한 뒤 해당 폴더를 삭제하면 됩니다.

## 다운로드

- 소개 페이지: https://jgmh99.github.io/OH-MY-CLIPBOARD/
- 최신 릴리즈: https://github.com/jgmh99/OH-MY-CLIPBOARD/releases
- 릴리즈 파일: `Oh My Clipboard-...-arm64.dmg`

## 배포

`main` 브랜치에 변경이 머지되면 GitHub Actions와 `semantic-release`가 Conventional Commits를 분석해 릴리즈를 생성합니다. 앱 내 업데이트 확인은 GitHub Releases의 최신 태그를 현재 앱 버전과 비교하는 방식입니다.

DMG로 새 버전을 설치할 때는 새 앱을 `/Applications`에 덮어쓰기 하고, macOS가 확인을 요청하면 `Replace`를 선택하면 됩니다.
