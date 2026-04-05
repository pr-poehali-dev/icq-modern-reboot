import { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import { apiChatList, apiSearchUsers, apiOpenDirect, apiCreateGroup } from '@/lib/api';
import type { ChatItem, SearchUser } from '@/lib/api';

interface ChatsPanelProps {
  token: string;
  selectedChat: number | null;
  onSelect: (id: number) => void;
}

export default function ChatsPanel({ token, selectedChat, onSelect }: ChatsPanelProps) {
  const [chats, setChats]       = useState<ChatItem[]>([]);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [showNew, setShowNew]   = useState(false);

  const load = useCallback(async () => {
    const res = await apiChatList(token);
    if (res.ok) setChats((res.data.chats as ChatItem[]) || []);
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  // Обновляем список каждые 3 сек
  useEffect(() => {
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [load]);

  const filtered = chats.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  const pinned   = filtered.filter((_, i) => i < 2);
  const unpinned = filtered.filter((_, i) => i >= 2);

  return (
    <div className="w-full md:w-[300px] flex flex-col border-r border-border shrink-0 bg-[hsl(var(--panel-left))]">
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-semibold">Чаты</h1>
          <button
            onClick={() => setShowNew(true)}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          >
            <Icon name="Plus" size={18} />
          </button>
        </div>
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

      <div className="flex-1 overflow-y-auto px-2 pb-20 md:pb-4">
        {loading && (
          <div className="flex flex-col gap-2 px-2 pt-2">
            {[1,2,3].map((i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                <div className="w-10 h-10 rounded-full bg-secondary animate-pulse shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-3 bg-secondary rounded animate-pulse w-2/3" />
                  <div className="h-2.5 bg-secondary rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm gap-2">
            <Icon name="MessageSquare" size={24} />
            <span>Нет чатов. Нажми + чтобы начать</span>
          </div>
        )}

        {!loading && pinned.length > 0 && (
          <>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-2 mb-2 mt-1">Последние</p>
            {pinned.map((c) => <ChatRow key={c.id} chat={c} selected={selectedChat === c.id} onSelect={onSelect} />)}
          </>
        )}
        {!loading && unpinned.length > 0 && (
          <>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-2 mb-2 mt-3">Все чаты</p>
            {unpinned.map((c) => <ChatRow key={c.id} chat={c} selected={selectedChat === c.id} onSelect={onSelect} />)}
          </>
        )}
      </div>

      {/* Модалка нового чата */}
      {showNew && (
        <NewChatModal token={token} onClose={() => setShowNew(false)} onOpen={(id) => { setShowNew(false); onSelect(id); load(); }} />
      )}
    </div>
  );
}

function ChatRow({ chat, selected, onSelect }: { chat: ChatItem; selected: boolean; onSelect: (id: number) => void }) {
  const timeStr = chat.last_msg ? formatTime(chat.last_msg.time) : '';
  return (
    <button
      onClick={() => onSelect(chat.id)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-left
        ${selected ? 'bg-[hsl(var(--primary)/0.12)]' : 'hover:bg-[hsl(var(--secondary))]'}`}
    >
      <div className="relative shrink-0">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0"
          style={{ background: chat.color }}>
          {chat.avatar}
        </div>
        {chat.type === 'group' && (
          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-background flex items-center justify-center">
            <Icon name="Users" size={9} className="text-muted-foreground" />
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium truncate ${selected ? 'text-[hsl(var(--primary))]' : ''}`}>
            {chat.name}
          </span>
          <span className="text-[10px] text-muted-foreground shrink-0 ml-1">{timeStr}</span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-xs text-muted-foreground truncate">
            {chat.last_msg?.text || 'Нет сообщений'}
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

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return `${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
    if (diffDays === 1) return 'вчера';
    if (diffDays < 7) return ['вс','пн','вт','ср','чт','пт','сб'][d.getDay()];
    return `${d.getDate()}.${String(d.getMonth()+1).padStart(2,'0')}`;
  } catch { return ''; }
}

/* ── Модалка нового чата / группы ── */
function NewChatModal({ token, onClose, onOpen }: {
  token: string; onClose: () => void; onOpen: (id: number) => void;
}) {
  const [tab, setTab]           = useState<'direct' | 'group'>('direct');
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState<SearchUser[]>([]);
  const [selected, setSelected] = useState<SearchUser[]>([]);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      const res = await apiSearchUsers(token, query);
      if (res.ok) setResults((res.data.users as SearchUser[]) || []);
    }, 300);
    return () => clearTimeout(t);
  }, [query, token]);

  const openDirect = async (u: SearchUser) => {
    setLoading(true);
    const res = await apiOpenDirect(token, u.id);
    if (res.ok) onOpen(res.data.chat_id as number);
    setLoading(false);
  };

  const createGroup = async () => {
    if (!groupName.trim() || selected.length < 1) return;
    setLoading(true);
    const res = await apiCreateGroup(token, groupName, selected.map((u) => u.id));
    if (res.ok) onOpen(res.data.chat_id as number);
    setLoading(false);
  };

  const toggle = (u: SearchUser) => setSelected((prev) =>
    prev.find((x) => x.id === u.id) ? prev.filter((x) => x.id !== u.id) : [...prev, u]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-sm rounded-2xl border border-border overflow-hidden animate-slide-up"
        style={{ background: 'hsl(var(--card))' }}>
        {/* Tabs */}
        <div className="flex gap-1 bg-secondary m-4 p-1 rounded-xl">
          {(['direct', 'group'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all
                ${tab === t ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}>
              {t === 'direct' ? 'Личный чат' : 'Группа'}
            </button>
          ))}
        </div>

        <div className="px-4 pb-2">
          {tab === 'group' && (
            <input value={groupName} onChange={(e) => setGroupName(e.target.value)}
              placeholder="Название группы"
              className="w-full bg-secondary rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 ring-[hsl(var(--primary)/0.4)] mb-3"
            />
          )}
          <div className="relative">
            <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по имени или @username"
              className="w-full bg-secondary rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 ring-[hsl(var(--primary)/0.4)]"
            />
          </div>
        </div>

        {tab === 'group' && selected.length > 0 && (
          <div className="flex gap-2 px-4 pb-2 flex-wrap">
            {selected.map((u) => (
              <div key={u.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium"
                style={{ background: 'hsl(var(--primary)/0.15)', color: 'hsl(var(--primary))' }}>
                {u.avatar} {u.name}
                <button onClick={() => toggle(u)} className="ml-1 opacity-60 hover:opacity-100">×</button>
              </div>
            ))}
          </div>
        )}

        <div className="max-h-56 overflow-y-auto px-2 pb-2">
          {results.map((u) => {
            const isSel = selected.find((x) => x.id === u.id);
            return (
              <button key={u.id}
                onClick={() => tab === 'direct' ? openDirect(u) : toggle(u)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all
                  ${isSel ? 'bg-[hsl(var(--primary)/0.1)]' : 'hover:bg-secondary'}`}
              >
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0"
                  style={{ background: u.color }}>
                  {u.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{u.name}</p>
                  <p className="text-xs text-muted-foreground">@{u.username}</p>
                </div>
                {tab === 'group' && isSel && <Icon name="Check" size={16} className="text-[hsl(var(--primary))] shrink-0" />}
              </button>
            );
          })}
          {query && results.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">Никого не найдено</p>
          )}
          {!query && (
            <p className="text-center text-xs text-muted-foreground py-4">Введите имя для поиска</p>
          )}
        </div>

        <div className="flex gap-2 p-4 pt-2 border-t border-border">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-border hover:bg-secondary transition-all">
            Отмена
          </button>
          {tab === 'group' && (
            <button onClick={createGroup} disabled={loading || !groupName.trim() || selected.length < 1}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              style={{ background: 'hsl(var(--primary))', color: '#fff' }}>
              {loading ? <Icon name="Loader2" size={15} className="animate-spin" /> : <Icon name="Users" size={15} />}
              Создать группу
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
