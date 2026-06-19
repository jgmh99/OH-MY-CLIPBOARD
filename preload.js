const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('clipboardApp', {
  getHistory: () => ipcRenderer.invoke('get-clipboard-history'),
  copyText: (id) => ipcRenderer.invoke('copy-to-clipboard', id),
  deleteItem: (id) => ipcRenderer.invoke('delete-clipboard-item', id),
  toggleLockItem: (id) => ipcRenderer.invoke('toggle-lock-clipboard-item', id),
  clearHistory: () => ipcRenderer.invoke('clear-clipboard-history'),

  getSettings: () => ipcRenderer.invoke('get-settings'),
  updateSetting: (key, value) => ipcRenderer.invoke('update-setting', key, value),
  openLoginItemsSettings: () => ipcRenderer.invoke('open-login-items-settings'),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  openUpdateRelease: () => ipcRenderer.invoke('open-update-release'),
  openBugReport: () => ipcRenderer.invoke('open-bug-report'),

  onHistoryUpdated: (callback) => {
    const listener = (_event, history) => {
      callback(history);
    };

    ipcRenderer.on('clipboard-history-updated', listener);
    return () => ipcRenderer.removeListener('clipboard-history-updated', listener);
  },

  onSettingsUpdated: (callback) => {
    const listener = (_event, settings) => {
      callback(settings);
    };

    ipcRenderer.on('settings-updated', listener);
    return () => ipcRenderer.removeListener('settings-updated', listener);
  },

  onOpenSettingsView: (callback) => {
    const listener = () => {
      callback();
    };

    ipcRenderer.on('open-settings-view', listener);
    return () => ipcRenderer.removeListener('open-settings-view', listener);
  }
});
