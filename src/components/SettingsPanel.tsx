import { useMemo } from 'react';
import SettingRow from './SettingRow';
import UpdateSection from './UpdateSection';
import { settingsConfig } from '../data/settings-config';
import type { MessageCatalog, SettingConfig, SettingValue, Settings, UpdateState } from '../types';

const groupOrder: SettingConfig['group'][] = ['general', 'history', 'behavior'];

type SettingsPanelProps = {
  settings: Settings;
  messages: MessageCatalog;
  updateState: UpdateState;
  recordingKey: keyof Settings | null;
  invalidShortcutMessage: string;
  onChangeSetting: (key: keyof Settings, value: SettingValue) => void;
  onSetRecordingKey: (key: keyof Settings | null) => void;
  onCheckUpdates: () => void;
  onOpenUpdate: () => void;
  onDismissUpdate: () => void;
  onReportBug: () => void;
  onOpenLoginSettings: () => void;
};

export default function SettingsPanel({
  settings,
  messages,
  updateState,
  recordingKey,
  invalidShortcutMessage,
  onChangeSetting,
  onSetRecordingKey,
  onCheckUpdates,
  onOpenUpdate,
  onDismissUpdate,
  onReportBug,
  onOpenLoginSettings
}: SettingsPanelProps) {
  const groupedConfig = useMemo(() => groupOrder.map((group) => ({
    group,
    items: settingsConfig.filter((item) => item.group === group)
  })), []);

  return (
    <div id="settings-groups" className="settings-groups settings-tab-panel">
      {groupedConfig.map(({ group, items }) => (
        <section key={group} className="settings-group panel">
          <div className="panel__header">
            <div>
              <p id={`${group}-group-kicker`} className="panel__kicker" />
              <h2 id={`${group}-group-title`} className="panel__title">{messages.groups[group]}</h2>
            </div>
          </div>
          {items.map((config) => (
            <SettingRow
              key={config.key}
              config={config}
              value={settings[config.key]}
              messages={messages}
              isRecording={recordingKey === config.key}
              invalidShortcutMessage={recordingKey === config.key ? invalidShortcutMessage : ''}
              onChange={(value) => onChangeSetting(config.key, value)}
              onSetRecording={(isRecording) => onSetRecordingKey(isRecording ? config.key : null)}
            />
          ))}
        </section>
      ))}
      <UpdateSection
        messages={messages}
        updateState={updateState}
        onCheckUpdates={onCheckUpdates}
        onOpenUpdate={onOpenUpdate}
        onDismissUpdate={onDismissUpdate}
        onReportBug={onReportBug}
      />
      <section className="settings-group settings-group--action panel">
        <button
          id="open-login-settings"
          className="action-button action-button--secondary action-button--full"
          type="button"
          onClick={onOpenLoginSettings}
        >
          {messages.openLoginSettings}
        </button>
      </section>
    </div>
  );
}
