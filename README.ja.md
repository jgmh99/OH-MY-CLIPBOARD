# Oh My Clipboard

[한국어](./README.ko.md) | [English](./README.en.md) | [日本語](./README.ja.md) | [中文](./README.zh.md)

`Oh My Clipboard` は、Electron と React で作成した macOS メニューバー用クリップボード履歴アプリです。コピーしたテキストや画像を記録し、過去の項目を再度コピーしたり、重要な項目をロックして保持したりできます。

このプロジェクトはポートフォリオ向けのデスクトップアプリとして、Electron のプロセス分離、安全な preload bridge、ローカル設定保存、多言語 UI、React コンポーネント構成、GitHub Releases を使った更新確認を含んでいます。

## 目的

- macOS メニューバーから素早く使える軽量ユーティリティを作る
- Electron main、preload、renderer の責務を明確に分離する
- React コンポーネントで保守しやすい UI を構成する
- 設定値を検証して OS 連携機能を安全に扱う
- macOS DMG として配布できるビルド環境を整える

## 主な機能

- メニューバーアプリ
  - Dock に常駐せず、macOS メニューバーから操作できます。
  - トレイアイコンまたはグローバルショートカットで履歴ウィンドウを開けます。

- クリップボード履歴
  - テキストと画像のクリップボード内容を監視します。
  - 過去の項目を再度クリップボードへコピーできます。
  - 重複保存の抑制、最小/最大テキスト長の制限に対応しています。

- 項目管理
  - コピー、削除、ロックができます。
  - ロックした項目は履歴整理や削除から保護されます。

- 設定
  - 言語、テーマ、文字サイズ、最大履歴数、自動非表示、追跡一時停止を変更できます。
  - グローバルショートカットを設定画面で直接記録できます。

- 多言語対応
  - 韓国語、英語、日本語、中国語に対応しています。
  - トレイメニューと React レンダラーのテキストが選択言語に合わせて更新されます。

- 更新確認
  - GitHub Releases の最新バージョンを確認します。
  - 新しいバージョンがある場合、リリースページを開けます。

## 技術スタック

- Electron
  - Tray、BrowserWindow、globalShortcut、clipboard、macOS ログイン項目連携
- React
  - コンポーネントベースの renderer UI
- Vite
  - renderer のビルドと開発サーバー
- CommonJS main modules
  - Electron main プロセスを機能単位で分割
- electron-builder
  - macOS DMG パッケージング
- semantic-release
  - Conventional Commits に基づく自動リリース

## アーキテクチャ

```text
main.js
  アプリの初期化とモジュール結合

main/
  clipboard-reader.js    クリップボードのテキスト/画像読み取り
  clipboard-history.js   履歴状態と項目操作
  settings-store.js      設定の保存、読み込み、検証
  window-manager.js      Electron ウィンドウの作成と位置制御
  tray-controller.js     メニューバートレイとメニュー構築
  shortcuts.js           グローバルショートカット登録
  ipc-handlers.js        renderer からの要求処理
  update-service.js      GitHub Releases の更新確認

preload.js
  contextBridge で限定された安全な IPC API を公開

src/
  React renderer
```

OS レベルの機能は main プロセスが担当し、renderer は `preload.js` が公開する `window.clipboardApp` だけを使用します。`nodeIntegration: false`、`contextIsolation: true` を前提にしています。

## React 構成

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

`App.tsx` は状態管理と Electron API 呼び出しをまとめ、UI は小さなコンポーネントに分割しています。設定画面は `settings-config.ts` のメタデータから描画されるため、拡張しやすい構成です。

## 実行方法

依存関係をインストール:

```bash
npm install
```

開発実行:

```bash
npm run dev
```

production renderer をビルド:

```bash
npm run build
```

ビルド済み renderer で Electron を起動:

```bash
npm start
```

macOS DMG を作成:

```bash
npm run dist
```

## ユーザーデータ

設定は次の場所に保存されます。

```text
~/Library/Application Support/oh-my-clipboard/settings.json
```

初期化する場合は、アプリを終了してこのフォルダを削除してください。

## ダウンロード

- 紹介ページ: https://jgmh99.github.io/OH-MY-CLIPBOARD/
- 最新リリース: https://github.com/jgmh99/OH-MY-CLIPBOARD/releases
- リリースファイル: `Oh My Clipboard-...-arm64.dmg`

### 未署名アプリの起動方法

現在のDMGはApple Developer IDで署名されていないため、初回起動時にmacOSによってブロックされる場合があります。

1. DMGを開き、`Oh My Clipboard`を`アプリケーション`フォルダへドラッグします。
2. `アプリケーション`から一度起動し、macOSの警告を表示します。
3. `システム設定 → プライバシーとセキュリティ`を開いて下へスクロールし、`このまま開く`を押してから再度起動します。

現在のリリースはApple Silicon（M1以降）とmacOS 12以降に対応しています。

## リリース

`main` ブランチに変更がマージされると、GitHub Actions と `semantic-release` が Conventional Commits を解析してリリースを作成します。アプリ内の更新確認は、現在のアプリバージョンと GitHub Releases の最新タグを比較します。
