# Oh My Clipboard

[한국어](./README.ko.md) | [English](./README.en.md) | [日本語](./README.ja.md) | [中文](./README.zh.md)

`Oh My Clipboard` 是一款使用 Electron 和 React 构建的 macOS 菜单栏剪贴板历史应用。它可以记录复制过的文本和图片，让用户重新复制历史项目，并通过锁定功能保留重要内容。

这个项目以作品集级别的桌面应用为目标，包含 Electron 进程职责拆分、安全的 preload bridge、本地设置持久化、多语言 UI、React 组件化结构，以及基于 GitHub Releases 的更新检查流程。

## 项目目标

- 构建一个可从 macOS 菜单栏快速访问的轻量工具
- 明确拆分 Electron main、preload、renderer 的职责
- 使用 React 组件构建可维护的桌面 UI
- 在设置影响系统级功能前进行校验
- 支持 macOS DMG 打包和自动发布流程

## 主要功能

- 菜单栏应用
  - 不长期占用 Dock，通过 macOS 菜单栏运行。
  - 可通过托盘图标或全局快捷键打开历史窗口。

- 剪贴板历史
  - 监听文本和图片剪贴板内容。
  - 可将历史项目重新复制到剪贴板。
  - 支持重复过滤和文本长度限制。

- 项目管理
  - 支持复制、删除、锁定。
  - 锁定项目在清理历史时会被保留。

- 设置界面
  - 支持语言、主题、文字大小、最大历史数量、自动隐藏、暂停监听等设置。
  - 可在设置界面直接录制全局快捷键。

- 多语言支持
  - 支持韩语、英语、日语、中文。
  - 托盘菜单和 React renderer 文案都会根据语言设置更新。

- 更新检查
  - 读取 GitHub Releases 的最新版本。
  - 如果有新版本，可以打开对应的发布页面。

## 技术栈

- Electron
  - Tray、BrowserWindow、globalShortcut、clipboard、macOS 登录项集成
- React
  - 组件化 renderer UI
- Vite
  - renderer 构建和开发服务器
- CommonJS main modules
  - Electron main 进程按功能拆分
- electron-builder
  - macOS DMG 打包
- semantic-release
  - 基于 Conventional Commits 的自动发布

## 架构

```text
main.js
  应用初始化和模块组装

main/
  clipboard-reader.js    读取剪贴板文本/图片
  clipboard-history.js   管理历史状态和项目操作
  settings-store.js      加载、保存、校验设置
  window-manager.js      创建并定位 Electron 窗口
  tray-controller.js     构建菜单栏托盘和菜单
  shortcuts.js           注册全局快捷键
  ipc-handlers.js        处理 renderer 请求
  update-service.js      检查 GitHub Releases 更新

preload.js
  通过 contextBridge 暴露有限且安全的 IPC API

src/
  React renderer
```

main 进程负责系统级能力，renderer 只能使用 `preload.js` 暴露的 `window.clipboardApp` API。应用以 `nodeIntegration: false` 和 `contextIsolation: true` 为前提设计。

## React 结构

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

`App.jsx` 负责状态协调和 Electron API 调用，具体 UI 拆分到小组件中。设置界面基于 `settings-config.js` 的元数据渲染，因此更容易扩展。

## 本地运行

安装依赖:

```bash
npm install
```

开发运行:

```bash
npm run dev
```

构建 production renderer:

```bash
npm run build
```

使用构建后的 renderer 启动 Electron:

```bash
npm start
```

构建 macOS DMG:

```bash
npm run dist
```

## 用户数据

设置保存位置:

```text
~/Library/Application Support/oh-my-clipboard/settings.json
```

如果需要重置应用，请退出应用后删除该文件夹。

## 下载

- 产品页面: https://jgmh99.github.io/OH-MY-CLIPBOARD/
- 最新版本: https://github.com/jgmh99/OH-MY-CLIPBOARD/releases
- 发布文件: `Oh My Clipboard-...-arm64.dmg`

## 发布流程

当变更合并到 `main` 分支后，GitHub Actions 和 `semantic-release` 会分析 Conventional Commits 并创建发布版本。应用内更新检查会比较当前应用版本和 GitHub Releases 的最新标签。
