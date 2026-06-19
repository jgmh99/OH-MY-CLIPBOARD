import { useEffect, useState } from 'react';
import { clipboardApi } from './clipboard-api';
import HistoryPanel from './components/HistoryPanel';
import SettingsPanel from './components/SettingsPanel';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import { translations } from './data/translations';
import { eventToShortcut } from './utils/shortcuts';

const defaultSettings = {
  theme: 'system',
  textSize: 13,
  language: 'ko'
};
const defaultUpdateState = {
  status: 'idle',
  version: null,
  releaseUrl: null,
  message: '',
  canCheck: true,
  canOpen: false
};

export default function App() {
  const [history, setHistory] = useState([]);
  const [settings, setSettings] = useState(defaultSettings);
  const [query, setQuery] = useState('');
  const [activeView, setActiveView] = useState('all');
  const [updateState, setUpdateState] = useState(defaultUpdateState);
  const [recordingKey, setRecordingKey] = useState(null);
  const [invalidShortcutMessage, setInvalidShortcutMessage] = useState('');
  const [toast, setToast] = useState({ message: '', visible: false });

  const messages = translations[settings.language] || translations.ko;
  const historyFilter = activeView === 'locked' ? 'locked' : 'all';

  useEffect(() => {
    document.title = messages.appTitle;
    document.documentElement.lang = settings.language;
    document.body.dataset.theme = settings.theme || 'system';
    document.documentElement.style.setProperty('--clipboard-text-size', `${settings.textSize || 13}px`);
  }, [messages.appTitle, settings.language, settings.textSize, settings.theme]);

  useEffect(() => {
    const historyUnsubscribe = clipboardApi.onHistoryUpdated(setHistory);
    const settingsUnsubscribe = clipboardApi.onSettingsUpdated(setSettings);
    const openSettingsUnsubscribe = clipboardApi.onOpenSettingsView(() => {
      setActiveView('settings');
    });

    clipboardApi.getHistory().then(setHistory);
    clipboardApi.getSettings().then(setSettings);

    return () => {
      historyUnsubscribe?.();
      settingsUnsubscribe?.();
      openSettingsUnsubscribe?.();
    };
  }, []);

  useEffect(() => {
    if (!recordingKey) return undefined;

    function handleKeyDown(event) {
      event.preventDefault();
      event.stopPropagation();

      if (event.key === 'Escape') {
        setRecordingKey(null);
        setInvalidShortcutMessage('');
        return;
      }

      const nextShortcut = eventToShortcut(event);

      if (!nextShortcut) {
        setInvalidShortcutMessage(messages.shortcuts.invalid);
        return;
      }

      setRecordingKey(null);
      setInvalidShortcutMessage('');
      updateSetting(recordingKey, nextShortcut);
    }

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [messages.shortcuts.invalid, recordingKey]);

  useEffect(() => {
    if (!toast.visible) return undefined;

    const timer = window.setTimeout(() => {
      setToast((current) => ({ ...current, visible: false }));
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [toast.visible, toast.message]);

  function showToast(message) {
    setToast({ message, visible: false });
    window.requestAnimationFrame(() => {
      setToast({ message, visible: true });
    });
  }

  async function updateSetting(key, value) {
    const nextSettings = await clipboardApi.updateSetting(key, value);
    setSettings(nextSettings);
  }

  async function copyItem(id) {
    await clipboardApi.copyText(id);
    showToast(messages.copiedToast);
  }

  async function toggleLockItem(id) {
    const updatedHistory = await clipboardApi.toggleLockItem(id);
    setHistory(updatedHistory);
    const updatedItem = updatedHistory.find((item) => item.id === id);
    showToast(updatedItem?.locked ? messages.lockedFeedback : messages.unlockedFeedback);
  }

  async function deleteItem(id) {
    const updatedHistory = await clipboardApi.deleteItem(id);
    setHistory(updatedHistory);
  }

  async function clearHistory() {
    const updatedHistory = await clipboardApi.clearHistory();
    setHistory(updatedHistory);
  }

  return (
    <div className="app-shell">
      <section id="history-view" className="screen screen--overlay-header">
        <header className="screen-header">
          <div className="screen-header__leading">
            <div id="history-header-copy" className="screen-header__copy">
              <p id="history-kicker" className="eyebrow" />
              <h1 id="history-title" className="screen-title">
                {activeView === 'settings' ? messages.settingsTitle : messages.historyPanelTitle}
              </h1>
            </div>
          </div>

          <button
            id="clear"
            className={`action-button action-button--secondary ${activeView === 'settings' ? 'hidden' : ''}`}
            type="button"
            onClick={clearHistory}
          >
            {messages.clear}
          </button>
        </header>

        <div className="history-layout screen-body">
          <Sidebar
            activeView={activeView}
            messages={messages}
            onSelect={(filter) => {
              setActiveView(filter);
              setInvalidShortcutMessage('');
              if (filter !== 'settings') setRecordingKey(null);
            }}
          />

          {activeView === 'settings' ? (
            <SettingsPanel
              settings={settings}
              messages={messages}
              updateState={updateState}
              recordingKey={recordingKey}
              invalidShortcutMessage={invalidShortcutMessage}
              onChangeSetting={updateSetting}
              onSetRecordingKey={(key) => {
                setRecordingKey(key);
                setInvalidShortcutMessage('');
              }}
              onCheckUpdates={async () => {
                setUpdateState({ ...updateState, status: 'checking', canCheck: false });
                setUpdateState(await clipboardApi.checkForUpdates());
              }}
              onOpenUpdate={() => {
                if (updateState.canOpen) clipboardApi.openUpdateRelease();
              }}
              onDismissUpdate={() => setUpdateState(defaultUpdateState)}
              onReportBug={() => clipboardApi.openBugReport()}
              onOpenLoginSettings={() => clipboardApi.openLoginItemsSettings()}
            />
          ) : (
            <HistoryPanel
              history={history}
              query={query}
              filter={historyFilter}
              messages={messages}
              onQueryChange={setQuery}
              onClearSearch={() => setQuery('')}
              onCopy={copyItem}
              onDelete={deleteItem}
              onToggleLock={toggleLockItem}
            />
          )}
        </div>
      </section>

      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
