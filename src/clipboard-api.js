const fallbackSettings = {
  launchAtLogin: false,
  maxHistoryItems: 20,
  shortcut: 'Command+Shift+V',
  ignoreDuplicates: true,
  minTextLength: 1,
  maxTextLength: 5000,
  windowX: null,
  windowY: null,
  pauseTracking: false,
  autoHideOnBlur: true,
  theme: 'system',
  textSize: 13,
  language: 'ko'
};

function createFallbackApi() {
  let settings = { ...fallbackSettings };

  return {
    getHistory: async () => [],
    copyText: async () => [],
    deleteItem: async () => [],
    toggleLockItem: async () => [],
    clearHistory: async () => [],
    getSettings: async () => settings,
    updateSetting: async (key, value) => {
      settings = {
        ...settings,
        [key]: value
      };
      return settings;
    },
    openLoginItemsSettings: async () => false,
    checkForUpdates: async () => ({
      status: 'idle',
      version: null,
      releaseUrl: null,
      message: '',
      canCheck: true,
      canOpen: false
    }),
    openUpdateRelease: async () => false,
    openBugReport: async () => false,
    onHistoryUpdated: () => () => {},
    onSettingsUpdated: () => () => {},
    onOpenSettingsView: () => () => {}
  };
}

export const clipboardApi = window.clipboardApp || createFallbackApi();
