(function initClipboardApp() {
  const translations = window.OhMyClipboardTranslations;
  const settingsConfig = window.OhMyClipboardSettingsConfig;

  const historyView = document.getElementById('history-view');
  const settingsView = document.getElementById('settings-view');
  const list = document.getElementById('list');
  const clearButton = document.getElementById('clear');
  const openSettingsButton = document.getElementById('open-settings');
  const backButton = document.getElementById('back');
  const historyGroups = document.getElementById('history-groups');
  const settingsGroups = document.getElementById('settings-groups');
  const openLoginSettings = document.getElementById('open-login-settings');
  const settingsFooter = document.querySelector('.settings-footer');
  const historyHeaderCopy = document.getElementById('history-header-copy');
  const historyPanelHeader = document.getElementById('history-panel-header');
  const settingsHeaderCopy = document.getElementById('settings-header-copy');
  const historySearchInput = document.getElementById('history-search');
  const historySearchClear = document.getElementById('history-search-clear');
  const historySidebarButtons = document.querySelectorAll('.history-sidebar__item');
  const toast = document.getElementById('toast');

  const groupOrder = ['general', 'history', 'behavior'];
  const groupedConfig = groupOrder.map((group) => ({
    group,
    items: settingsConfig.filter((item) => item.group === group)
  }));

  const controlRegistry = {};
  const updateUi = {};
  let activeShortcutRecorder = null;
  let currentSettings = {
    theme: 'system',
    textSize: 13,
    language: 'ko'
  };
  let currentHistory = [];
  let currentHistoryQuery = '';
  let currentHistoryFilter = 'all';
  let historyFeedback = null;
  let historyFeedbackTimer = null;
  let toastTimer = null;
  let currentUpdateState = {
    status: 'idle',
    version: null,
    releaseUrl: null,
    message: '',
    canCheck: true,
    canOpen: false
  };

  function getMessages(language = currentSettings.language) {
    return translations[language] || translations.ko;
  }

  function serializeValue(type, value) {
    if (type === 'boolean') {
      return value ? 'true' : 'false';
    }

    return String(value);
  }

  function parseValue(type, value) {
    if (type === 'boolean') {
      return value === 'true';
    }

    if (type === 'number') {
      return Number(value);
    }

    return value;
  }

  function getOptionLabel(option, messages) {
    if (option.label) {
      return option.label;
    }

    return messages.options[option.labelKey];
  }

  function formatMessage(template, replacements) {
    return Object.entries(replacements).reduce(
      (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
      template
    );
  }

  function getHistorySearchableText(item, messages) {
    if (item.kind === 'image') {
      return [messages.imageItem, item.altText || '', item.note || ''].join(' ').trim();
    }

    return [item.text || '', item.note || ''].join(' ').trim();
  }

  function filterHistory(history, query, messages, filter = currentHistoryFilter) {
    const normalizedQuery = query.trim().toLowerCase();
    const filteredByType = filter === 'locked'
      ? history.filter((item) => item.locked)
      : history;

    if (!normalizedQuery) {
      return filteredByType;
    }

    return filteredByType.filter((item) => {
      const searchable = getHistorySearchableText(item, messages).toLowerCase();
      return searchable.includes(normalizedQuery);
    });
  }

  function showHistoryView() {
    historyView.classList.remove('hidden');
    settingsView?.classList.add('hidden');
    historyGroups.classList.remove('hidden');
    settingsGroups.classList.add('hidden');
    clearButton.classList.remove('hidden');
  }

  function showSettingsView() {
    historyView.classList.remove('hidden');
    settingsView?.classList.add('hidden');
    historyGroups.classList.add('hidden');
    settingsGroups.classList.remove('hidden');
    clearButton.classList.add('hidden');
    setActiveSidebar('settings');
  }

  function setActiveSidebar(filter) {
    historySidebarButtons.forEach((button) => {
      button.classList.toggle('active', button.dataset.historyFilter === filter);
    });
  }

  function showToast(message) {
    if (!toast) {
      return;
    }

    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimer = window.setTimeout(() => {
      toast.classList.remove('show');
    }, 1800);
  }

  function setHistoryFeedback(id, type) {
    window.clearTimeout(historyFeedbackTimer);
    historyFeedback = { id, type };
    historyFeedbackTimer = window.setTimeout(() => {
      if (historyFeedback?.id === id && historyFeedback?.type === type) {
        historyFeedback = null;
        renderHistory(currentHistory);
      }
    }, 1200);
  }

  function applyAppearance(settings) {
    document.body.dataset.theme = settings.theme || 'system';
    document.documentElement.style.setProperty('--clipboard-text-size', `${settings.textSize || 13}px`);
  }

  function createNativeField(config) {
    if (config.control === 'shortcut') {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'native-select';
      input.id = config.key;
      return input;
    }

    const select = document.createElement('select');
    select.className = 'native-select';
    select.id = config.key;
    return select;
  }

  function getShortcutDisplayParts(value) {
    if (!value) {
      return [];
    }

    const tokenMap = {
      Command: '⌘',
      Control: '⌃',
      Option: '⌥',
      Shift: '⇧',
      Space: 'Space',
      Enter: '↩',
      Escape: 'Esc',
      Tab: '⇥',
      Backspace: '⌫',
      Delete: '⌦',
      Up: '↑',
      Down: '↓',
      Left: '←',
      Right: '→',
      Home: 'Home',
      End: 'End',
      PageUp: 'PgUp',
      PageDown: 'PgDn'
    };

    return String(value)
      .split('+')
      .map((token) => token.trim())
      .filter(Boolean)
      .map((token) => tokenMap[token] || token.toUpperCase());
  }

  function buildShortcutMarkup(value) {
    return getShortcutDisplayParts(value)
      .map((token) => `<span class="shortcut-keycap">${token}</span>`)
      .join('<span class="shortcut-plus">+</span>');
  }

  function eventToShortcut(event) {
    const modifiers = [];

    if (event.metaKey) modifiers.push('Command');
    if (event.ctrlKey) modifiers.push('Control');
    if (event.altKey) modifiers.push('Option');
    if (event.shiftKey) modifiers.push('Shift');

    const modifierOnlyKeys = new Set([
      'Meta',
      'Control',
      'Alt',
      'Shift'
    ]);

    if (modifierOnlyKeys.has(event.key)) {
      return null;
    }

    let key = '';
    const code = event.code || '';

    if (/^Key[A-Z]$/.test(code)) {
      key = code.slice(-1);
    } else if (/^Digit[0-9]$/.test(code)) {
      key = code.slice(-1);
    } else if (/^F([1-9]|1[0-9]|2[0-4])$/.test(code)) {
      key = code.toUpperCase();
    } else {
      const keyAliasMap = {
        ' ': 'Space',
        Spacebar: 'Space',
        Enter: 'Enter',
        Escape: 'Escape',
        Tab: 'Tab',
        Backspace: 'Backspace',
        Delete: 'Delete',
        ArrowUp: 'Up',
        ArrowDown: 'Down',
        ArrowLeft: 'Left',
        ArrowRight: 'Right',
        Home: 'Home',
        End: 'End',
        PageUp: 'PageUp',
        PageDown: 'PageDown'
      };

      key = keyAliasMap[event.key] || keyAliasMap[code] || '';
    }

    if (!key || !modifiers.length) {
      return null;
    }

    return [...modifiers, key].join('+');
  }

  function createRow(config) {
    const row = document.createElement('div');
    row.className = `setting-row setting-row--${config.control}`;
    row.innerHTML = `
      <div class="setting-copy">
        <div id="${config.key}-label" class="setting-label"></div>
        <div id="${config.key}-desc" class="setting-desc"></div>
      </div>
      <div class="setting-control"></div>
    `;

    const controlSlot = row.querySelector('.setting-control');
    const nativeField = createNativeField(config);
    controlSlot.appendChild(nativeField);

    if (config.control === 'toggle') {
      const toggleWrap = document.createElement('div');
      toggleWrap.className = 'toggle-wrap';
      toggleWrap.innerHTML = '<button class="toggle" type="button" aria-pressed="false"></button>';
      controlSlot.appendChild(toggleWrap);

      controlRegistry[config.key] = {
        config,
        nativeSelect: nativeField,
        kind: 'toggle',
        root: toggleWrap,
        button: toggleWrap.querySelector('.toggle')
      };
      return row;
    }

    if (config.control === 'segmented') {
      const segmented = document.createElement('div');
      segmented.className = 'segmented';
      controlSlot.appendChild(segmented);

      controlRegistry[config.key] = {
        config,
        nativeSelect: nativeField,
        kind: 'segmented',
        root: segmented
      };
      return row;
    }

    if (config.control === 'shortcut') {
      const shortcut = document.createElement('div');
      shortcut.className = 'shortcut-input';
      shortcut.innerHTML = `
        <button class="shortcut-trigger" type="button">
          <span class="shortcut-value"></span>
        </button>
        <button class="shortcut-reset" type="button"></button>
      `;
      controlSlot.appendChild(shortcut);

      controlRegistry[config.key] = {
        config,
        nativeSelect: nativeField,
        kind: 'shortcut',
        root: shortcut,
        trigger: shortcut.querySelector('.shortcut-trigger'),
        value: shortcut.querySelector('.shortcut-value'),
        reset: shortcut.querySelector('.shortcut-reset')
      };
      return row;
    }

    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown';
    dropdown.innerHTML = `
      <button class="dropdown-trigger" type="button">
        <span class="dropdown-value"></span>
        <span class="dropdown-caret">▾</span>
      </button>
      <div class="dropdown-menu"></div>
    `;
    controlSlot.appendChild(dropdown);

    controlRegistry[config.key] = {
      config,
      nativeSelect: nativeField,
      kind: 'dropdown',
      root: dropdown,
      trigger: dropdown.querySelector('.dropdown-trigger'),
      value: dropdown.querySelector('.dropdown-value'),
      menu: dropdown.querySelector('.dropdown-menu')
    };

    return row;
  }

  function createUpdatesSection() {
    const section = document.createElement('section');
    section.className = 'settings-group panel';
    section.innerHTML = `
      <div class="panel__header">
        <div>
          <p id="updates-group-kicker" class="panel__kicker"></p>
          <h2 id="updates-group-title" class="panel__title"></h2>
        </div>
      </div>
      <div class="update-panel">
        <div class="update-panel__copy">
        <div id="update-status-title" class="setting-label"></div>
        <div id="update-status-text" class="setting-desc update-status-text"></div>
      </div>
      <div class="update-actions">
          <button id="check-for-updates" class="action-button action-button--secondary action-button--full" type="button"></button>
          <div id="update-action-row" class="update-action-row hidden">
            <button id="update-primary-action" class="action-button action-button--full" type="button"></button>
            <button id="update-later-action" class="action-button action-button--secondary action-button--full" type="button"></button>
          </div>
          <button id="update-bug-report" class="action-button action-button--secondary action-button--ghost action-button--full" type="button"></button>
        </div>
      </div>
    `;

    updateUi.groupKicker = section.querySelector('#updates-group-kicker');
    updateUi.groupTitle = section.querySelector('#updates-group-title');
    updateUi.statusTitle = section.querySelector('#update-status-title');
    updateUi.statusText = section.querySelector('#update-status-text');
    updateUi.checkButton = section.querySelector('#check-for-updates');
    updateUi.actionRow = section.querySelector('#update-action-row');
    updateUi.primaryButton = section.querySelector('#update-primary-action');
    updateUi.laterButton = section.querySelector('#update-later-action');
    updateUi.reportButton = section.querySelector('#update-bug-report');

    return section;
  }

  function buildSettingsView() {
    const fragment = document.createDocumentFragment();

    groupedConfig.forEach(({ group, items }) => {
      const section = document.createElement('section');
      section.className = 'settings-group panel';
      section.innerHTML = `
        <div class="panel__header">
          <div>
            <p id="${group}-group-kicker" class="panel__kicker"></p>
            <h2 id="${group}-group-title" class="panel__title"></h2>
          </div>
        </div>
      `;

      items.forEach((config) => {
        section.appendChild(createRow(config));
      });

      fragment.appendChild(section);
    });

    fragment.appendChild(createUpdatesSection());

    const actionSection = document.createElement('section');
    actionSection.className = 'settings-group settings-group--action panel';
    actionSection.appendChild(openLoginSettings);
    fragment.appendChild(actionSection);

    settingsGroups.appendChild(fragment);
    if (settingsFooter) {
      settingsFooter.remove();
    }
  }

  function closeAllDropdowns() {
    Object.values(controlRegistry).forEach((control) => {
      if (control.kind === 'dropdown') {
        control.root.classList.remove('open');
      }
    });
  }

  function populateNativeSelect(control, language) {
    if (control.kind === 'shortcut') {
      return;
    }

    const messages = getMessages(language);
    const previousValue = control.nativeSelect.value;

    control.nativeSelect.innerHTML = control.config.options
      .map((option) => {
        const value = serializeValue(control.config.type, option.value);
        const label = getOptionLabel(option, messages);
        return `<option value="${value}">${label}</option>`;
      })
      .join('');

    if (previousValue) {
      control.nativeSelect.value = previousValue;
    }
  }

  function renderDropdown(control) {
    if (control.kind !== 'dropdown') {
      return;
    }

    control.menu.innerHTML = Array.from(control.nativeSelect.options)
      .map((option) => `
        <button
          class="dropdown-option${option.value === control.nativeSelect.value ? ' active' : ''}"
          type="button"
          data-value="${option.value}"
        >
          ${option.textContent}
        </button>
      `)
      .join('');

    control.menu.querySelectorAll('.dropdown-option').forEach((button) => {
      button.addEventListener('click', () => {
        control.nativeSelect.value = button.dataset.value;
        control.nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));
        closeAllDropdowns();
      });
    });

    syncDropdown(control);
  }

  function syncDropdown(control) {
    if (control.kind !== 'dropdown') {
      return;
    }

    const activeOption = Array.from(control.nativeSelect.options).find(
      (option) => option.value === control.nativeSelect.value
    );

    control.value.textContent = activeOption ? activeOption.textContent : '';
    control.menu.querySelectorAll('.dropdown-option').forEach((button) => {
      button.classList.toggle('active', button.dataset.value === control.nativeSelect.value);
    });
  }

  function renderSegmented(control) {
    if (control.kind !== 'segmented') {
      return;
    }

    control.root.style.setProperty('--segment-count', String(control.nativeSelect.options.length));
    control.root.innerHTML = Array.from(control.nativeSelect.options)
      .map((option) => `
        <button
          class="segment-button${option.value === control.nativeSelect.value ? ' active' : ''}"
          type="button"
          data-value="${option.value}"
        >
          ${option.textContent}
        </button>
      `)
      .join('');

    control.root.querySelectorAll('.segment-button').forEach((button) => {
      button.addEventListener('click', () => {
        control.nativeSelect.value = button.dataset.value;
        control.nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
  }

  function setShortcutRecording(control, isRecording) {
    if (isRecording) {
      activeShortcutRecorder = control.config.key;
    } else if (activeShortcutRecorder === control.config.key) {
      activeShortcutRecorder = null;
    }

    control.root.classList.toggle('is-recording', isRecording);
    control.trigger.setAttribute('aria-pressed', isRecording ? 'true' : 'false');
    syncShortcut(control);
  }

  function syncShortcut(control, invalidMessage = '') {
    if (control.kind !== 'shortcut') {
      return;
    }

    const messages = getMessages();
    const isRecording = activeShortcutRecorder === control.config.key;
    const shortcutValue = control.nativeSelect.value || '';

    control.value.innerHTML = shortcutValue
      ? buildShortcutMarkup(shortcutValue)
      : `<span class="shortcut-placeholder">${messages.shortcuts.record}</span>`;

    control.reset.textContent = messages.shortcuts.reset;
    control.reset.disabled = shortcutValue === '';
    control.trigger.title = shortcutValue || messages.shortcuts.hint;

    if (invalidMessage) {
      document.getElementById(`${control.config.key}-desc`).textContent = invalidMessage;
      return;
    }

    document.getElementById(`${control.config.key}-desc`).textContent = isRecording
      ? messages.shortcuts.recording
      : `${messages.descriptions.shortcut} ${messages.shortcuts.hint}`;
  }

  function getUpdateStatusText(updateState, messages) {
    switch (updateState.status) {
      case 'checking':
        return messages.updates.statusChecking;
      case 'available':
        return formatMessage(messages.updates.statusAvailable, {
          version: updateState.version || '?'
        });
      case 'not-available':
        return messages.updates.statusNotAvailable;
      case 'error':
        return updateState.message
          ? `${messages.updates.statusError} ${updateState.message}`
          : messages.updates.statusError;
      default:
        return messages.updates.statusIdle;
    }
  }

  function renderUpdateState(updateState) {
    currentUpdateState = updateState || currentUpdateState;

    if (!updateUi.groupTitle) {
      return;
    }

    const messages = getMessages();
    const actionVisible = currentUpdateState.status === 'available';

    updateUi.groupKicker.textContent = '';
    updateUi.groupTitle.textContent = messages.updates.groupTitle;
    updateUi.statusTitle.textContent = currentUpdateState.version
      ? formatMessage(messages.updates.versionLabel, { version: currentUpdateState.version })
      : messages.updates.summaryTitle;
    updateUi.statusText.textContent = getUpdateStatusText(currentUpdateState, messages);
    updateUi.checkButton.textContent = messages.updates.checkButton;
    updateUi.checkButton.disabled = !currentUpdateState.canCheck;

    updateUi.actionRow.classList.toggle('hidden', !actionVisible);
    updateUi.primaryButton.classList.toggle('hidden', !actionVisible);
    updateUi.laterButton.classList.toggle('hidden', !actionVisible);

    updateUi.primaryButton.textContent = messages.updates.openButton;
    updateUi.laterButton.textContent = messages.updates.laterButton;
    updateUi.reportButton.textContent = messages.updates.reportBugButton;
  }

  function syncSegmented(control) {
    if (control.kind !== 'segmented') {
      return;
    }

    control.root.querySelectorAll('.segment-button').forEach((button) => {
      button.classList.toggle('active', button.dataset.value === control.nativeSelect.value);
    });
  }

  function syncToggle(control) {
    if (control.kind !== 'toggle') {
      return;
    }

    const isOn = control.nativeSelect.value === 'true';
    control.button.classList.toggle('on', isOn);
    control.button.setAttribute('aria-pressed', isOn ? 'true' : 'false');
  }

  function wireControls() {
    Object.values(controlRegistry).forEach((control) => {
      if (control.kind === 'dropdown') {
        control.trigger.addEventListener('click', () => {
          const isOpen = control.root.classList.contains('open');
          closeAllDropdowns();
          if (!isOpen) {
            control.root.classList.add('open');
          }
        });
      }

      if (control.kind === 'shortcut') {
        control.trigger.addEventListener('click', () => {
          const isRecording = activeShortcutRecorder === control.config.key;

          Object.values(controlRegistry).forEach((candidate) => {
            if (candidate.kind === 'shortcut') {
              setShortcutRecording(candidate, false);
            }
          });

          if (!isRecording) {
            setShortcutRecording(control, true);
          }
        });

        control.reset.addEventListener('click', () => {
          control.nativeSelect.value = 'Command+Shift+V';
          control.nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }

      if (control.kind === 'toggle') {
        control.button.addEventListener('click', () => {
          control.nativeSelect.value = control.nativeSelect.value === 'true' ? 'false' : 'true';
          control.nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }

      control.nativeSelect.addEventListener('change', () => {
        updateSetting(control.config.key, parseValue(control.config.type, control.nativeSelect.value));
        syncDropdown(control);
        syncSegmented(control);
        syncToggle(control);
        syncShortcut(control);
      });
    });

    window.addEventListener('keydown', (event) => {
      if (!activeShortcutRecorder) {
        return;
      }

      const control = controlRegistry[activeShortcutRecorder];

      if (!control) {
        activeShortcutRecorder = null;
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (event.key === 'Escape') {
        setShortcutRecording(control, false);
        return;
      }

      const nextShortcut = eventToShortcut(event);

      if (!nextShortcut) {
        syncShortcut(control, getMessages().shortcuts.invalid);
        return;
      }

      setShortcutRecording(control, false);
      control.nativeSelect.value = nextShortcut;
      control.nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }, true);
  }

  function applyLocalizedText(settings) {
    const messages = getMessages(settings.language);

    document.title = messages.appTitle;
    document.documentElement.lang = settings.language;

    document.getElementById('history-kicker').textContent = '';
    document.getElementById('history-title').textContent = messages.historyPanelTitle;
    historyHeaderCopy.classList.remove('hidden');
    historyPanelHeader.classList.add('hidden');
    clearButton.textContent = messages.clear;
    document.getElementById('history-panel-kicker').textContent = '';
    document.getElementById('history-panel-title').textContent = messages.historyPanelTitle;
    historySearchInput.placeholder = messages.searchPlaceholder;
    historySearchClear.setAttribute('aria-label', messages.clearSearch);
    historySidebarButtons.forEach((button) => {
      const filter = button.dataset.historyFilter;
      const label = button.querySelector('.history-sidebar__label');

      if (label && filter && messages.nav[filter]) {
        label.textContent = messages.nav[filter];
      }
    });

    const settingsKicker = document.getElementById('settings-kicker');
    const settingsTitle = document.getElementById('settings-title');
    if (settingsKicker) settingsKicker.textContent = '';
    if (settingsTitle) settingsTitle.textContent = messages.settingsTitle;
    settingsHeaderCopy?.classList.remove('hidden');
    openLoginSettings.textContent = messages.openLoginSettings;

    groupedConfig.forEach(({ group }) => {
      document.getElementById(`${group}-group-kicker`).textContent = '';
      document.getElementById(`${group}-group-title`).textContent = messages.groups[group];
    });

    settingsConfig.forEach((config) => {
      document.getElementById(`${config.key}-label`).textContent = messages.labels[config.key];
      document.getElementById(`${config.key}-desc`).textContent = config.key === 'shortcut'
        ? `${messages.descriptions[config.key]} ${messages.shortcuts.hint}`
        : messages.descriptions[config.key];
    });

    renderUpdateState(currentUpdateState);
  }

  function renderHistory(history) {
    currentHistory = history;
    list.innerHTML = '';

    const messages = getMessages();
    const visibleHistory = filterHistory(history, currentHistoryQuery, messages);

    if (!history.length) {
      list.innerHTML = `<div class="empty-state">${messages.noHistory}</div>`;
      return;
    }

    if (!visibleHistory.length) {
      list.innerHTML = `<div class="empty-state">${messages.noSearchResults}</div>`;
      return;
    }

    visibleHistory.forEach((item) => {
      const row = document.createElement('article');
      row.className = item.locked ? 'history-item history-item--locked' : 'history-item';
      if (historyFeedback?.id === item.id) {
        row.classList.add(`history-item--${historyFeedback.type}`);
      }

      const main = document.createElement('div');
      main.className = 'history-item__main';

      const content = document.createElement('div');
      content.className = 'history-item__content';

      const icon = document.createElement('div');
      icon.className = 'history-item__icon';
      icon.textContent = item.locked ? '🔒' : '⌘';

      const preview = document.createElement('div');
      preview.className = 'history-item__preview';

      const typeLabel = document.createElement('p');
      typeLabel.className = 'history-item__type';
      typeLabel.textContent = historyFeedback?.id === item.id && historyFeedback.type === 'copied'
        ? messages.copiedFeedback
        : item.locked
          ? messages.lockedItem
          : item.kind === 'image'
            ? messages.imageItem
            : messages.textItem;

      const copyButton = document.createElement('button');
      copyButton.className = 'history-item__text';
      copyButton.type = 'button';
      copyButton.setAttribute('aria-label', messages.copyItem);

      if (item.kind === 'image' && item.imageDataUrl) {
        const image = document.createElement('img');
        image.className = 'history-item__image';
        image.src = item.imageDataUrl;
        image.alt = messages.imageAlt;

        copyButton.appendChild(typeLabel);
        copyButton.appendChild(image);
      } else {
        const previewText = item.text.length > 180 ? `${item.text.slice(0, 180)}...` : item.text;
        const value = document.createElement('span');
        value.className = 'history-item__value';
        value.textContent = previewText;
        copyButton.appendChild(value);
        copyButton.appendChild(typeLabel);
      }

      content.appendChild(icon);
      preview.appendChild(copyButton);
      content.appendChild(preview);
      main.appendChild(content);

      const actions = document.createElement('div');
      actions.className = 'history-item__actions';

      const lockButton = document.createElement('button');
      lockButton.className = 'history-item__lock';
      lockButton.type = 'button';
      lockButton.textContent = item.locked ? messages.unlock : messages.lock;

      const deleteButton = document.createElement('button');
      deleteButton.className = 'history-item__delete';
      deleteButton.type = 'button';
      deleteButton.textContent = messages.delete;
      deleteButton.disabled = item.locked;
      deleteButton.title = item.locked ? messages.lockedDeleteHint : messages.delete;

      actions.appendChild(lockButton);
      actions.appendChild(deleteButton);

      row.appendChild(main);
      row.appendChild(actions);

      copyButton.addEventListener('click', async (event) => {
        event.stopPropagation();
        const updatedHistory = await window.clipboardApp.copyText(item.id);
        setHistoryFeedback(item.id, 'copied');
        renderHistory(updatedHistory);
        showToast(messages.copiedToast);
      });

      lockButton.addEventListener('click', async (event) => {
        event.stopPropagation();
        const updatedHistory = await window.clipboardApp.toggleLockItem(item.id);
        const updatedItem = updatedHistory.find((historyItem) => historyItem.id === item.id);
        const feedbackType = updatedItem?.locked ? 'locked' : 'unlocked';
        setHistoryFeedback(item.id, feedbackType);
        renderHistory(updatedHistory);
        showToast(updatedItem?.locked ? messages.lockedFeedback : messages.unlockedFeedback);
      });

      deleteButton.addEventListener('click', async (event) => {
        event.stopPropagation();
        const updatedHistory = await window.clipboardApp.deleteItem(item.id);
        renderHistory(updatedHistory);
      });

      list.appendChild(row);
    });
  }

  function renderSettings(settings) {
    currentSettings = settings;
    applyAppearance(settings);
    applyLocalizedText(settings);

    Object.values(controlRegistry).forEach((control) => {
      populateNativeSelect(control, settings.language);
      control.nativeSelect.value = serializeValue(control.config.type, settings[control.config.key]);
      renderDropdown(control);
      renderSegmented(control);
      syncToggle(control);
      syncSegmented(control);
      syncShortcut(control);
    });

    renderHistory(currentHistory);
  }

  async function updateSetting(key, value) {
    const settings = await window.clipboardApp.updateSetting(key, value);
    renderSettings(settings);
  }

  buildSettingsView();
  wireControls();

  clearButton.addEventListener('click', async () => {
    const history = await window.clipboardApp.clearHistory();
    renderHistory(history);
  });

  historySearchInput.addEventListener('input', () => {
    currentHistoryQuery = historySearchInput.value;
    renderHistory(currentHistory);
  });

  historySearchClear.addEventListener('click', () => {
    historySearchInput.value = '';
    currentHistoryQuery = '';
    historySearchInput.focus();
    renderHistory(currentHistory);
  });

  historySearchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      historySearchInput.value = '';
      currentHistoryQuery = '';
      renderHistory(currentHistory);
    }
  });

  openSettingsButton?.addEventListener('click', showSettingsView);
  historySidebarButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.historyFilter;

      if (filter === 'settings') {
        showSettingsView();
        return;
      }

      currentHistoryFilter = filter || 'all';
      historyGroups.classList.remove('hidden');
      settingsGroups.classList.add('hidden');
      clearButton.classList.remove('hidden');
      setActiveSidebar(currentHistoryFilter);
      renderHistory(currentHistory);
    });
  });
  backButton?.addEventListener('click', showHistoryView);
  openLoginSettings.addEventListener('click', () => {
    window.clipboardApp.openLoginItemsSettings();
  });
  updateUi.checkButton.addEventListener('click', async () => {
    const nextState = await window.clipboardApp.checkForUpdates();
    renderUpdateState(nextState);
  });
  updateUi.primaryButton.addEventListener('click', async () => {
    if (!currentUpdateState.canOpen) {
      return;
    }

    await window.clipboardApp.openUpdateRelease();
  });
  updateUi.laterButton.addEventListener('click', () => {
    renderUpdateState({
      status: 'idle',
      version: null,
      releaseUrl: null,
      message: '',
      canCheck: true,
      canOpen: false
    });
  });
  updateUi.reportButton.addEventListener('click', async () => {
    await window.clipboardApp.openBugReport();
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.dropdown')) {
      closeAllDropdowns();
    }

    if (activeShortcutRecorder && !event.target.closest('.shortcut-input')) {
      const control = controlRegistry[activeShortcutRecorder];
      if (control) {
        setShortcutRecording(control, false);
      }
    }
  });

  window.clipboardApp.onHistoryUpdated(renderHistory);
  window.clipboardApp.onSettingsUpdated(renderSettings);
  window.clipboardApp.onOpenSettingsView(showSettingsView);

  window.clipboardApp.getHistory().then(renderHistory);
  window.clipboardApp.getSettings().then(renderSettings);
  renderUpdateState(currentUpdateState);
})();
