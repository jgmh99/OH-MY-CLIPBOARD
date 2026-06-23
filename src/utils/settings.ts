import type { MessageCatalog, SettingConfig, SettingOption, SettingValue } from '../types';

export function serializeValue(type: SettingConfig['type'], value: SettingValue | null | undefined): string {
  if (type === 'boolean') return value ? 'true' : 'false';
  return String(value);
}

export function parseValue(type: SettingConfig['type'], value: string): SettingValue {
  if (type === 'boolean') return value === 'true';
  if (type === 'number') return Number(value);
  return value;
}

export function getOptionLabel(option: SettingOption, messages: MessageCatalog): string {
  if (option.label) {
    return option.label;
  }

  return option.labelKey ? messages.options[option.labelKey] : '';
}
