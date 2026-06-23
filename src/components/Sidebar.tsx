import type { ActiveView, MessageCatalog } from '../types';

type SidebarProps = {
  activeView: ActiveView;
  messages: MessageCatalog;
  onSelect: (view: ActiveView) => void;
};

export default function Sidebar({ activeView, messages, onSelect }: SidebarProps) {
  const items: Array<[ActiveView, string]> = [
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
