import Icon from '@/components/ui/icon';

type Section = 'chats' | 'contacts' | 'media' | 'notifications' | 'profile' | 'settings';

interface MobileNavProps {
  active: Section;
  onSelect: (s: Section) => void;
  unreadCount: number;
  notifCount: number;
}

const navItems: { id: Section; icon: string; label: string }[] = [
  { id: 'chats',         icon: 'MessageSquare', label: 'Чаты' },
  { id: 'contacts',      icon: 'Users',         label: 'Контакты' },
  { id: 'media',         icon: 'Image',         label: 'Медиа' },
  { id: 'notifications', icon: 'Bell',          label: 'Звонки' },
  { id: 'profile',       icon: 'User',          label: 'Профиль' },
];

export default function MobileNav({ active, onSelect, unreadCount, notifCount }: MobileNavProps) {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border flex items-center px-2 pb-safe"
      style={{
        background: 'hsl(var(--panel-left))',
        paddingBottom: `max(env(safe-area-inset-bottom, 0px), 8px)`,
        height: 'calc(var(--mobile-nav) + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {navItems.map((item) => {
        const badge = item.id === 'chats' ? unreadCount : item.id === 'notifications' ? notifCount : 0;
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            {/* Активный индикатор */}
            {isActive && (
              <span
                className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-8 rounded-xl -z-10 animate-fade-in"
                style={{ background: 'hsl(var(--primary)/0.12)' }}
              />
            )}

            <div className="relative">
              <Icon name={item.icon} size={22} />
              {badge > 0 && (
                <span
                  className="absolute -top-1.5 -right-2 min-w-[16px] h-4 rounded-full text-[9px] font-bold flex items-center justify-center px-1"
                  style={{ background: 'hsl(var(--primary))', color: '#fff' }}
                >
                  {badge}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-medium leading-none ${isActive ? 'text-[hsl(var(--primary))]' : ''}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
