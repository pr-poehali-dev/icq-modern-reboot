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

  const handleAuth = (t: string, u: User) => {
    setToken(t);
    setUser(u);
  };

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
    <div className="h-screen flex overflow-hidden bg-background font-ibm">
      <Sidebar
        active={section}
        onSelect={handleSelectSection}
        unreadCount={totalUnread}
        notifCount={notifUnread}
        onLogout={handleLogout}
        user={user}
      />

      {section === 'chats' ? (
        <>
          <ChatsPanel selectedChat={selectedChat} onSelect={handleSelectChat} />
          <ChatWindow chatId={selectedChat} />
        </>
      ) : section === 'contacts' ? (
        <ContactsView />
      ) : section === 'media' ? (
        <MediaView />
      ) : section === 'notifications' ? (
        <NotificationsView />
      ) : section === 'profile' ? (
        <ProfileView user={user} />
      ) : (
        <SettingsView />
      )}
    </div>
  );
}