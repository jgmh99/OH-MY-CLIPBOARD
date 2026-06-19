const fs = require('fs');
const path = require('path');
const { IMAGE_FILE_EXTENSIONS } = require('./config');

function createClipboardReader({ clipboard, nativeImage }) {
  function readClipboardTextFormat(format) {
    try {
      return clipboard.read(format).trim();
    } catch {
      return '';
    }
  }

  function decodeClipboardBuffer(format) {
    try {
      const buffer = clipboard.readBuffer(format);

      if (!buffer || !buffer.length) {
        return '';
      }

      return buffer
        .toString('utf8')
        .replace(/\0/g, '\n')
        .trim();
    } catch {
      return '';
    }
  }

  function getImagePathFromClipboardText(text) {
    const normalizedText = text.replace(/\0/g, '\n');
    const fileUrls = normalizedText.match(/file:\/\/[^\s<>"']+/g) || [];
    const absolutePaths = normalizedText.match(/\/[^\n\r<>"']+?\.(?:png|jpe?g|gif|webp|bmp|tiff?|heic|heif|ico)/gi) || [];

    const candidates = [
      ...fileUrls,
      ...absolutePaths,
      ...normalizedText
        .replace(/<[^>]+>/g, '\n')
        .split(/\r?\n/)
    ]
      .map((candidate) => candidate.trim())
      .filter(Boolean)
      .map((candidate) => {
        if (candidate.startsWith('file://')) {
          try {
            return decodeURIComponent(new URL(candidate).pathname);
          } catch {
            return candidate;
          }
        }

        return candidate;
      });

    return candidates.find((candidate) => {
      const ext = path.extname(candidate).toLowerCase();
      return IMAGE_FILE_EXTENSIONS.has(ext) && fs.existsSync(candidate);
    }) || '';
  }

  function readClipboardImageFile() {
    const fileText = [
      readClipboardTextFormat('public.file-url'),
      readClipboardTextFormat('public.url'),
      decodeClipboardBuffer('public.file-url'),
      decodeClipboardBuffer('public.url'),
      decodeClipboardBuffer('NSFilenamesPboardType'),
      clipboard.readText()
    ].find(Boolean) || '';

    const imagePath = getImagePathFromClipboardText(fileText);

    if (!imagePath) {
      return null;
    }

    const image = nativeImage.createFromPath(imagePath);
    return image.isEmpty() ? null : image;
  }

  function readClipboardImage() {
    const fileImage = readClipboardImageFile();

    if (fileImage && !fileImage.isEmpty()) {
      return fileImage;
    }

    const image = clipboard.readImage();

    if (image.isEmpty()) {
      return null;
    }

    return image;
  }

  function readClipboardText() {
    const text = clipboard.readText().trim();

    if (text) {
      return text;
    }

    const html = clipboard.readHTML().trim();

    if (html) {
      const plainText = html
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (plainText) {
        return plainText;
      }
    }

    const rtf = clipboard.readRTF().trim();

    if (rtf) {
      const plainText = rtf
        .replace(/\\par[d]?/gi, '\n')
        .replace(/\\tab/gi, '\t')
        .replace(/\\'[0-9a-f]{2}/gi, ' ')
        .replace(/\\[a-z]+\d* ?/gi, ' ')
        .replace(/[{}]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (plainText) {
        return plainText;
      }
    }

    try {
      const buffer = clipboard.readBuffer('public.utf8-plain-text');
      const bufferText = buffer.toString('utf8').trim();

      if (bufferText) {
        return bufferText;
      }
    } catch {
      // Ignore buffer fallback failures.
    }

    return '';
  }

  return {
    readClipboardImage,
    readClipboardText
  };
}

module.exports = {
  createClipboardReader
};
