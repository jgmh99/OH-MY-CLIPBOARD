import { formatMessage } from '../utils/messages';
import { getUpdateStatusText } from '../utils/updates';
import type { MessageCatalog, UpdateState } from '../types';

type UpdateSectionProps = {
  messages: MessageCatalog;
  updateState: UpdateState;
  onCheckUpdates: () => void;
  onOpenUpdate: () => void;
  onDismissUpdate: () => void;
  onReportBug: () => void;
};

export default function UpdateSection({
  messages,
  updateState,
  onCheckUpdates,
  onOpenUpdate,
  onDismissUpdate,
  onReportBug
}: UpdateSectionProps) {
  const actionVisible = updateState.status === 'available';

  return (
    <section className="settings-group panel">
      <div className="panel__header">
        <div>
          <p className="panel__kicker" />
          <h2 className="panel__title">{messages.updates.groupTitle}</h2>
        </div>
      </div>
      <div className="update-panel">
        <div className="update-panel__copy">
          <div className="setting-label">
            {updateState.version
              ? formatMessage(messages.updates.versionLabel, { version: updateState.version })
              : messages.updates.summaryTitle}
          </div>
          <div className="setting-desc update-status-text">
            {getUpdateStatusText(updateState, messages)}
          </div>
        </div>
        <div className="update-actions">
          <button
            className="action-button action-button--secondary action-button--full"
            type="button"
            disabled={!updateState.canCheck}
            onClick={onCheckUpdates}
          >
            {messages.updates.checkButton}
          </button>
          <div className={`update-action-row ${actionVisible ? '' : 'hidden'}`}>
            <button className="action-button action-button--full" type="button" onClick={onOpenUpdate}>
              {messages.updates.openButton}
            </button>
            <button
              className="action-button action-button--secondary action-button--full"
              type="button"
              onClick={onDismissUpdate}
            >
              {messages.updates.laterButton}
            </button>
          </div>
          <button
            className="action-button action-button--secondary action-button--ghost action-button--full"
            type="button"
            onClick={onReportBug}
          >
            {messages.updates.reportBugButton}
          </button>
        </div>
      </div>
    </section>
  );
}
