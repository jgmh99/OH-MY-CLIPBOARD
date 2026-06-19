export function serializeValue(type, value) {
  if (type === 'boolean') return value ? 'true' : 'false';
  return String(value);
}

export function parseValue(type, value) {
  if (type === 'boolean') return value === 'true';
  if (type === 'number') return Number(value);
  return value;
}

export function getOptionLabel(option, messages) {
  return option.label || messages.options[option.labelKey];
}
