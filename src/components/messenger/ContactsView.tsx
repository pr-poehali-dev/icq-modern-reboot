import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { contacts } from '@/data/mockData';

export default function ContactsView() {
  const [search, setSearch] = useState('');

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.role.toLowerCase().includes(search.toLowerCase())
  );

  const online = filtered.filter((c) => c.status === 'online');
  const offline = filtered.filter((c) => c.status !== 'online');

  return (
    <div className="flex-1 flex flex-col min-w-0 p-6 overflow-y-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Контакты</h2>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-90"
          style={{ background: 'hsl(var(--primary))', color: '#fff' }}>
          <Icon name="UserPlus" size={15} />
          Добавить
        </button>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск контактов..."
          className="w-full bg-secondary rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 ring-[hsl(var(--primary)/0.4)] transition-all"
        />
      </div>

      {online.length > 0 && (
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-4">В сети — {online.length}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {online.map((c) => <ContactCard key={c.id} contact={c} />)}
          </div>
        </div>
      )}

      {offline.length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-4">Не в сети — {offline.length}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {offline.map((c) => <ContactCard key={c.id} contact={c} />)}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 text-muted-foreground">
          <Icon name="UserX" size={32} />
          <span className="text-sm">Контакты не найдены</span>
        </div>
      )}
    </div>
  );
}

function ContactCard({ contact }: { contact: typeof contacts[0] }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl border border-border hover:border-[hsl(var(--primary)/0.3)] hover:bg-[hsl(var(--primary)/0.03)] transition-all cursor-pointer group">
      <div className="relative shrink-0">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold text-white"
          style={{ background: contact.color }}>
          {contact.avatar}
        </div>
        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background`}
          style={{ background: contact.status === 'online' ? '#22c55e' : contact.status === 'away' ? '#f59e0b' : '#6b7280' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{contact.name}</p>
        <p className="text-xs text-muted-foreground truncate">{contact.role}</p>
        <p className="text-[11px] mt-0.5" style={{ color: contact.status === 'online' ? '#22c55e' : 'hsl(var(--muted-foreground))' }}>
          {contact.status === 'online' ? 'В сети' : contact.status === 'away' ? 'Отошёл' : `Был(а) ${contact.lastSeen}`}
        </p>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-secondary hover:bg-[hsl(var(--primary)/0.15)] text-muted-foreground hover:text-[hsl(var(--primary))] transition-all">
          <Icon name="MessageSquare" size={14} />
        </button>
        <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-secondary hover:bg-[hsl(var(--primary)/0.15)] text-muted-foreground hover:text-[hsl(var(--primary))] transition-all">
          <Icon name="Phone" size={14} />
        </button>
      </div>
    </div>
  );
}
