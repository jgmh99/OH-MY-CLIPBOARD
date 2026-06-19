const { defaultSettings } = require('./config');
const { sendRendererState } = require('./renderer-state');

function createShortcutController({
  globalShortcut,
  settingsStore,
  toggleWindow,
  getWindow,
  getHistory
}) {
  function registerShortcut() {
    globalShortcut.unregisterAll();

    const settings = settingsStore.get();
    if (!settings.shortcut) return;

    const success = globalShortcut.register(settings.shortcut, () => {
      toggleWindow();
    });

    if (!success && settings.shortcut !== defaultSettings.shortcut) {
      const nextSettings = settingsStore.set({
        shortcut: defaultSettings.shortcut
      });
      globalShortcut.register(nextSettings.shortcut, () => {
        toggleWindow();
      });
      sendRendererState(getWindow(), nextSettings, getHistory());
    }

    console.log('Shortcut registered:', settingsStore.get().shortcut, success);
  }

  function unregisterAll() {
    globalShortcut.unregisterAll();
  }

  return {
    registerShortcut,
    unregisterAll
  };
}

module.exports = {
  createShortcutController
};
