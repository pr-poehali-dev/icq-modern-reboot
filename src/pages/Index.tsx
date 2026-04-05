import { useState, useEffect } from 'react';
import Sidebar from '@/components/messenger/Sidebar';
import MobileNav from '@/components/messenger/MobileNav';
import ChatsPanel from '@/components/messenger/ChatsPanel';
import ChatWindow from '@/components/messenger/ChatWindow';
import ContactsView from '@/components/messenger/ContactsView';
import MediaView from '@/components/messenger/MediaView';
import NotificationsView from '@/components/messenger/NotificationsView';
import ProfileView from '@/components/messenger/ProfileView';
import SettingsView from '@/components/messenger/SettingsView';
import AuthScreen from '@/components/messenger/AuthScreen';
import { chats } from '@/data/mockData';
import { apiMe, apiLogout } from '@/lib/api';
import type { User } from '@/lib/api';

type Section = 'chats' | 'contacts' | 'media' | 'notifications' | 'profile' | 'settings';

const totalUnread = chats.reduce((sum, c) => sum + c.unread, 0);
const notifUnread = 2;

export default function Index() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [section, setSection] = useState<Section>('chats');
  const [selectedChat, setSelectedChat] = useState<number | null>(null);

  // На мобиле: показываем чат поверх списка
  const mobileShowChat = section === 'chats' && selectedChat !== null;

  useEffect(() => {
    const saved = localStorage.getItem('ping_token');
    if (!saved) { setAuthChecked(true); return; }
    apiMe(saved).then((res) => {
      if (res.ok && res.data.user) {
        setToken(saved);
        setUser(res.data.user as User);
      } else {
        localStorage.removeItem('ping_token');
      }
      setAuthChecked(true);
    });
  }, []);

  const handleAuth = (t: string, u: User) => { setToken(t); setUser(u); };

  const handleLogout = async () => {
    if (token) await apiLogout(token);
    localStorage.removeItem('ping_token');
    setToken(null);
    setUser(null);
  };

  const handleSelectSection = (s: Section) => {
    setSection(s);
    if (s !== 'chats') setSelectedChat(null);
  };

  const handleSelectChat = (id: number) => {
    setSection('chats');
    setSelectedChat(id);
  };

  // Назад из чата на мобиле
  const handleBack = () => setSelectedChat(null);

  if (!authChecked) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 rounded-2xl animate-pulse" style={{ background: 'hsl(var(--primary)/0.3)' }} />
      </div>
    );
  }

  if (!token || !user) {
    return <AuthScreen onAuth={handleAuth} />;
  }

  return (
    <div className="h-[100dvh] flex overflow-hidden bg-background font-ibm">

      {/* Десктоп сайдбар — скрыт на мобиле */}
      <div className="hidden md:flex">
        <Sidebar
          active={section}
          onSelect={handleSelectSection}
          unreadCount={totalUnread}
          notifCount={notifUnread}
          onLogout={handleLogout}
          user={user}
        />
      </div>

      {/* Основной контент */}
      <div className="flex flex-1 min-w-0 overflow-hidden relative">

        {/* ── РАЗДЕЛ ЧАТЫ ── */}
        {section === 'chats' && (
          <>
            {/* Список чатов */}
            <div className={`
              w-full md:w-[300px] shrink-0 overflow-hidden
              ${mobileShowChat ? 'hidden md:flex' : 'flex'}
              animate-fade-in
            `}>
              <ChatsPanel selectedChat={selectedChat} onSelect={handleSelectChat} />
            </div>

            {/* Окно чата */}
            {selectedChat !== null && (
              <div className={`
                absolute inset-0 md:relative md:inset-auto
                flex flex-col flex-1 min-w-0
                animate-slide-in-right md:animate-chat-switch
              `}
                style={{ background: 'hsl(var(--background))' }}
              >
                <ChatWindow chatId={selectedChat} onBack={handleBack} />
              </div>
            )}

            {/* Заглушка если чат не выбран — только десктоп */}
            {selectedChat === null && (
              <div className="hidden md:flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground animate-fade-in">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: 'hsl(var(--secondary))' }}>
                  <span className="text-4xl">💬</span>
                </div>
                <div className="text-center">
                  <p className="text-base font-medium text-foreground">Выберите чат</p>
                  <p className="text-sm mt-1">Начните общение или найдите контакт</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── ОСТАЛЬНЫЕ РАЗДЕЛЫ ── */}
        {section === 'contacts' && (
          <div className="flex flex-1 min-w-0 pb-[var(--mobile-nav)] md:pb-0 animate-fade-in">
            <ContactsView />
          </div>
        )}
        {section === 'media' && (
          <div className="flex flex-1 min-w-0 pb-[var(--mobile-nav)] md:pb-0 animate-fade-in">
            <MediaView />
          </div>
        )}
        {section === 'notifications' && (
          <div className="flex flex-1 min-w-0 pb-[var(--mobile-nav)] md:pb-0 animate-fade-in">
            <NotificationsView />
          </div>
        )}
        {section === 'profile' && (
          <div className="flex flex-1 min-w-0 pb-[var(--mobile-nav)] md:pb-0 animate-fade-in">
            <ProfileView user={user} />
          </div>
        )}
        {section === 'settings' && (
          <div className="flex flex-1 min-w-0 pb-[var(--mobile-nav)] md:pb-0 animate-fade-in">
            <SettingsView />
          </div>
        )}
      </div>

      {/* Мобильная нижняя навигация */}
      <MobileNav
        active={section}
        onSelect={handleSelectSection}
        unreadCount={totalUnread}
        notifCount={notifUnread}
      />
    </div>
  );
}
