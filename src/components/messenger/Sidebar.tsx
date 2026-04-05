import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { STATUSES, STATUS_GROUPS, getStatus } from '@/lib/statuses';
import type { User } from '@/lib/api';

type Section = 'chats' | 'contacts' | 'media' | 'notifications' | 'profile' | 'settings';

interface SidebarProps {
  active: Section;
  onSelect: (s: Section) => void;
  unreadCount: number;
  notifCount: number;
  onLogout: () => void;
  user: User;
}

const navItems: { id: Section; icon: string; label: string }[] = [
  { id: 'chats', icon: 'MessageSquare', label: 'Чаты' },
  { id: 'contacts', icon: 'Users', label: 'Контакты' },
  { id: 'media', icon: 'Image', label: 'Медиа' },
  { id: 'notifications', icon: 'Bell', label: 'Уведомления' },
  { id: 'profile', icon: 'User', label: 'Профиль' },
  { id: 'settings', icon: 'Settings', label: 'Настройки' },
];

export default function Sidebar({ active, onSelect, unreadCount, notifCount, onLogout, user }: SidebarProps) {
  const [myStatus, setMyStatus] = useState('online');
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const st = getStatus(myStatus);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setPickerOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <aside className="w-[60px] md:w-[72px] flex flex-col items-center py-3 md:py-4 gap-1 border-r border-border bg-[hsl(var(--panel-left))] shrink-0">
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

      {/* Аватар + статус + выход */}
      <div className="mt-auto flex flex-col items-center gap-2 pt-3 border-t border-border w-full">
        {/* Аватар — кликабельный пикер */}
        <div className="relative" ref={pickerRef}>
          <button
            onClick={() => setPickerOpen(!pickerOpen)}
            title={`Статус: ${st.label} — нажми чтобы изменить`}
            className="relative"
          >
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white transition-all hover:opacity-80"
              style={{ background: user.color }}>
              {user.avatar}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 text-sm leading-none">{st.emoji}</span>
          </button>

          {/* Пикер открывается вправо от сайдбара */}
          {pickerOpen && (
            <div className="absolute left-full ml-3 bottom-0 z-50 w-52 rounded-2xl border border-border shadow-2xl overflow-hidden animate-slide-up"
              style={{ background: 'hsl(var(--card))' }}>
              <div className="px-3 pt-3 pb-2 border-b border-border">
                <p className="text-xs font-semibold truncate">{user.name}</p>
                <p className="text-[11px] mt-0.5" style={{ color: st.color }}>{st.emoji} {st.label}</p>
              </div>
              {STATUS_GROUPS.map((group) => {
                const items = STATUSES.filter((s) => s.group === group.id);
                return (
                  <div key={group.id}>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-3 pt-2.5 pb-1">{group.label}</p>
                    {items.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => { setMyStatus(s.id); setPickerOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-secondary
                          ${myStatus === s.id ? 'bg-[hsl(var(--primary)/0.08)]' : ''}`}
                      >
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.dotColor }} />
                        <span className="text-base leading-none">{s.emoji}</span>
                        <span className={`flex-1 text-left text-sm ${myStatus === s.id ? 'text-[hsl(var(--primary))] font-medium' : ''}`}>
                          {s.label}
                        </span>
                        {myStatus === s.id && <span className="text-[hsl(var(--primary))] text-xs shrink-0">✓</span>}
                      </button>
                    ))}
                  </div>
                );
              })}
              <div className="h-2" />
            </div>
          )}
        </div>

        <button className="nav-item w-12" title="Выйти" onClick={onLogout}>
          <Icon name="LogOut" size={16} />
          <span className="text-[9px] text-muted-foreground">Выйти</span>
        </button>
      </div>
    </aside>
  );
}