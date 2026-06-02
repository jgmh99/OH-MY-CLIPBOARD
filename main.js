const {
  app,
  BrowserWindow,
  Tray,
  nativeImage,
  clipboard,
  ipcMain,
  Menu,
  globalShortcut,
  shell
} = require('electron');

const path = require('path');
const fs = require('fs');

let tray = null;
let trayMenu = null;
let win = null;
let clipboardHistory = [];
let lastText = '';
let clipboardTimer = null;

const SUPPORTED_LANGUAGES = ['ko', 'en', 'ja', 'zh'];
const SETTINGS_OPTIONS = {
  launchAtLogin: [true, false],
  maxHistoryItems: [10, 20, 50, 100],
  shortcut: [
    'CommandOrControl+Shift+V',
    'CommandOrControl+Option+V',
    'CommandOrControl+Shift+Space',
    'CommandOrControl+Shift+C'
  ],
  ignoreDuplicates: [true, false],
  minTextLength: [1, 2, 5, 10, 20, 50],
  maxTextLength: [200, 500, 1000, 3000, 5000, 10000],
  pauseTracking: [true, false],
  autoHideOnBlur: [true, false],
  theme: ['system', 'dark', 'light'],
  textSize: [12, 13, 15, 17],
  language: SUPPORTED_LANGUAGES
};

const translations = {
  ko: {
    appTitle: 'Oh My Clipboard',
    openHistory: '클립보드 기록 열기',
    settings: '설정',
    launchAtLogin: '로그인 시 실행',
    pauseTracking: '클립보드 추적 일시정지',
    resumeTracking: '클립보드 추적 다시 시작',
    quit: 'Oh My Clipboard 종료'
  },
  en: {
    appTitle: 'Oh My Clipboard',
    openHistory: 'Open Clipboard History',
    settings: 'Settings',
    launchAtLogin: 'Launch at Login',
    pauseTracking: 'Pause Clipboard Tracking',
    resumeTracking: 'Resume Clipboard Tracking',
    quit: 'Quit Oh My Clipboard'
  },
  ja: {
    appTitle: 'Oh My Clipboard',
    openHistory: 'クリップボード履歴を開く',
    settings: '設定',
    launchAtLogin: 'ログイン時に起動',
    pauseTracking: 'クリップボード追跡を一時停止',
    resumeTracking: 'クリップボード追跡を再開',
    quit: 'Oh My Clipboard を終了'
  },
  zh: {
    appTitle: 'Oh My Clipboard',
    openHistory: '打开剪贴板历史',
    settings: '设置',
    launchAtLogin: '登录时启动',
    pauseTracking: '暂停剪贴板监听',
    resumeTracking: '恢复剪贴板监听',
    quit: '退出 Oh My Clipboard'
  }
};

function createTrayIcon() {
  const icon = nativeImage.createFromDataURL(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4////fwAJ+wP9KobjigAAAABJRU5ErkJggg=='
  );

  return icon.resize({
    width: 16,
    height: 16
  });
}

const defaultSettings = {
  launchAtLogin: false,
  maxHistoryItems: 20,
  shortcut: 'CommandOrControl+Shift+V',
  ignoreDuplicates: true,
  minTextLength: 1,
  maxTextLength: 5000,
  pauseTracking: false,
  autoHideOnBlur: true,
  theme: 'system',
  textSize: 13,
  language: 'ko'
};

let settings = { ...defaultSettings };

function getSettingsPath() {
  return path.join(app.getPath('userData'), 'settings.json');
}

function loadSettings() {
  const settingsPath = getSettingsPath();

  if (!fs.existsSync(settingsPath)) {
    settings = { ...defaultSettings };
    saveSettings();
    return;
  }

  try {
    const raw = fs.readFileSync(settingsPath, 'utf-8');
    const parsed = JSON.parse(raw);

    settings = {
      ...defaultSettings,
      ...parsed
    };

    settings = sanitizeSettings(settings);
  } catch {
    settings = { ...defaultSettings };
    saveSettings();
  }
}

function saveSettings() {
  fs.writeFileSync(
    getSettingsPath(),
    JSON.stringify(settings, null, 2),
    'utf-8'
  );
}

function createHistoryItem(text) {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text,
    locked: false,
    createdAt: Date.now()
  };
}

function normalizeHistoryItem(item) {
  if (typeof item === 'string') {
    return createHistoryItem(item);
  }

  return {
    id: item.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text: item.text || '',
    locked: Boolean(item.locked),
    createdAt: item.createdAt || Date.now()
  };
}

function getHistoryTexts() {
  return clipboardHistory.map((item) => item.text);
}

function getMessages() {
  return translations[settings.language] || translations.ko;
}

function sanitizeBoolean(value, fallback) {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return fallback;
}

function sanitizeSelectValue(key, value, fallback) {
  const allowedValues = SETTINGS_OPTIONS[key];

  if (!allowedValues) {
    return fallback;
  }

  if (allowedValues.includes(value)) {
    return value;
  }

  if (typeof fallback === 'number') {
    const parsed = Number(value);
    return allowedValues.includes(parsed) ? parsed : fallback;
  }

  if (typeof fallback === 'boolean') {
    const parsed = sanitizeBoolean(value, fallback);
    return allowedValues.includes(parsed) ? parsed : fallback;
  }

  return fallback;
}

function sanitizeSettings(nextSettings) {
  const sanitized = {
    launchAtLogin: sanitizeSelectValue(
      'launchAtLogin',
      nextSettings.launchAtLogin,
      defaultSettings.launchAtLogin
    ),
    maxHistoryItems: sanitizeSelectValue(
      'maxHistoryItems',
      nextSettings.maxHistoryItems,
      defaultSettings.maxHistoryItems
    ),
    shortcut: sanitizeSelectValue(
      'shortcut',
      nextSettings.shortcut,
      defaultSettings.shortcut
    ),
    ignoreDuplicates: sanitizeSelectValue(
      'ignoreDuplicates',
      nextSettings.ignoreDuplicates,
      defaultSettings.ignoreDuplicates
    ),
    minTextLength: sanitizeSelectValue(
      'minTextLength',
      nextSettings.minTextLength,
      defaultSettings.minTextLength
    ),
    maxTextLength: sanitizeSelectValue(
      'maxTextLength',
      nextSettings.maxTextLength,
      defaultSettings.maxTextLength
    ),
    pauseTracking: sanitizeSelectValue(
      'pauseTracking',
      nextSettings.pauseTracking,
      defaultSettings.pauseTracking
    ),
    autoHideOnBlur: sanitizeSelectValue(
      'autoHideOnBlur',
      nextSettings.autoHideOnBlur,
      defaultSettings.autoHideOnBlur
    ),
    theme: sanitizeSelectValue(
      'theme',
      nextSettings.theme,
      defaultSettings.theme
    ),
    textSize: sanitizeSelectValue(
      'textSize',
      nextSettings.textSize,
      defaultSettings.textSize
    ),
    language: sanitizeSelectValue(
      'language',
      nextSettings.language,
      defaultSettings.language
    )
  };

  if (sanitized.minTextLength > sanitized.maxTextLength) {
    sanitized.maxTextLength = sanitized.minTextLength;
  }

  return sanitized;
}

function syncRendererState() {
  if (!win) {
    return;
  }

  win.webContents.send('settings-updated', settings);
  win.webContents.send('clipboard-history-updated', clipboardHistory);
}

function applyLoginItemSetting() {
  app.setLoginItemSettings({
    openAtLogin: settings.launchAtLogin
  });

  console.log('Login item settings:', app.getLoginItemSettings());
}

function registerShortcut() {
  globalShortcut.unregisterAll();

  if (!settings.shortcut) return;

  const success = globalShortcut.register(settings.shortcut, () => {
    toggleWindow();
  });

  console.log('Shortcut registered:', settings.shortcut, success);
}

function updateSetting(key, value) {
  settings = sanitizeSettings({
    ...settings,
    [key]: value
  });

  if (key === 'maxHistoryItems') {
    const lockedItems = clipboardHistory.filter((item) => item.locked);
    const unlockedItems = clipboardHistory.filter((item) => !item.locked);
    const remainCount = Math.max(settings.maxHistoryItems - lockedItems.length, 0);

    clipboardHistory = [
      ...lockedItems,
      ...unlockedItems.slice(0, remainCount)
    ];
  }

  if (key === 'launchAtLogin') {
    applyLoginItemSetting();
    updateTrayMenu();
  }

  if (key === 'pauseTracking' || key === 'language') {
    updateTrayMenu();
  }

  if (key === 'shortcut') {
    registerShortcut();
  }

  saveSettings();
  syncRendererState();

  return settings;
}

function createWindow() {
  win = new BrowserWindow({
    width: 390,
    height: 540,
    show: false,
    frame: false,
    resizable: false,
    movable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile('index.html');

  if (process.env.NODE_ENV !== 'production') {
    win.webContents.openDevTools({ mode: 'detach' });
  }

  win.on('blur', () => {
    if (settings.autoHideOnBlur) {
      win.hide();
    }
  });
}

function updateTrayMenu() {
  if (!tray) return;

  const messages = getMessages();

  trayMenu = Menu.buildFromTemplate([
    {
      label: messages.openHistory,
      click: () => {
        showWindow();
      }
    },
    {
      label: messages.settings,
      click: () => {
        showWindow();
        win.webContents.send('open-settings-view');
      }
    },
    {
      type: 'separator'
    },
    {
      label: messages.launchAtLogin,
      type: 'checkbox',
      checked: settings.launchAtLogin,
      click: (menuItem) => {
        updateSetting('launchAtLogin', menuItem.checked);
      }
    },
    {
      label: settings.pauseTracking ? messages.resumeTracking : messages.pauseTracking,
      click: () => {
        updateSetting('pauseTracking', !settings.pauseTracking);
      }
    },
    {
      type: 'separator'
    },
    {
      label: messages.quit,
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip(messages.appTitle);
}

function createTray() {
  tray = new Tray(createTrayIcon());
  tray.setTitle('OMC');

  tray.on('click', () => {
    toggleWindow();
  });

  tray.on('right-click', () => {
    if (trayMenu) {
      tray.popUpContextMenu(trayMenu);
    }
  });

  updateTrayMenu();

  console.log('Tray created');
}

function showWindow() {
  if (!win || !tray) return;

  const trayBounds = tray.getBounds();
  const windowBounds = win.getBounds();

  const x = Math.round(trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2);
  const y = Math.round(trayBounds.y + trayBounds.height + 6);

  win.setPosition(x, y, false);
  win.show();
  win.focus();

  win.webContents.send('clipboard-history-updated', clipboardHistory);
  win.webContents.send('settings-updated', settings);
}

function toggleWindow() {
  if (!win) return;

  if (win.isVisible()) {
    win.hide();
    return;
  }

  showWindow();
}

function shouldSaveClipboardText(value) {
  if (settings.pauseTracking) return false;
  if (!value) return false;
  if (value.length < settings.minTextLength) return false;
  if (value.length > settings.maxTextLength) return false;
  if (settings.ignoreDuplicates && value === lastText) return false;

  return true;
}

function trimHistory() {
  const lockedItems = clipboardHistory.filter((item) => item.locked);
  const unlockedItems = clipboardHistory.filter((item) => !item.locked);
  const remainCount = Math.max(settings.maxHistoryItems - lockedItems.length, 0);

  clipboardHistory = [
    ...lockedItems,
    ...unlockedItems.slice(0, remainCount)
  ];
}

function addClipboardText(text) {
  const value = text.trim();

  if (!shouldSaveClipboardText(value)) return;

  lastText = value;

  const existingItem = clipboardHistory.find((item) => item.text === value);

  if (existingItem) {
    clipboardHistory = [
      existingItem,
      ...clipboardHistory.filter((item) => item.id !== existingItem.id)
    ];
  } else {
    clipboardHistory = [
      createHistoryItem(value),
      ...clipboardHistory
    ];
  }

  trimHistory();

  if (win) {
    win.webContents.send('clipboard-history-updated', clipboardHistory);
  }
}

function watchClipboard() {
  clipboardTimer = setInterval(() => {
    const text = clipboard.readText();
    addClipboardText(text);
  }, 800);
}

app.whenReady().then(() => {
  console.log('App ready');

  loadSettings();
  applyLoginItemSetting();

  if (process.platform === 'darwin') {
    app.dock.hide();
  }

  createWindow();
  createTray();
  registerShortcut();
  watchClipboard();
});

ipcMain.handle('get-clipboard-history', () => {
  clipboardHistory = clipboardHistory.map(normalizeHistoryItem);
  return clipboardHistory;
});

ipcMain.handle('copy-to-clipboard', (_event, id) => {
  const item = clipboardHistory.find((historyItem) => historyItem.id === id);

  if (!item) {
    return clipboardHistory;
  }

  clipboard.writeText(item.text);
  lastText = item.text;

  clipboardHistory = [
    item,
    ...clipboardHistory.filter((historyItem) => historyItem.id !== id)
  ];

  return clipboardHistory;
});

ipcMain.handle('delete-clipboard-item', (_event, id) => {
  clipboardHistory = clipboardHistory.filter((item) => item.id !== id);

  if (win) {
    win.webContents.send('clipboard-history-updated', clipboardHistory);
  }

  return clipboardHistory;
});

ipcMain.handle('toggle-lock-clipboard-item', (_event, id) => {
  clipboardHistory = clipboardHistory.map((item) => {
    if (item.id !== id) return item;

    return {
      ...item,
      locked: !item.locked
    };
  });

  trimHistory();

  if (win) {
    win.webContents.send('clipboard-history-updated', clipboardHistory);
  }

  return clipboardHistory;
});

ipcMain.handle('clear-clipboard-history', () => {
  clipboardHistory = clipboardHistory.filter((item) => item.locked);
  lastText = clipboard.readText().trim();

  if (win) {
    win.webContents.send('clipboard-history-updated', clipboardHistory);
  }

  return clipboardHistory;
});

ipcMain.handle('get-settings', () => {
  return settings;
});

ipcMain.handle('update-setting', (_event, key, value) => {
  return updateSetting(key, value);
});

ipcMain.handle('open-login-items-settings', () => {
  shell.openExternal('x-apple.systempreferences:com.apple.LoginItems-Settings.extension');
});

app.on('before-quit', () => {
  if (clipboardTimer) {
    clearInterval(clipboardTimer);
  }

  globalShortcut.unregisterAll();

  if (tray) {
    tray.destroy();
    tray = null;
  }
});

app.on('window-all-closed', (event) => {
  event.preventDefault();
});
