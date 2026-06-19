const { APP_ICON_PATH, PRELOAD_PATH, RENDERER_INDEX_PATH } = require('./config');
const { sendRendererState } = require('./renderer-state');

function createWindowManager({
  app,
  BrowserWindow,
  screen,
  getTray,
  settingsStore,
  getHistory
}) {
  let win = null;
  let isProgrammaticWindowMove = false;

  function createWindow() {
    win = new BrowserWindow({
      width: 760,
      height: 620,
      show: false,
      frame: false,
      resizable: false,
      movable: true,
      fullscreenable: false,
      skipTaskbar: true,
      alwaysOnTop: true,
      icon: APP_ICON_PATH,
      webPreferences: {
        preload: PRELOAD_PATH,
        contextIsolation: true,
        nodeIntegration: false
      }
    });

    if (!app.isPackaged && process.env.VITE_DEV_SERVER_URL) {
      win.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
      win.loadFile(RENDERER_INDEX_PATH);
    }

    if (!app.isPackaged && process.env.OPEN_DEVTOOLS === '1') {
      win.webContents.openDevTools({ mode: 'detach' });
    }

    win.on('blur', () => {
      if (settingsStore.get().autoHideOnBlur) {
        win.hide();
      }
    });

    win.on('move', () => {
      const tray = getTray();
      if (!tray || isProgrammaticWindowMove || !win.isVisible()) {
        return;
      }

      const windowBounds = win.getBounds();
      const nextWindowX = Math.round(windowBounds.x);
      const nextWindowY = Math.round(windowBounds.y);
      const settings = settingsStore.get();

      if (
        nextWindowX === settings.windowX &&
        nextWindowY === settings.windowY
      ) {
        return;
      }

      const nextSettings = settingsStore.set({
        windowX: nextWindowX,
        windowY: nextWindowY
      });
      sendRendererState(win, nextSettings, getHistory());
    });

    return win;
  }

  function getTrayAnchorPosition(windowBounds) {
    const tray = getTray();
    const trayBounds = tray.getBounds();

    return {
      x: Math.round(
        trayBounds.x +
          trayBounds.width / 2 -
          windowBounds.width / 2
      ),
      y: Math.round(
        trayBounds.y +
          trayBounds.height +
          6
      )
    };
  }

  function clampWindowPosition(position, windowBounds) {
    const display = screen.getDisplayMatching({
      x: position.x,
      y: position.y,
      width: windowBounds.width,
      height: windowBounds.height
    });
    const workArea = display.workArea;

    return {
      x: Math.min(
        Math.max(position.x, workArea.x),
        workArea.x + workArea.width - windowBounds.width
      ),
      y: Math.min(
        Math.max(position.y, workArea.y),
        workArea.y + workArea.height - windowBounds.height
      )
    };
  }

  function showWindow() {
    const tray = getTray();
    if (!win || !tray) return;

    const settings = settingsStore.get();
    const windowBounds = win.getBounds();
    const hasSavedWindowPosition =
      Number.isFinite(settings.windowX) &&
      Number.isFinite(settings.windowY);
    const { x, y } = hasSavedWindowPosition
      ? { x: settings.windowX, y: settings.windowY }
      : getTrayAnchorPosition(windowBounds);
    const position = clampWindowPosition({ x, y }, windowBounds);

    isProgrammaticWindowMove = true;
    win.setPosition(position.x, position.y, false);
    setTimeout(() => {
      isProgrammaticWindowMove = false;
    }, 0);
    win.show();
    win.focus();

    sendRendererState(win, settingsStore.get(), getHistory());
  }

  function toggleWindow() {
    if (!win) return;

    if (win.isVisible()) {
      win.hide();
      return;
    }

    showWindow();
  }

  function openSettingsView() {
    showWindow();
    win.webContents.send('open-settings-view');
  }

  return {
    createWindow,
    getWindow: () => win,
    openSettingsView,
    showWindow,
    toggleWindow
  };
}

module.exports = {
  createWindowManager
};
