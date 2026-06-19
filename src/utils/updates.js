import { formatMessage } from './messages';

export function getUpdateStatusText(updateState, messages) {
  switch (updateState.status) {
    case 'checking':
      return messages.updates.statusChecking;
    case 'available':
      return formatMessage(messages.updates.statusAvailable, {
        version: updateState.version || '?'
      });
    case 'not-available':
      return messages.updates.statusNotAvailable;
    case 'error':
      return updateState.message
        ? `${messages.updates.statusError} ${updateState.message}`
        : messages.updates.statusError;
    default:
      return messages.updates.statusIdle;
  }
}
