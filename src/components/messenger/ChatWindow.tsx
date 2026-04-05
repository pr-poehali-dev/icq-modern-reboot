import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { chats, contacts } from '@/data/mockData';
import { getStatus, isOnlineGroup } from '@/lib/statuses';

interface ChatWindowProps {
  chatId: number | null;
}

interface Msg {
  id: number; text: string; from: string; time: string; date: string;
}

export default function ChatWindow({ chatId }: ChatWindowProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Msg[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const chat = chats.find((c) => c.id === chatId);
  const contact = chat ? contacts.find((ct) => ct.id === chat.contactId) : null;

  useEffect(() => {
    if (chat) setMessages(chat.messages);
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    setMessages((prev) => [...prev, { id: Date.now(), text: input.trim(), from: 'me', time, date: 'сегодня' }]);
    setInput('');
  };

  if (!chatId || !contact || !chat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground animate-fade-in">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: 'hsl(var(--secondary))' }}>
          <Icon name="MessageSquare" size={36} />
        </div>
        <div className="text-center">
          <p className="text-base font-medium text-foreground">Выберите чат</p>
          <p className="text-sm mt-1">Начните общение или найдите контакт</p>
        </div>
      </div>
    );
  }

  const grouped = messages.reduce<{ date: string; msgs: Msg[] }[]>((acc, msg) => {
    const last = acc[acc.length - 1];
    if (last && last.date === msg.date) { last.msgs.push(msg); }
    else acc.push({ date: msg.date, msgs: [msg] });
    return acc;
  }, []);

  return (
    <div className="flex-1 flex flex-col min-w-0 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
        <div className="relative">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white"
            style={{ background: contact.color }}>
            {contact.avatar}
          </div>
          {isOnlineGroup(contact.status) ? (
            <span className="absolute -bottom-0.5 -right-0.5 text-xs leading-none">{getStatus(contact.status).emoji}</span>
          ) : (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-background"
              style={{ background: getStatus(contact.status).dotColor }} />
          )}
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">{contact.name}</p>
          <p className="text-xs font-medium" style={{ color: getStatus(contact.status).color }}>
            {getStatus(contact.status).emoji} {getStatus(contact.status).label}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
            <Icon name="Phone" size={16} />
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
            <Icon name="Video" size={16} />
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
            <Icon name="MoreHorizontal" size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-1">
        {grouped.map((group) => (
          <div key={group.date}>
            <div className="flex items-center justify-center my-4">
              <span className="text-[11px] text-muted-foreground bg-secondary px-3 py-1 rounded-full">{group.date}</span>
            </div>
            <div className="flex flex-col gap-1">
              {group.msgs.map((msg, i) => (
                <div key={msg.id} className={`flex animate-msg-in ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}
                  style={{ animationDelay: `${i * 0.03}s` }}>
                  <div className={`max-w-[60%] px-4 py-2.5 group relative ${msg.from === 'me' ? 'msg-bubble-out' : 'msg-bubble-in'}`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <p className={`text-[10px] mt-1 text-right ${msg.from === 'me' ? 'text-white/60' : 'text-muted-foreground'}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-5 py-4 border-t border-border shrink-0">
        <div className="flex items-end gap-3 bg-secondary rounded-2xl px-4 py-3">
          <button className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <Icon name="Paperclip" size={18} />
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Написать сообщение..."
            rows={1}
            className="flex-1 bg-transparent text-sm outline-none resize-none placeholder:text-muted-foreground leading-relaxed max-h-32"
          />
          <button className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <Icon name="Smile" size={18} />
          </button>
          <button
            onClick={send}
            disabled={!input.trim()}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0 disabled:opacity-30"
            style={{ background: input.trim() ? 'hsl(var(--primary))' : 'transparent', color: input.trim() ? '#fff' : 'hsl(var(--muted-foreground))' }}
          >
            <Icon name="Send" size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}