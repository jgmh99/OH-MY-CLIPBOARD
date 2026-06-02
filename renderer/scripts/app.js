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

  const groupOrder = ['general', 'history', 'behavior'];
  const groupedConfig = groupOrder.map((group) => ({
    group,
    items: settingsConfig.filter((item) => item.group === group)
  }));

  const controlRegistry = {};
  let currentSettings = {
    theme: 'system',
    textSize: 13,
    language: 'ko'
  };
  let currentHistory = [];

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
  }

  function renderHistory(history) {
    currentHistory = history;
    list.innerHTML = '';

    const messages = getMessages();
    if (!history.length) {
      list.innerHTML = `<div class="empty-state">${messages.noHistory}</div>`;
      return;
    }

    history.forEach((item) => {
      const row = document.createElement('article');
      row.className = item.locked ? 'history-item history-item--locked' : 'history-item';
      row.innerHTML = `
        <button class="history-item__lock" type="button">${item.locked ? '🔒' : '🔓'}</button>
        <button class="history-item__text" type="button"></button>
        <button class="history-item__delete" type="button">×</button>
      `;

      row.querySelector('.history-item__text').textContent =
        item.text.length > 180 ? `${item.text.slice(0, 180)}...` : item.text;

      row.querySelector('.history-item__lock').addEventListener('click', async (event) => {
        event.stopPropagation();
        const updatedHistory = await window.clipboardApp.toggleLockItem(item.id);
        renderHistory(updatedHistory);
      });

      row.querySelector('.history-item__text').addEventListener('click', async () => {
        const updatedHistory = await window.clipboardApp.copyText(item.id);
        renderHistory(updatedHistory);
      });

      row.querySelector('.history-item__delete').addEventListener('click', async (event) => {
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

  openSettingsButton.addEventListener('click', showSettingsView);
  backButton.addEventListener('click', showHistoryView);
  openLoginSettings.addEventListener('click', () => {
    window.clipboardApp.openLoginItemsSettings();
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
})();
