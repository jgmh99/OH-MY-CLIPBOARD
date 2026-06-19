function createHistoryItem(text) {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    kind: 'text',
    text,
    imageDataUrl: '',
    locked: false,
    createdAt: Date.now()
  };
}

function createImageHistoryItem(imageDataUrl) {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    kind: 'image',
    text: '',
    imageDataUrl,
    locked: false,
    createdAt: Date.now()
  };
}

function normalizeHistoryItem(item) {
  if (typeof item === 'string') {
    return createHistoryItem(item);
  }

  return {
    id: item.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    kind: item.kind === 'image' ? 'image' : 'text',
    text: item.text || '',
    imageDataUrl: item.imageDataUrl || '',
    locked: Boolean(item.locked),
    createdAt: item.createdAt || Date.now()
  };
}

function getClipboardSignature(item) {
  if (!item) {
    return '';
  }

  if (item.kind === 'image') {
    return `image:${item.imageDataUrl || ''}`;
  }

  return `text:${item.text || ''}`;
}

module.exports = {
  createHistoryItem,
  createImageHistoryItem,
  getClipboardSignature,
  normalizeHistoryItem
};
