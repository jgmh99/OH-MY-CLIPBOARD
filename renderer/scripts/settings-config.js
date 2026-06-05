window.OhMyClipboardSettingsConfig = [
  {
    group: 'general',
    key: 'language',
    type: 'string',
    control: 'dropdown',
    options: [
      { value: 'ko', labelKey: 'languageKo' },
      { value: 'en', labelKey: 'languageEn' },
      { value: 'ja', labelKey: 'languageJa' },
      { value: 'zh', labelKey: 'languageZh' }
    ]
  },
  {
    group: 'general',
    key: 'launchAtLogin',
    type: 'boolean',
    control: 'toggle',
    options: [
      { value: true, labelKey: 'yes' },
      { value: false, labelKey: 'no' }
    ]
  },
  {
    group: 'general',
    key: 'shortcut',
    type: 'string',
    control: 'shortcut',
    options: []
  },
  {
    group: 'general',
    key: 'theme',
    type: 'string',
    control: 'segmented',
    options: [
      { value: 'system', labelKey: 'system' },
      { value: 'dark', labelKey: 'dark' },
      { value: 'light', labelKey: 'light' }
    ]
  },
  {
    group: 'general',
    key: 'textSize',
    type: 'number',
    control: 'dropdown',
    options: [
      { value: 12, labelKey: 'text12' },
      { value: 13, labelKey: 'text13' },
      { value: 15, labelKey: 'text15' },
      { value: 17, labelKey: 'text17' }
    ]
  },
  {
    group: 'history',
    key: 'maxHistoryItems',
    type: 'number',
    control: 'dropdown',
    options: [10, 20, 50, 100].map((value) => ({ value, label: String(value) }))
  },
  {
    group: 'history',
    key: 'ignoreDuplicates',
    type: 'boolean',
    control: 'toggle',
    options: [
      { value: true, labelKey: 'yes' },
      { value: false, labelKey: 'no' }
    ]
  },
  {
    group: 'history',
    key: 'minTextLength',
    type: 'number',
    control: 'dropdown',
    options: [1, 2, 5, 10, 20, 50].map((value) => ({ value, label: String(value) }))
  },
  {
    group: 'history',
    key: 'maxTextLength',
    type: 'number',
    control: 'dropdown',
    options: [200, 500, 1000, 3000, 5000, 10000].map((value) => ({ value, label: String(value) }))
  },
  {
    group: 'behavior',
    key: 'pauseTracking',
    type: 'boolean',
    control: 'toggle',
    options: [
      { value: false, labelKey: 'no' },
      { value: true, labelKey: 'yes' }
    ]
  },
  {
    group: 'behavior',
    key: 'autoHideOnBlur',
    type: 'boolean',
    control: 'toggle',
    options: [
      { value: true, labelKey: 'yes' },
      { value: false, labelKey: 'no' }
    ]
  }
];
