const { createClipboardReader } = require('./clipboard-reader');
const {
  createHistoryItem,
  createImageHistoryItem,
  getClipboardSignature,
  normalizeHistoryItem
} = require('./history-items');

function createClipboardHistory({ clipboard, nativeImage, getSettings, onHistoryChanged }) {
  let clipboardHistory = [];
  let lastText = '';
  let lastClipboardSignature = '';
  let clipboardTimer = null;
  const clipboardReader = createClipboardReader({ clipboard, nativeImage });

  function emitHistory() {
    onHistoryChanged(clipboardHistory);
  }

  function getHistory() {
    clipboardHistory = clipboardHistory.map(normalizeHistoryItem);
    return clipboardHistory;
  }

  function syncClipboardBaseline() {
    const image = clipboardReader.readClipboardImage();

    if (image && !image.isEmpty()) {
      lastText = '';
      lastClipboardSignature = `image:${image.toDataURL()}`;
      return;
    }

    const text = clipboardReader.readClipboardText();

    if (text) {
      lastText = text;
      lastClipboardSignature = `text:${text}`;
      return;
    }

    lastText = '';
    lastClipboardSignature = '';
  }

  function shouldSaveClipboardText(value) {
    const settings = getSettings();

    if (settings.pauseTracking) return false;
    if (!value) return false;
    if (value.length < settings.minTextLength) return false;
    if (value.length > settings.maxTextLength) return false;
    if (settings.ignoreDuplicates && value === lastText) return false;

    return true;
  }

  function trimHistory() {
    const settings = getSettings();
    const lockedItems = clipboardHistory.filter((item) => item.locked);
    const unlockedItems = clipboardHistory.filter((item) => !item.locked);
    const remainCount = Math.max(settings.maxHistoryItems - lockedItems.length, 0);

    clipboardHistory = [
      ...lockedItems,
      ...unlockedItems.slice(0, remainCount)
    ];
  }

  function addClipboardText(text) {
    const value = text.trim();

    if (!value) return;

    const existingItem = clipboardHistory.find(
      (item) => item.kind !== 'image' && item.text === value
    );

    if (existingItem) {
      lastText = value;
      lastClipboardSignature = `text:${value}`;

      clipboardHistory = [
        existingItem,
        ...clipboardHistory.filter((item) => item.id !== existingItem.id)
      ];

      trimHistory();
      emitHistory();
      return;
    }

    if (!shouldSaveClipboardText(value)) return;

    lastText = value;
    lastClipboardSignature = `text:${value}`;

    clipboardHistory = [
      createHistoryItem(value),
      ...clipboardHistory
    ];

    trimHistory();
    emitHistory();
  }

  function addClipboardImage(image) {
    if (!image || image.isEmpty()) {
      return;
    }

    const imageDataUrl = image.toDataURL();

    if (!imageDataUrl || lastClipboardSignature === `image:${imageDataUrl}`) {
      return;
    }

    const existingItem = clipboardHistory.find(
      (item) => item.kind === 'image' && item.imageDataUrl === imageDataUrl
    );

    if (existingItem) {
      lastText = '';
      lastClipboardSignature = `image:${imageDataUrl}`;

      clipboardHistory = [
        existingItem,
        ...clipboardHistory.filter((item) => item.id !== existingItem.id)
      ];

      trimHistory();
      emitHistory();
      return;
    }

    lastText = '';
    lastClipboardSignature = `image:${imageDataUrl}`;

    clipboardHistory = [
      createImageHistoryItem(imageDataUrl),
      ...clipboardHistory
    ];

    trimHistory();
    emitHistory();
  }

  function startWatching() {
    clipboardTimer = setInterval(() => {
      const image = clipboardReader.readClipboardImage();
      if (image && !image.isEmpty()) {
        addClipboardImage(image);
        return;
      }

      const text = clipboardReader.readClipboardText();
      if (text) {
        addClipboardText(text);
      }
    }, 800);
  }

  function stopWatching() {
    if (clipboardTimer) {
      clearInterval(clipboardTimer);
      clipboardTimer = null;
    }
  }

  function copyItem(id) {
    const item = clipboardHistory.find((historyItem) => historyItem.id === id);

    if (!item) {
      return clipboardHistory;
    }

    if (item.kind === 'image' && item.imageDataUrl) {
      clipboard.writeImage(nativeImage.createFromDataURL(item.imageDataUrl));
      lastText = '';
    } else {
      const text = String(item.text || '');
      clipboard.writeText(text);
      lastText = text;
    }

    lastClipboardSignature = getClipboardSignature(item);

    if (!item.locked) {
      const lockedItems = clipboardHistory.filter((historyItem) => historyItem.locked);
      const unlockedItems = clipboardHistory.filter(
        (historyItem) => !historyItem.locked && historyItem.id !== id
      );

      clipboardHistory = [
        ...lockedItems,
        item,
        ...unlockedItems
      ];
    }

    emitHistory();
    return clipboardHistory;
  }

  function deleteItem(id) {
    const target = clipboardHistory.find((item) => item.id === id);

    if (!target || target.locked) {
      return clipboardHistory;
    }

    clipboardHistory = clipboardHistory.filter((item) => item.id !== id);
    emitHistory();
    return clipboardHistory;
  }

  function toggleLockItem(id) {
    clipboardHistory = clipboardHistory.map((item) => {
      if (item.id !== id) return item;

      return {
        ...item,
        locked: !item.locked
      };
    });

    trimHistory();
    emitHistory();
    return clipboardHistory;
  }

  function clearHistory() {
    clipboardHistory = clipboardHistory.filter((item) => item.locked);
    syncClipboardBaseline();
    emitHistory();
    return clipboardHistory;
  }

  return {
    clearHistory,
    copyItem,
    deleteItem,
    getHistory,
    syncClipboardBaseline,
    startWatching,
    stopWatching,
    toggleLockItem,
    trimHistory
  };
}

module.exports = {
  createClipboardHistory
};
