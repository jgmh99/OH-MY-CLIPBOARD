export type Language = 'ko' | 'en' | 'ja' | 'zh';
export type Theme = 'system' | 'dark' | 'light';
export type HistoryKind = 'text' | 'image';
export type HistoryFilter = 'all' | 'locked';
export type ActiveView = HistoryFilter | 'settings';

export type ClipboardHistoryItem = {
  id: string;
  kind: HistoryKind;
  text: string;
  imageDataUrl: string;
  locked: boolean;
  createdAt: number;
  altText?: string;
  note?: string;
};

export type Settings = {
  launchAtLogin: boolean;
  maxHistoryItems: number;
  shortcut: string;
  ignoreDuplicates: boolean;
  minTextLength: number;
  maxTextLength: number;
  windowX: number | null;
  windowY: number | null;
  pauseTracking: boolean;
  autoHideOnBlur: boolean;
  theme: Theme;
  textSize: number;
  language: Language;
};

export type UpdateState = {
  status: 'idle' | 'checking' | 'available' | 'not-available' | 'error';
  version: string | null;
  releaseUrl: string | null;
  message: string;
  canCheck: boolean;
  canOpen: boolean;
};

export type SettingControl = 'dropdown' | 'toggle' | 'segmented' | 'shortcut';
export type SettingValue = string | number | boolean;

export type SettingOption = {
  value: SettingValue;
  label?: string;
  labelKey?: string;
};

export type SettingConfig = {
  group: 'general' | 'history' | 'behavior';
  key: keyof Settings;
  type: 'string' | 'number' | 'boolean';
  control: SettingControl;
  options: SettingOption[];
};

export type MessageCatalog = {
  appTitle: string;
  historyKicker: string;
  historyTitle: string;
  historyPanelKicker: string;
  historyPanelTitle: string;
  settingsKicker: string;
  settingsTitle: string;
  clear: string;
  searchPlaceholder: string;
  clearSearch: string;
  noHistory: string;
  noSearchResults: string;
  copiedToast: string;
  copiedFeedback: string;
  lockedFeedback: string;
  unlockedFeedback: string;
  lockedItem: string;
  imageItem: string;
  textItem: string;
  imageAlt: string;
  copyItem: string;
  lock: string;
  unlock: string;
  delete: string;
  lockedDeleteHint: string;
  openLoginSettings: string;
  nav: Record<ActiveView, string>;
  groups: Record<SettingConfig['group'], string>;
  labels: Record<string, string>;
  descriptions: Record<string, string>;
  options: Record<string, string>;
  shortcuts: {
    record: string;
    recording: string;
    hint: string;
    reset: string;
    invalid: string;
  };
  updates: {
    groupTitle: string;
    summaryTitle: string;
    versionLabel: string;
    checkButton: string;
    openButton: string;
    laterButton: string;
    reportBugButton: string;
    statusIdle: string;
    statusChecking: string;
    statusAvailable: string;
    statusNotAvailable: string;
    statusError: string;
  };
};

export type ClipboardApi = {
  getHistory: () => Promise<ClipboardHistoryItem[]>;
  copyText: (id: string) => Promise<ClipboardHistoryItem[]>;
  deleteItem: (id: string) => Promise<ClipboardHistoryItem[]>;
  toggleLockItem: (id: string) => Promise<ClipboardHistoryItem[]>;
  clearHistory: () => Promise<ClipboardHistoryItem[]>;
  getSettings: () => Promise<Settings>;
  updateSetting: (key: keyof Settings, value: SettingValue) => Promise<Settings>;
  openLoginItemsSettings: () => Promise<boolean>;
  checkForUpdates: () => Promise<UpdateState>;
  openUpdateRelease: () => Promise<UpdateState | boolean>;
  openBugReport: () => Promise<boolean>;
  onHistoryUpdated: (callback: (history: ClipboardHistoryItem[]) => void) => () => void;
  onSettingsUpdated: (callback: (settings: Settings) => void) => () => void;
  onOpenSettingsView: (callback: () => void) => () => void;
};
