const fs = require('fs');
const path = require('path');
const { SETTINGS_OPTIONS, defaultSettings } = require('./config');

function sanitizeBoolean(value, fallback) {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return fallback;
}

function sanitizeString(value, fallback = '') {
  if (typeof value === 'string') {
    return value.trim();
  }

  return fallback;
}

function sanitizeShortcutValue(value, fallback) {
  const rawValue = sanitizeString(value, fallback);

  if (!rawValue) {
    return fallback;
  }

  const modifierAliasMap = {
    cmd: 'Command',
    command: 'Command',
    commandorcontrol: process.platform === 'darwin' ? 'Command' : 'Control',
    ctrl: 'Control',
    control: 'Control',
    alt: 'Option',
    option: 'Option',
    opt: 'Option',
    shift: 'Shift'
  };
  const modifierOrder = ['Command', 'Control', 'Option', 'Shift'];
  const keyAliasMap = {
    return: 'Enter',
    enter: 'Enter',
    esc: 'Escape',
    escape: 'Escape',
    space: 'Space',
    spacebar: 'Space',
    tab: 'Tab',
    delete: 'Delete',
    del: 'Delete',
    backspace: 'Backspace',
    up: 'Up',
    down: 'Down',
    left: 'Left',
    right: 'Right',
    home: 'Home',
    end: 'End',
    pageup: 'PageUp',
    pagedown: 'PageDown'
  };

  const tokens = rawValue
    .split('+')
    .map((token) => token.trim())
    .filter(Boolean);

  if (!tokens.length) {
    return fallback;
  }

  const modifiers = new Set();
  let key = null;

  tokens.forEach((token) => {
    const normalizedToken = token.toLowerCase();
    const modifier = modifierAliasMap[normalizedToken];

    if (modifier) {
      modifiers.add(modifier);
      return;
    }

    if (key) {
      key = null;
      return;
    }

    const aliasedKey = keyAliasMap[normalizedToken];

    if (aliasedKey) {
      key = aliasedKey;
      return;
    }

    if (/^[a-z]$/i.test(token)) {
      key = token.toUpperCase();
      return;
    }

    if (/^[0-9]$/.test(token)) {
      key = token;
      return;
    }

    if (/^f([1-9]|1[0-9]|2[0-4])$/i.test(token)) {
      key = token.toUpperCase();
    }
  });

  if (!key || !modifiers.size) {
    return fallback;
  }

  return [
    ...modifierOrder.filter((modifier) => modifiers.has(modifier)),
    key
  ].join('+');
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
    shortcut: sanitizeShortcutValue(
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
    windowX: Number.isFinite(Number(nextSettings.windowX))
      ? Math.round(Number(nextSettings.windowX))
      : defaultSettings.windowX,
    windowY: Number.isFinite(Number(nextSettings.windowY))
      ? Math.round(Number(nextSettings.windowY))
      : defaultSettings.windowY,
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

function createSettingsStore(app) {
  let settings = { ...defaultSettings };

  function getSettingsPath() {
    return path.join(app.getPath('userData'), 'settings.json');
  }

  function save() {
    fs.writeFileSync(
      getSettingsPath(),
      JSON.stringify(settings, null, 2),
      'utf-8'
    );
  }

  function load() {
    const settingsPath = getSettingsPath();

    if (!fs.existsSync(settingsPath)) {
      settings = { ...defaultSettings };
      save();
      return settings;
    }

    try {
      const raw = fs.readFileSync(settingsPath, 'utf-8');
      const parsed = JSON.parse(raw);

      settings = sanitizeSettings({
        ...defaultSettings,
        ...parsed
      });
    } catch {
      settings = { ...defaultSettings };
      save();
    }

    return settings;
  }

  function get() {
    return settings;
  }

  function set(nextSettings) {
    settings = sanitizeSettings({
      ...settings,
      ...nextSettings
    });
    save();
    return settings;
  }

  return {
    get,
    load,
    save,
    set
  };
}

module.exports = {
  createSettingsStore,
  sanitizeSettings
};
