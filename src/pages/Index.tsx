import { useState, useEffect } from 'react';
import Sidebar from '@/components/messenger/Sidebar';
import ChatsPanel from '@/components/messenger/ChatsPanel';
import ChatWindow from '@/components/messenger/ChatWindow';
import ContactsView from '@/components/messenger/ContactsView';
import MediaView from '@/components/messenger/MediaView';
import NotificationsView from '@/components/messenger/NotificationsView';
import ProfileView from '@/components/messenger/ProfileView';
import SettingsView from '@/components/messenger/SettingsView';
import AuthScreen from '@/components/messenger/AuthScreen';
import { apiMe, apiLogout, apiChatList } from '@/lib/api';
import type { User, ChatItem } from '@/lib/api';

type Section = 'chats' | 'contacts' | 'media' | 'notifications' | 'profile' | 'settings';

export default function Index() {
  const [token, setToken]         = useState<string | null>(null);
  const [user, setUser]           = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [section, setSection]     = useState<Section>('chats');
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [chats, setChats]         = useState<ChatItem[]>([]);
  const [totalUnread, setTotalUnread] = useState(0);

  const mobileShowChat = section === 'chats' && selectedChatId !== null;
  const selectedChat   = chats.find((c) => c.id === selectedChatId) ?? null;

  useEffect(() => {
    const saved = localStorage.getItem('ping_token');
    if (!saved) { setAuthChecked(true); return; }
    apiMe(saved).then((res) => {
      if (res.ok && res.data.user) {
        const u = res.data.user as User;
        setToken(saved);
        setUser(u);
        localStorage.setItem('ping_uid', String(u.id));
      } else {
        localStorage.removeItem('ping_token');
      }
      setAuthChecked(true);
    });
  }, []);

  useEffect(() => {
    if (!token) return;
    const load = () => apiChatList(token).then((res) => {
      if (res.ok) {
        const list = (res.data.chats as ChatItem[]) || [];
        setChats(list);
        setTotalUnread(list.reduce((s, c) => s + (c.unread || 0), 0));
      }
    });
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [token]);

  const handleAuth = (t: string, u: User) => {
    setToken(t); setUser(u);
    localStorage.setItem('ping_uid', String(u.id));
  };

  const handleLogout = async () => {
    if (token) await apiLogout(token);
    localStorage.removeItem('ping_token');
    localStorage.removeItem('ping_uid');
    setToken(null); setUser(null);
  };

  const handleSelectSection = (s: Section) => {
    setSection(s);
    if (s !== 'chats') setSelectedChatId(null);
  };

  const handleSelectChat = (id: number) => {
    setSection('chats');
    setSelectedChatId(id);
  };

  const handleBack = () => setSelectedChatId(null);

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

      {/* Левый сайдбар — всегда виден */}
      <Sidebar
        active={section}
        onSelect={handleSelectSection}
        unreadCount={totalUnread}
        notifCount={0}
        onLogout={handleLogout}
        user={user}
      />

      {/* Основной контент */}
      <div className="flex flex-1 min-w-0 overflow-hidden relative">

        {/* ЧАТЫ */}
        {section === 'chats' && (
          <>
            <div className={`w-full md:w-[300px] shrink-0 overflow-hidden
              ${mobileShowChat ? 'hidden md:flex' : 'flex'} animate-fade-in`}>
              <ChatsPanel
                token={token}
                selectedChat={selectedChatId}
                onSelect={handleSelectChat}
              />
            </div>

            {selectedChatId !== null && (
              <div className="absolute inset-0 md:relative md:inset-auto flex flex-col flex-1 min-w-0 animate-slide-in-right md:animate-chat-switch"
                style={{ background: 'hsl(var(--background))' }}>
                <ChatWindow token={token} chat={selectedChat} onBack={handleBack} />
              </div>
            )}

            {selectedChatId === null && (
              <div className="hidden md:flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground animate-fade-in">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: 'hsl(var(--secondary))' }}>
                  <span className="text-4xl">💬</span>
                </div>
                <div className="text-center">
                  <p className="text-base font-medium text-foreground">Выберите чат</p>
                  <p className="text-sm mt-1">Нажмите + чтобы начать переписку</p>
                </div>
              </div>
            )}
          </>
        )}

        {section === 'contacts' && (
          <div className="flex flex-1 min-w-0 animate-fade-in">
            <ContactsView />
          </div>
        )}
        {section === 'media' && (
          <div className="flex flex-1 min-w-0 animate-fade-in">
            <MediaView />
          </div>
        )}
        {section === 'notifications' && (
          <div className="flex flex-1 min-w-0 animate-fade-in">
            <NotificationsView />
          </div>
        )}
        {section === 'profile' && (
          <div className="flex flex-1 min-w-0 animate-fade-in">
            <ProfileView user={user} />
          </div>
        )}
        {section === 'settings' && (
          <div className="flex flex-1 min-w-0 animate-fade-in">
            <SettingsView />
          </div>
        )}
      </div>
    </div>
  );
}
