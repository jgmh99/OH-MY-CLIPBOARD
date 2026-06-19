const {
  BUG_REPORT_URL,
  LOGIN_ITEMS_SETTINGS_URL
} = require('./config');

function registerIpcHandlers({
  ipcMain,
  shell,
  clipboardHistory,
  settingsStore,
  updateSetting,
  updateService
}) {
  ipcMain.handle('get-clipboard-history', () => {
    return clipboardHistory.getHistory();
  });

  ipcMain.handle('copy-to-clipboard', (_event, id) => {
    return clipboardHistory.copyItem(id);
  });

  ipcMain.handle('delete-clipboard-item', (_event, id) => {
    return clipboardHistory.deleteItem(id);
  });

  ipcMain.handle('toggle-lock-clipboard-item', (_event, id) => {
    return clipboardHistory.toggleLockItem(id);
  });

  ipcMain.handle('clear-clipboard-history', () => {
    return clipboardHistory.clearHistory();
  });

  ipcMain.handle('get-settings', () => {
    return settingsStore.get();
  });

  ipcMain.handle('update-setting', (_event, key, value) => {
    return updateSetting(key, value);
  });

  ipcMain.handle('check-for-updates', () => {
    return updateService.checkForUpdates();
  });

  ipcMain.handle('open-update-release', () => {
    return updateService.openUpdateRelease();
  });

  ipcMain.handle('open-bug-report', () => {
    shell.openExternal(BUG_REPORT_URL);
    return true;
  });

  ipcMain.handle('open-login-items-settings', () => {
    shell.openExternal(LOGIN_ITEMS_SETTINGS_URL);
  });
}

module.exports = {
  registerIpcHandlers
};
