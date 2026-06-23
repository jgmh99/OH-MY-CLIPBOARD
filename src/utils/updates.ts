import { formatMessage } from './messages';
import type { MessageCatalog, UpdateState } from '../types';

export function getUpdateStatusText(updateState: UpdateState, messages: MessageCatalog): string {
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
