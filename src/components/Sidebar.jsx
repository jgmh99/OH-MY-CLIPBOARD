export default function Sidebar({ activeView, messages, onSelect }) {
  const items = [
    ['all', '⌘'],
    ['locked', '🔒'],
    ['settings', '⚙']
  ];

  return (
    <nav className="history-sidebar" aria-label="History sections">
      {items.map(([filter, icon]) => (
        <button
          key={filter}
          className={`history-sidebar__item ${activeView === filter ? 'active' : ''}`}
          type="button"
          onClick={() => onSelect(filter)}
        >
          <span className="history-sidebar__icon" aria-hidden="true">{icon}</span>
          <span className="history-sidebar__label">{messages.nav[filter]}</span>
        </button>
      ))}
    </nav>
  );
}
