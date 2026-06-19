const { Menu, nativeImage } = require('electron');
const { TRAY_ICON_PATH, trayTranslations } = require('./config');

function createTrayIcon() {
  const icon = nativeImage.createFromPath(TRAY_ICON_PATH);

  if (icon.isEmpty()) {
    return nativeImage.createFromDataURL(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4////fwAJ+wP9KobjigAAAABJRU5ErkJggg=='
    );
  }

  const resized = icon.resize({
    width: 16,
    height: 16
  });

  resized.setTemplateImage(true);
  return resized;
}

function createTrayController({
  app,
  Tray,
  settingsStore,
  showWindow,
  openSettingsView,
  toggleWindow,
  updateSetting
}) {
  let tray = null;
  let trayMenu = null;

  function getMessages() {
    const language = settingsStore.get().language;
    return trayTranslations[language] || trayTranslations.ko;
  }

  function updateTrayMenu() {
    if (!tray) return;

    const messages = getMessages();
    const settings = settingsStore.get();

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
          openSettingsView();
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
    return tray;
  }

  function destroyTray() {
    if (tray) {
      tray.destroy();
      tray = null;
    }
  }

  return {
    createTray,
    destroyTray,
    getTray: () => tray,
    updateTrayMenu
  };
}

module.exports = {
  createTrayController
};
