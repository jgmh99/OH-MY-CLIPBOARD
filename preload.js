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
  getUpdateState: () => ipcRenderer.invoke('get-update-state'),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  cancelUpdate: () => ipcRenderer.invoke('cancel-update'),
  skipUpdate: () => ipcRenderer.invoke('skip-update'),
  installUpdate: () => ipcRenderer.invoke('install-update'),

  onHistoryUpdated: (callback) => {
    ipcRenderer.on('clipboard-history-updated', (_event, history) => {
      callback(history);
    });
  },

  onSettingsUpdated: (callback) => {
    ipcRenderer.on('settings-updated', (_event, settings) => {
      callback(settings);
    });
  },

  onUpdateStateChanged: (callback) => {
    ipcRenderer.on('update-state-changed', (_event, state) => {
      callback(state);
    });
  },

  onOpenSettingsView: (callback) => {
    ipcRenderer.on('open-settings-view', () => {
      callback();
    });
  }
});
