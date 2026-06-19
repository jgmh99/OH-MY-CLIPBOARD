import HistoryItem from './HistoryItem';
import { filterHistory } from '../utils/history';

export default function HistoryPanel({
  history,
  query,
  filter,
  messages,
  onQueryChange,
  onClearSearch,
  onCopy,
  onDelete,
  onToggleLock
}) {
  const visibleHistory = filterHistory(history, query, messages, filter);

  return (
    <div id="history-groups" className="settings-groups history-groups">
      <section className="settings-group panel history-group">
        <div id="history-panel-header" className="panel__header hidden">
          <div>
            <p id="history-panel-kicker" className="panel__kicker" />
            <h2 id="history-panel-title" className="panel__title">{messages.historyPanelTitle}</h2>
          </div>
        </div>

        <div className="history-toolbar">
          <label className="search-field" htmlFor="history-search">
            <span className="search-field__icon" aria-hidden="true">⌕</span>
            <input
              id="history-search"
              type="search"
              autoComplete="off"
              spellCheck="false"
              placeholder={messages.searchPlaceholder}
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') onClearSearch();
              }}
            />
          </label>
          <button
            id="history-search-clear"
            className="icon-button history-search-clear"
            type="button"
            aria-label={messages.clearSearch}
            onClick={onClearSearch}
          >
            <span>×</span>
          </button>
        </div>

        <div id="list" className="history-list">
          {!history.length && <div className="empty-state">{messages.noHistory}</div>}
          {Boolean(history.length) && !visibleHistory.length && (
            <div className="empty-state">{messages.noSearchResults}</div>
          )}
          {visibleHistory.map((item) => (
            <HistoryItem
              key={item.id}
              item={item}
              messages={messages}
              onCopy={onCopy}
              onDelete={onDelete}
              onToggleLock={onToggleLock}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
