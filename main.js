const {
  app,
  BrowserWindow,
  Tray,
  clipboard,
  globalShortcut,
  ipcMain,
  nativeImage,
  screen,
  shell
} = require('electron');

const { createClipboardHistory } = require('./main/clipboard-history');
const { createSettingsStore } = require('./main/settings-store');
const { createShortcutController } = require('./main/shortcuts');
const { createTrayController } = require('./main/tray-controller');
const { createUpdateService } = require('./main/update-service');
const { createWindowManager } = require('./main/window-manager');
const { registerIpcHandlers } = require('./main/ipc-handlers');
const { sendHistory, sendRendererState } = require('./main/renderer-state');

let windowManager = null;
let trayController = null;
let shortcutController = null;
let clipboardHistory = null;
let settingsStore = null;

function applyLoginItemSetting() {
  app.setLoginItemSettings({
    openAtLogin: settingsStore.get().launchAtLogin
  });

  console.log('Login item settings:', app.getLoginItemSettings());
}

function syncRendererState() {
  sendRendererState(
    windowManager?.getWindow(),
    settingsStore.get(),
    clipboardHistory.getHistory()
  );
}

function updateSetting(key, value) {
  const settings = settingsStore.set({
    [key]: value
  });

  if (key === 'maxHistoryItems') {
    clipboardHistory.trimHistory();
  }

  if (key === 'launchAtLogin') {
    applyLoginItemSetting();
    trayController.updateTrayMenu();
  }

  if (key === 'pauseTracking' || key === 'language') {
    trayController.updateTrayMenu();
  }

  if (key === 'shortcut') {
    shortcutController.registerShortcut();
  }

  syncRendererState();
  return settings;
}

app.whenReady().then(() => {
  console.log('App ready');

  settingsStore = createSettingsStore(app);
  settingsStore.load();

  clipboardHistory = createClipboardHistory({
    clipboard,
    nativeImage,
    getSettings: settingsStore.get,
    onHistoryChanged: (history) => {
      sendHistory(windowManager?.getWindow(), history);
    }
  });

  windowManager = createWindowManager({
    app,
    BrowserWindow,
    screen,
    getTray: () => trayController?.getTray(),
    settingsStore,
    getHistory: clipboardHistory.getHistory
  });

  trayController = createTrayController({
    app,
    Tray,
    settingsStore,
    showWindow: () => windowManager.showWindow(),
    openSettingsView: () => windowManager.openSettingsView(),
    toggleWindow: () => windowManager.toggleWindow(),
    updateSetting
  });

  shortcutController = createShortcutController({
    globalShortcut,
    settingsStore,
    toggleWindow: () => windowManager.toggleWindow(),
    getWindow: () => windowManager.getWindow(),
    getHistory: clipboardHistory.getHistory
  });

  const updateService = createUpdateService({ app, shell });

  clipboardHistory.syncClipboardBaseline();
  applyLoginItemSetting();

  if (process.platform === 'darwin') {
    app.dock.hide();
  }

  windowManager.createWindow();
  trayController.createTray();
  shortcutController.registerShortcut();
  clipboardHistory.startWatching();

  registerIpcHandlers({
    ipcMain,
    shell,
    clipboardHistory,
    settingsStore,
    updateSetting,
    updateService
  });
});

app.on('before-quit', () => {
  clipboardHistory?.stopWatching();
  shortcutController?.unregisterAll();
  trayController?.destroyTray();
});

app.on('window-all-closed', (event) => {
  event.preventDefault();
});
