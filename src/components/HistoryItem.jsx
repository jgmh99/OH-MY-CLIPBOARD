export default function HistoryItem({ item, messages, onCopy, onDelete, onToggleLock }) {
  const previewText = item.text && item.text.length > 180
    ? `${item.text.slice(0, 180)}...`
    : item.text;

  return (
    <article className={item.locked ? 'history-item history-item--locked' : 'history-item'}>
      <div className="history-item__main">
        <div className="history-item__content">
          <div className="history-item__preview">
            <button
              className="history-item__text"
              type="button"
              aria-label={messages.copyItem}
              onClick={() => onCopy(item.id)}
            >
              <p className="history-item__type">
                {item.kind === 'image' ? messages.imageItem : messages.textItem}
              </p>
              {item.kind === 'image' && item.imageDataUrl ? (
                <img
                  className="history-item__image"
                  src={item.imageDataUrl}
                  alt={messages.imageAlt}
                />
              ) : (
                <span className="history-item__value">{previewText}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="history-item__actions">
        <button className="history-item__lock" type="button" onClick={() => onToggleLock(item.id)}>
          {item.locked ? messages.unlock : messages.lock}
        </button>
        <button
          className="history-item__delete"
          type="button"
          disabled={item.locked}
          title={item.locked ? messages.lockedDeleteHint : messages.delete}
          onClick={() => onDelete(item.id)}
        >
          {messages.delete}
        </button>
      </div>
    </article>
  );
}
