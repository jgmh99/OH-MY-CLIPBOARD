import { getShortcutDisplayParts } from '../utils/shortcuts';

export default function ShortcutControl({ value, messages, isRecording, onSetRecording, onChange }) {
  const parts = getShortcutDisplayParts(value);

  return (
    <div className={`shortcut-input ${isRecording ? 'is-recording' : ''}`}>
      <button
        className="shortcut-trigger"
        type="button"
        title={value || messages.shortcuts.hint}
        aria-pressed={isRecording ? 'true' : 'false'}
        onClick={() => onSetRecording(!isRecording)}
      >
        <span className="shortcut-value">
          {parts.length ? parts.map((part, index) => (
            <span key={`${part}-${index}`} className="shortcut-keycap">{part}</span>
          )) : (
            <span className="shortcut-placeholder">{messages.shortcuts.record}</span>
          )}
        </span>
      </button>
      <button
        className="shortcut-reset"
        type="button"
        disabled={value === ''}
        onClick={() => onChange('Command+Shift+V')}
      >
        {messages.shortcuts.reset}
      </button>
    </div>
  );
}
