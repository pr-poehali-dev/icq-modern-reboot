import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { chats, contacts } from '@/data/mockData';
import { getStatus, isOnlineGroup } from '@/lib/statuses';

interface ChatsPanelProps {
  selectedChat: number | null;
  onSelect: (id: number) => void;
}

export default function ChatsPanel({ selectedChat, onSelect }: ChatsPanelProps) {
  const [search, setSearch] = useState('');

  const enriched = chats.map((c) => ({
    ...c,
    contact: contacts.find((ct) => ct.id === c.contactId)!,
    lastMsg: c.messages[c.messages.length - 1],
  }));

  const filtered = enriched.filter((c) =>
    c.contact.name.toLowerCase().includes(search.toLowerCase())
  );

  const pinned = filtered.filter((c) => c.pinned);
  const unpinned = filtered.filter((c) => !c.pinned);

  return (
    <div className="w-[300px] flex flex-col border-r border-border shrink-0 bg-[hsl(var(--panel-left))]">
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-lg font-semibold mb-3">Чаты</h1>
        <div className="relative">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск..."
            className="w-full bg-[hsl(var(--secondary))] rounded-xl py-2 pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 ring-[hsl(var(--primary)/0.4)] transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {pinned.length > 0 && (
          <>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-2 mb-2 mt-1">Закреплённые</p>
            {pinned.map((c) => <ChatRow key={c.id} chat={c} selected={selectedChat === c.id} onSelect={onSelect} />)}
          </>
        )}
        {unpinned.length > 0 && (
          <>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-2 mb-2 mt-3">Все чаты</p>
            {unpinned.map((c) => <ChatRow key={c.id} chat={c} selected={selectedChat === c.id} onSelect={onSelect} />)}
          </>
        )}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm gap-2">
            <Icon name="Search" size={24} />
            <span>Ничего не найдено</span>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-border">
        <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90 active:scale-95"
          style={{ background: 'hsl(var(--primary))', color: '#fff' }}>
          <Icon name="Plus" size={16} />
          Новый чат
        </button>
      </div>
    </div>
  );
}

interface Msg { id: number; text: string; from: string; time: string; date: string }
interface EnrichedChat {
  id: number; contactId: number; unread: number; pinned: boolean;
  messages: Msg[];
  contact: { id: number; name: string; status: string; avatar: string; color: string; lastSeen: string; role: string };
  lastMsg: Msg;
}

function ChatRow({ chat, selected, onSelect }: { chat: EnrichedChat; selected: boolean; onSelect: (id: number) => void }) {
  return (
    <button
      onClick={() => onSelect(chat.id)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-left group
        ${selected ? 'bg-[hsl(var(--primary)/0.12)]' : 'hover:bg-[hsl(var(--secondary))]'}`}
    >
      <div className="relative shrink-0">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0"
          style={{ background: chat.contact.color }}>
          {chat.contact.avatar}
        </div>
        {isOnlineGroup(chat.contact.status) ? (
          <span className="absolute -bottom-0.5 -right-0.5 text-xs leading-none">
            {getStatus(chat.contact.status).emoji}
          </span>
        ) : (
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[hsl(var(--panel-left))]"
            style={{ background: getStatus(chat.contact.status).dotColor }} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium truncate ${selected ? 'text-[hsl(var(--primary))]' : ''}`}>
            {chat.contact.name}
          </span>
          <span className="text-[10px] text-muted-foreground shrink-0 ml-1">{chat.lastMsg.time}</span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-xs text-muted-foreground truncate">
            {chat.lastMsg.from === 'me' && <span className="text-[hsl(var(--primary))]">Вы: </span>}
            {chat.lastMsg.text}
          </span>
          {chat.unread > 0 && (
            <span className="ml-2 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center px-1 shrink-0"
              style={{ background: 'hsl(var(--primary))', color: '#fff' }}>
              {chat.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}