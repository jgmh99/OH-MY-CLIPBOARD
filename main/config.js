const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');

const TRAY_ICON_PATH = path.join(ROOT_DIR, 'icons', 'icon.png');
const APP_ICON_PATH = path.join(ROOT_DIR, 'icons', 'oh-my-clipboard.icns');
const PRELOAD_PATH = path.join(ROOT_DIR, 'preload.js');
const RENDERER_INDEX_PATH = path.join(ROOT_DIR, 'renderer-dist', 'index.html');
const RELEASES_API_URL = 'https://api.github.com/repos/jgmh99/OH-MY-CLIPBOARD/releases/latest';
const BUG_REPORT_URL = 'https://github.com/jgmh99/OH-MY-CLIPBOARD/issues/new';
const LOGIN_ITEMS_SETTINGS_URL = 'x-apple.systempreferences:com.apple.LoginItems-Settings.extension';

const SUPPORTED_LANGUAGES = ['ko', 'en', 'ja', 'zh'];

const IMAGE_FILE_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.bmp',
  '.tif',
  '.tiff',
  '.heic',
  '.heif',
  '.ico'
]);

const SETTINGS_OPTIONS = {
  launchAtLogin: [true, false],
  maxHistoryItems: [10, 20, 50, 100],
  ignoreDuplicates: [true, false],
  minTextLength: [1, 2, 5, 10, 20, 50],
  maxTextLength: [200, 500, 1000, 3000, 5000, 10000],
  pauseTracking: [true, false],
  autoHideOnBlur: [true, false],
  theme: ['system', 'dark', 'light'],
  textSize: [12, 13, 15, 17],
  language: SUPPORTED_LANGUAGES
};

const defaultSettings = {
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

const trayTranslations = {
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

module.exports = {
  APP_ICON_PATH,
  BUG_REPORT_URL,
  IMAGE_FILE_EXTENSIONS,
  LOGIN_ITEMS_SETTINGS_URL,
  PRELOAD_PATH,
  RELEASES_API_URL,
  RENDERER_INDEX_PATH,
  ROOT_DIR,
  SETTINGS_OPTIONS,
  TRAY_ICON_PATH,
  defaultSettings,
  trayTranslations
};
