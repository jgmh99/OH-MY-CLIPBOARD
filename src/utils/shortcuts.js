export function getShortcutDisplayParts(value) {
  if (!value) return [];

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

export function eventToShortcut(event) {
  const modifiers = [];

  if (event.metaKey) modifiers.push('Command');
  if (event.ctrlKey) modifiers.push('Control');
  if (event.altKey) modifiers.push('Option');
  if (event.shiftKey) modifiers.push('Shift');

  if (new Set(['Meta', 'Control', 'Alt', 'Shift']).has(event.key)) {
    return null;
  }

  const code = event.code || '';
  let key = '';

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

  if (!key || !modifiers.length) return null;
  return [...modifiers, key].join('+');
}
