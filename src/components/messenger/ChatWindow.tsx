import { useState, useRef, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import { apiHistory, apiPoll, apiSend, apiUpload, apiChatMembers } from '@/lib/api';
import type { Message, ChatItem, SearchUser } from '@/lib/api';

interface ChatWindowProps {
  token: string;
  chat: ChatItem | null;
  onBack?: () => void;
}

const SWIPE_THRESHOLD = 80;
const SWIPE_MAX_Y     = 60;

export default function ChatWindow({ token, chat, onBack }: ChatWindowProps) {
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState('');
  const [sending, setSending]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [animKey, setAnimKey]     = useState(0);
  const [members, setMembers]     = useState<SearchUser[]>([]);
  const [showInfo, setShowInfo]   = useState(false);

  // Свайп
  const [dragX, setDragX]         = useState(0);
  const [dragging, setDragging]   = useState(false);
  const [closing, setClosing]     = useState(false);

  const touchStart    = useRef<{ x: number; y: number } | null>(null);
  const prevChatId    = useRef<number | null>(null);
  const bottomRef     = useRef<HTMLDivElement>(null);
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const lastIdRef     = useRef<number>(0);
  const pollTimerRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollBottom = () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

  // Загрузка истории при смене чата
  useEffect(() => {
    if (!chat) return;
    if (chat.id !== prevChatId.current) {
      prevChatId.current = chat.id;
      setAnimKey((k) => k + 1);
      setMessages([]);
      lastIdRef.current = 0;
      setDragX(0); setDragging(false); setClosing(false);
    }
    apiHistory(token, chat.id).then((res) => {
      if (res.ok) {
        const msgs = (res.data.messages as Message[]) || [];
        setMessages(msgs);
        if (msgs.length) lastIdRef.current = msgs[msgs.length - 1].id;
        setTimeout(scrollBottom, 50);
      }
    });
    if (chat.type === 'group') {
      apiChatMembers(token, chat.id).then((res) => {
        if (res.ok) setMembers((res.data.members as SearchUser[]) || []);
      });
    }
  }, [chat?.id]);

  // Polling новых сообщений
  useEffect(() => {
    if (!chat) return;
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    pollTimerRef.current = setInterval(async () => {
      if (!lastIdRef.current && lastIdRef.current !== 0) return;
      const res = await apiPoll(token, chat.id, lastIdRef.current);
      if (res.ok) {
        const newMsgs = (res.data.messages as Message[]) || [];
        if (newMsgs.length) {
          lastIdRef.current = newMsgs[newMsgs.length - 1].id;
          setMessages((prev) => [...prev, ...newMsgs]);
          setTimeout(scrollBottom, 50);
        }
      }
    }, 2000);
    return () => { if (pollTimerRef.current) clearInterval(pollTimerRef.current); };
  }, [chat?.id, token]);

  const send = useCallback(async () => {
    if (!input.trim() || !chat || sending) return;
    setSending(true);
    const res = await apiSend(token, chat.id, input.trim());
    if (res.ok) {
      const msg = res.data.message as Message;
      setMessages((prev) => [...prev, msg]);
      lastIdRef.current = msg.id;
      setInput('');
      setTimeout(scrollBottom, 50);
    }
    setSending(false);
  }, [input, chat, token, sending]);

  const sendFile = async (file: File) => {
    if (!chat) return;
    setUploading(true);
    const up = await apiUpload(token, file);
    if (up.ok) {
      const { url, name, type, size } = up.data as { url: string; name: string; type: string; size: number };
      const res = await apiSend(token, chat.id, '', url, name, type, size);
      if (res.ok) {
        const msg = res.data.message as Message;
        setMessages((prev) => [...prev, msg]);
        lastIdRef.current = msg.id;
        setTimeout(scrollBottom, 50);
      }
    }
    setUploading(false);
  };

  // Свайп
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    setDragging(false);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.touches[0].clientX - touchStart.current.x;
    const dy = Math.abs(e.touches[0].clientY - touchStart.current.y);
    if (dy > SWIPE_MAX_Y) { touchStart.current = null; return; }
    if (dx <= 0) return;
    setDragging(true);
    setDragX(dx > SWIPE_THRESHOLD ? SWIPE_THRESHOLD + (dx - SWIPE_THRESHOLD) * 0.3 : dx);
  };
  const onTouchEnd = () => {
    if (!touchStart.current) return;
    touchStart.current = null;
    if (dragX >= SWIPE_THRESHOLD && onBack) {
      setClosing(true); setDragging(false);
      setTimeout(() => { onBack(); setClosing(false); setDragX(0); }, 280);
    } else {
      setDragging(false); setDragX(0);
    }
  };

  if (!chat) {
    return (
      <div className="flex-1 flex-col items-center justify-center gap-4 text-muted-foreground animate-fade-in hidden md:flex">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: 'hsl(var(--secondary))' }}>
          <span className="text-4xl">💬</span>
        </div>
        <div className="text-center">
          <p className="text-base font-medium text-foreground">Выберите чат</p>
          <p className="text-sm mt-1">Нажмите + чтобы начать переписку</p>
        </div>
      </div>
    );
  }

  const progress = Math.min(dragX / SWIPE_THRESHOLD, 1);

  return (
    <div
      key={animKey}
      className={`flex-1 flex flex-col min-w-0 ${closing ? 'animate-slide-out-right' : 'animate-chat-switch'}`}
      style={{
        transform: dragging ? `translateX(${dragX}px)` : undefined,
        transition: dragging ? 'none' : 'transform 0.32s cubic-bezier(0.16,1,0.3,1)',
        willChange: 'transform, opacity',
        touchAction: 'pan-y',
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Индикатор свайпа */}
      {dragging && progress > 0.05 && (
        <div className="md:hidden fixed left-0 top-1/2 z-50 flex items-center px-3 py-2 rounded-r-2xl pointer-events-none"
          style={{ background: `hsl(var(--primary)/${Math.round(progress * 90)}%)`, opacity: progress,
            transform: `translateY(-50%) translateX(${dragX * 0.4}px)`, transition: 'none' }}>
          <Icon name="ChevronLeft" size={18} className="text-white" />
        </div>
      )}

      {/* Заголовок */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
        {onBack && (
          <button onClick={onBack}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-secondary transition-colors text-muted-foreground shrink-0 -ml-1">
            <Icon name="ChevronLeft" size={22} />
          </button>
        )}
        <button className="flex items-center gap-3 flex-1 min-w-0 text-left" onClick={() => setShowInfo(!showInfo)}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0"
            style={{ background: chat.color }}>
            {chat.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{chat.name}</p>
            <p className="text-xs text-muted-foreground">
              {chat.type === 'group' ? `Группа · ${members.length} участников` : 'Личный чат'}
            </p>
          </div>
        </button>
        <div className="flex items-center gap-1 shrink-0">
          <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-secondary transition-colors text-muted-foreground">
            <Icon name="Phone" size={16} />
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-secondary transition-colors text-muted-foreground">
            <Icon name="Video" size={16} />
          </button>
        </div>
      </div>

      {/* Участники группы (инфо-панель) */}
      {showInfo && chat.type === 'group' && members.length > 0 && (
        <div className="flex gap-3 px-4 py-3 overflow-x-auto border-b border-border shrink-0 animate-slide-up">
          {members.map((m) => (
            <div key={m.id} className="flex flex-col items-center gap-1 shrink-0">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: m.color }}>
                {m.avatar}
              </div>
              <span className="text-[10px] text-muted-foreground truncate max-w-[48px]">{m.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      )}

      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground py-16">
            <span className="text-3xl">👋</span>
            <p className="text-sm">Начните переписку!</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.user_id === parseInt(localStorage.getItem('ping_uid') || '0');
          const showAvatar = !isMe && (i === 0 || messages[i-1].user_id !== msg.user_id);
          const showName = chat.type === 'group' && !isMe && showAvatar;
          return (
            <div key={msg.id} className={`flex gap-2 animate-msg-in ${isMe ? 'justify-end' : 'justify-start'}`}
              style={{ animationDelay: '0s' }}>
              {!isMe && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 self-end mb-0.5"
                  style={{ background: showAvatar ? msg.user_color : 'transparent' }}>
                  {showAvatar ? msg.user_avatar : ''}
                </div>
              )}
              <div className={`max-w-[75%] md:max-w-[60%] ${isMe ? 'msg-bubble-out' : 'msg-bubble-in'} px-3 py-2`}>
                {showName && <p className="text-[10px] font-semibold mb-1" style={{ color: msg.user_color }}>{msg.user_name}</p>}
                {msg.file_url && <FilePreview url={msg.file_url} name={msg.file_name} type={msg.file_type} isMe={isMe} />}
                {msg.text && <p className="text-sm leading-relaxed">{msg.text}</p>}
                <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-white/60' : 'text-muted-foreground'}`}>
                  {formatTime(msg.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Ввод */}
      <div className="px-4 py-3 border-t border-border shrink-0">
        {uploading && (
          <div className="flex items-center gap-2 px-3 py-2 mb-2 rounded-xl text-sm text-muted-foreground bg-secondary">
            <Icon name="Loader2" size={14} className="animate-spin" />
            Загружаю файл...
          </div>
        )}
        <div className="flex items-end gap-2 bg-secondary rounded-2xl px-3 py-2.5">
          <input ref={fileInputRef} type="file" className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
            onChange={(e) => { if (e.target.files?.[0]) sendFile(e.target.files[0]); e.target.value = ''; }}
          />
          <button onClick={() => fileInputRef.current?.click()}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0 p-1">
            <Icon name="Paperclip" size={18} />
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Написать сообщение..."
            rows={1}
            className="flex-1 bg-transparent text-sm outline-none resize-none placeholder:text-muted-foreground leading-relaxed max-h-32 py-1"
          />
          <button
            onClick={send}
            disabled={!input.trim() || sending}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0 disabled:opacity-30 active:scale-95"
            style={{ background: input.trim() ? 'hsl(var(--primary))' : 'transparent', color: input.trim() ? '#fff' : 'hsl(var(--muted-foreground))' }}
          >
            {sending ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="Send" size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
}

function FilePreview({ url, name, type, isMe }: { url: string; name: string; type: string; isMe: boolean }) {
  if (type === 'image') {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="block mb-1">
        <img src={url} alt={name} className="max-w-full rounded-xl max-h-60 object-cover" />
      </a>
    );
  }
  if (type === 'video') {
    return (
      <video src={url} controls className="max-w-full rounded-xl max-h-48 mb-1" />
    );
  }
  if (type === 'audio') {
    return <audio src={url} controls className="w-full mb-1" />;
  }
  return (
    <a href={url} target="_blank" rel="noreferrer"
      className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-1 text-sm font-medium transition-all hover:opacity-80
        ${isMe ? 'bg-white/15 text-white' : 'bg-secondary text-foreground'}`}>
      <Icon name="File" size={16} />
      <span className="truncate max-w-[180px]">{name}</span>
      <Icon name="Download" size={14} className="shrink-0 ml-auto" />
    </a>
  );
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch { return ''; }
}
