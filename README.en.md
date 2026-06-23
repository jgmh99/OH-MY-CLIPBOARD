# Oh My Clipboard

[한국어](./README.ko.md) | [English](./README.en.md) | [日本語](./README.ja.md) | [中文](./README.zh.md)

`Oh My Clipboard` is a macOS menu bar clipboard history app built with Electron and React. It tracks copied text and images, lets users copy previous items again, and keeps important entries pinned through a lock feature.

This project is designed as a portfolio-grade desktop app. It demonstrates Electron process separation, a safe preload bridge, local settings persistence, multilingual UI, React component composition, and a GitHub Releases based update flow.

## Goals

- Build a lightweight utility that stays accessible from the macOS menu bar
- Keep Electron main, preload, and renderer responsibilities clearly separated
- Use React components for a maintainable desktop UI
- Validate settings before they affect OS-level behavior
- Package and release the app as a macOS DMG

## Features

- Menu bar app
  - Runs from the macOS menu bar instead of staying in the Dock.
  - Opens through the tray icon or a global shortcut.

- Clipboard history
  - Tracks text and image clipboard content.
  - Lets users copy previous items back to the clipboard.
  - Supports duplicate filtering and text length limits.

- Item management
  - Copy, delete, and lock history items.
  - Locked items are preserved when history is trimmed or cleared.

- Preferences
  - Language, theme, text size, max history count, auto-hide behavior, and tracking pause.
  - Global shortcut recording directly inside the settings UI.

- Localization
  - Korean, English, Japanese, and Chinese.
  - Both tray menu labels and React renderer text respond to the selected language.

- Update check
  - Reads the latest version from GitHub Releases.
  - Opens the release page when a newer version is available.

## Tech Stack

- Electron
  - Tray app, BrowserWindow, globalShortcut, clipboard, and macOS login item integration
- React
  - Component-driven renderer UI
- Vite
  - Renderer bundling and development server
- CommonJS main modules
  - Feature-oriented Electron main process modules
- electron-builder
  - macOS DMG packaging
- semantic-release
  - Automated versioning and release notes from Conventional Commits

## Architecture

```text
main.js
  Application bootstrap and dependency wiring

main/
  clipboard-reader.js    Reads text and image clipboard data
  clipboard-history.js   Owns history state and item actions
  settings-store.js      Loads, saves, and validates settings
  window-manager.js      Creates and positions the Electron window
  tray-controller.js     Builds the menu bar tray and context menu
  shortcuts.js           Registers the global shortcut
  ipc-handlers.js        Handles renderer requests
  update-service.js      Checks GitHub Releases for updates

preload.js
  Exposes a small, safe IPC API through contextBridge

src/
  React renderer
```

The main process owns OS-level capabilities. The renderer only uses the limited `window.clipboardApp` API exposed by `preload.js`, with `nodeIntegration: false` and `contextIsolation: true`.

## React Structure

```text
src/
  App.tsx
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
    settings-config.ts
    translations.ts
  utils/
    history.js
    messages.js
    settings.js
    shortcuts.js
    updates.js
```

`App.tsx` coordinates state and Electron API calls. UI details live in focused components. Settings are rendered from metadata in `settings-config.ts`, making the preferences screen easier to extend.

## Run Locally

Install dependencies:

```bash
npm install
```

Run in development:

```bash
npm run dev
```

Build the production renderer:

```bash
npm run build
```

Run Electron with the built renderer:

```bash
npm start
```

Build the macOS DMG:

```bash
npm run dist
```

## User Data

Settings are stored at:

```text
~/Library/Application Support/oh-my-clipboard/settings.json
```

To reset the app, quit it and remove that folder.

## Download

- Product page: https://jgmh99.github.io/OH-MY-CLIPBOARD/
- Latest release: https://github.com/jgmh99/OH-MY-CLIPBOARD/releases
- Release asset: `Oh My Clipboard-...-arm64.dmg`

### Opening the unsigned app

The current DMG is not signed with an Apple Developer ID, so macOS may block its first launch.

1. Open the DMG and drag `Oh My Clipboard` into the `Applications` folder.
2. Launch the app once from `Applications` to trigger the macOS warning.
3. Open `System Settings → Privacy & Security`, scroll down, click `Open Anyway`, then open the app again.

The current release supports Apple Silicon (M1 or later) and macOS 12 or later.

## Release Flow

When changes are merged into `main`, GitHub Actions and `semantic-release` analyze Conventional Commits and create a release. The in-app update check compares the current app version with the latest GitHub Release tag.
