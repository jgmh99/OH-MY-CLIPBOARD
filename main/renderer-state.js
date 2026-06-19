function sendRendererState(win, settings, history) {
  if (!win) {
    return;
  }

  win.webContents.send('settings-updated', settings);
  win.webContents.send('clipboard-history-updated', history);
}

function sendHistory(win, history) {
  if (win) {
    win.webContents.send('clipboard-history-updated', history);
  }
}

module.exports = {
  sendHistory,
  sendRendererState
};
