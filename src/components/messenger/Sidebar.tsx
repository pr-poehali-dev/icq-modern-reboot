import Icon from '@/components/ui/icon';

type Section = 'chats' | 'contacts' | 'media' | 'notifications' | 'profile' | 'settings';

interface SidebarProps {
  active: Section;
  onSelect: (s: Section) => void;
  unreadCount: number;
  notifCount: number;
}

const navItems: { id: Section; icon: string; label: string }[] = [
  { id: 'chats', icon: 'MessageSquare', label: 'Чаты' },
  { id: 'contacts', icon: 'Users', label: 'Контакты' },
  { id: 'media', icon: 'Image', label: 'Медиа' },
  { id: 'notifications', icon: 'Bell', label: 'Звонки' },
  { id: 'profile', icon: 'User', label: 'Профиль' },
  { id: 'settings', icon: 'Settings', label: 'Настройки' },
];

export default function Sidebar({ active, onSelect, unreadCount, notifCount }: SidebarProps) {
  return (
    <aside className="w-[72px] flex flex-col items-center py-4 gap-1 border-r border-border bg-[hsl(var(--panel-left))] shrink-0">
      <div className="mb-4 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(var(--primary))' }}>
        <span className="text-white font-semibold text-sm font-mono-ibm">P</span>
      </div>

      <div className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const badge = item.id === 'chats' ? unreadCount : item.id === 'notifications' ? notifCount : 0;
          return (
            <button
              key={item.id}
              className={`nav-item relative w-12 ${active === item.id ? 'active' : ''}`}
              onClick={() => onSelect(item.id)}
              title={item.label}
            >
              <Icon name={item.icon} size={20} />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
              {badge > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 rounded-full text-[9px] font-bold flex items-center justify-center px-1"
                  style={{ background: 'hsl(var(--primary))', color: '#fff' }}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <button className="nav-item w-12 mt-auto" title="Выйти">
        <Icon name="LogOut" size={18} />
      </button>
    </aside>
  );
}
