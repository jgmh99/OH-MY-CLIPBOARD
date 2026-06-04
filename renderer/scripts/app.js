(function initClipboardApp() {
  const translations = window.OhMyClipboardTranslations;
  const settingsConfig = window.OhMyClipboardSettingsConfig;

  const historyView = document.getElementById('history-view');
  const settingsView = document.getElementById('settings-view');
  const list = document.getElementById('list');
  const clearButton = document.getElementById('clear');
  const openSettingsButton = document.getElementById('open-settings');
  const backButton = document.getElementById('back');
  const settingsGroups = document.getElementById('settings-groups');
  const openLoginSettings = document.getElementById('open-login-settings');
  const settingsFooter = document.querySelector('.settings-footer');
  const historyHeaderCopy = document.getElementById('history-header-copy');
  const historyPanelHeader = document.getElementById('history-panel-header');
  const settingsHeaderCopy = document.getElementById('settings-header-copy');
  const historySearchInput = document.getElementById('history-search');
  const historySearchClear = document.getElementById('history-search-clear');

  const groupOrder = ['general', 'history', 'behavior'];
  const groupedConfig = groupOrder.map((group) => ({
    group,
    items: settingsConfig.filter((item) => item.group === group)
  }));

  const controlRegistry = {};
  const updateUi = {};
  let currentSettings = {
    theme: 'system',
    textSize: 13,
    language: 'ko'
  };
  let currentHistory = [];
  let currentHistoryQuery = '';
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

  function filterHistory(history, query, messages) {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return history;
    }

    return history.filter((item) => {
      const searchable = getHistorySearchableText(item, messages).toLowerCase();
      return searchable.includes(normalizedQuery);
    });
  }

  function showHistoryView() {
    historyView.classList.remove('hidden');
    settingsView.classList.add('hidden');
  }

  function showSettingsView() {
    historyView.classList.add('hidden');
    settingsView.classList.remove('hidden');
  }

  function applyAppearance(settings) {
    document.body.dataset.theme = settings.theme || 'system';
    document.documentElement.style.setProperty('--clipboard-text-size', `${settings.textSize || 13}px`);
  }

  function createNativeSelect(config) {
    const select = document.createElement('select');
    select.className = 'native-select';
    select.id = config.key;
    return select;
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
    const nativeSelect = createNativeSelect(config);
    controlSlot.appendChild(nativeSelect);

    if (config.control === 'toggle') {
      const toggleWrap = document.createElement('div');
      toggleWrap.className = 'toggle-wrap';
      toggleWrap.innerHTML = '<button class="toggle" type="button" aria-pressed="false"></button>';
      controlSlot.appendChild(toggleWrap);

      controlRegistry[config.key] = {
        config,
        nativeSelect,
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
        nativeSelect,
        kind: 'segmented',
        root: segmented
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
      nativeSelect,
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
      });
    });
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

    document.getElementById('settings-kicker').textContent = '';
    document.getElementById('settings-title').textContent = messages.settingsTitle;
    settingsHeaderCopy.classList.remove('hidden');
    openLoginSettings.textContent = messages.openLoginSettings;

    groupedConfig.forEach(({ group }) => {
      document.getElementById(`${group}-group-kicker`).textContent = '';
      document.getElementById(`${group}-group-title`).textContent = messages.groups[group];
    });

    settingsConfig.forEach((config) => {
      document.getElementById(`${config.key}-label`).textContent = messages.labels[config.key];
      document.getElementById(`${config.key}-desc`).textContent = messages.descriptions[config.key];
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

      const main = document.createElement('div');
      main.className = 'history-item__main';

      const content = document.createElement('div');
      content.className = 'history-item__content';

      const preview = document.createElement('div');
      preview.className = 'history-item__preview';

      const typeLabel = document.createElement('p');
      typeLabel.className = 'history-item__type';
      typeLabel.textContent = item.kind === 'image' ? messages.imageItem : messages.textItem;

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
        copyButton.appendChild(typeLabel);
        copyButton.appendChild(value);
      }

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
        renderHistory(updatedHistory);
      });

      lockButton.addEventListener('click', async (event) => {
        event.stopPropagation();
        const updatedHistory = await window.clipboardApp.toggleLockItem(item.id);
        renderHistory(updatedHistory);
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

  openSettingsButton.addEventListener('click', showSettingsView);
  backButton.addEventListener('click', showHistoryView);
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
  });

  window.clipboardApp.onHistoryUpdated(renderHistory);
  window.clipboardApp.onSettingsUpdated(renderSettings);
  window.clipboardApp.onOpenSettingsView(showSettingsView);

  window.clipboardApp.getHistory().then(renderHistory);
  window.clipboardApp.getSettings().then(renderSettings);
  renderUpdateState(currentUpdateState);
})();
