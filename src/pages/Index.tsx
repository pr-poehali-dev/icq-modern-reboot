import { useState } from 'react';
import Sidebar from '@/components/messenger/Sidebar';
import ChatsPanel from '@/components/messenger/ChatsPanel';
import ChatWindow from '@/components/messenger/ChatWindow';
import ContactsView from '@/components/messenger/ContactsView';
import MediaView from '@/components/messenger/MediaView';
import NotificationsView from '@/components/messenger/NotificationsView';
import ProfileView from '@/components/messenger/ProfileView';
import SettingsView from '@/components/messenger/SettingsView';
import { chats } from '@/data/mockData';

type Section = 'chats' | 'contacts' | 'media' | 'notifications' | 'profile' | 'settings';

const totalUnread = chats.reduce((sum, c) => sum + c.unread, 0);
const notifUnread = 2;

export default function Index() {
  const [section, setSection] = useState<Section>('chats');
  const [selectedChat, setSelectedChat] = useState<number | null>(null);

  const handleSelectSection = (s: Section) => {
    setSection(s);
    if (s !== 'chats') setSelectedChat(null);
  };

  const handleSelectChat = (id: number) => {
    setSection('chats');
    setSelectedChat(id);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background font-ibm">
      <Sidebar
        active={section}
        onSelect={handleSelectSection}
        unreadCount={totalUnread}
        notifCount={notifUnread}
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
        <ProfileView />
      ) : (
        <SettingsView />
      )}
    </div>
  );
}
