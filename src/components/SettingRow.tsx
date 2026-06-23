import { useState } from 'react';
import type { CSSProperties } from 'react';
import ShortcutControl from './ShortcutControl';
import { getOptionLabel, parseValue, serializeValue } from '../utils/settings';
import type { MessageCatalog, SettingConfig, SettingValue } from '../types';

type SegmentStyle = CSSProperties & {
  '--segment-count': string;
};

type SettingRowProps = {
  config: SettingConfig;
  value: SettingValue | null;
  messages: MessageCatalog;
  isRecording: boolean;
  invalidShortcutMessage: string;
  onChange: (value: SettingValue) => void;
  onSetRecording: (isRecording: boolean) => void;
};

export default function SettingRow({
  config,
  value,
  messages,
  isRecording,
  invalidShortcutMessage,
  onChange,
  onSetRecording
}: SettingRowProps) {
  const [open, setOpen] = useState(false);
  const options = config.options.map((option) => ({
    ...option,
    serializedValue: serializeValue(config.type, option.value),
    label: getOptionLabel(option, messages)
  }));
  const serializedValue = serializeValue(config.type, value);
  const activeOption = options.find((option) => option.serializedValue === serializedValue);
  const description = invalidShortcutMessage ||
    (config.key === 'shortcut'
      ? `${messages.descriptions[config.key]} ${messages.shortcuts.hint}`
      : messages.descriptions[config.key]);

  function commitValue(nextSerializedValue: string) {
    onChange(parseValue(config.type, nextSerializedValue));
    setOpen(false);
  }

  return (
    <div className={`setting-row setting-row--${config.control}`}>
      <div className="setting-copy">
        <div id={`${config.key}-label`} className="setting-label">{messages.labels[config.key]}</div>
        <div id={`${config.key}-desc`} className="setting-desc">
          {isRecording ? messages.shortcuts.recording : description}
        </div>
      </div>
      <div className="setting-control">
        {config.control === 'toggle' && (
          <div className="toggle-wrap">
            <button
              className={`toggle ${value ? 'on' : ''}`}
              type="button"
              aria-pressed={value ? 'true' : 'false'}
              onClick={() => onChange(!value)}
            />
          </div>
        )}
        {config.control === 'segmented' && (
          <div className="segmented" style={{ '--segment-count': String(options.length) } as SegmentStyle}>
            {options.map((option) => (
              <button
                key={option.serializedValue}
                className={`segment-button ${option.serializedValue === serializedValue ? 'active' : ''}`}
                type="button"
                onClick={() => commitValue(option.serializedValue)}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
        {config.control === 'dropdown' && (
          <div className={`dropdown ${open ? 'open' : ''}`}>
            <button className="dropdown-trigger" type="button" onClick={() => setOpen(!open)}>
              <span className="dropdown-value">{activeOption?.label || ''}</span>
              <span className="dropdown-caret">▾</span>
            </button>
            <div className="dropdown-menu">
              {options.map((option) => (
                <button
                  key={option.serializedValue}
                  className={`dropdown-option ${option.serializedValue === serializedValue ? 'active' : ''}`}
                  type="button"
                  onClick={() => commitValue(option.serializedValue)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
        {config.control === 'shortcut' && (
          <ShortcutControl
            value={String(value || '')}
            messages={messages}
            isRecording={isRecording}
            onSetRecording={onSetRecording}
            onChange={onChange}
          />
        )}
      </div>
    </div>
  );
}
