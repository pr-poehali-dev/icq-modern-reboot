import Icon from '@/components/ui/icon';
import { notifications } from '@/data/mockData';

const typeIcon: Record<string, string> = {
  message: 'MessageSquare',
  call: 'Phone',
  contact: 'UserPlus',
  mention: 'AtSign',
};

export default function NotificationsView() {
  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);

  return (
    <div className="flex-1 flex flex-col min-w-0 p-6 overflow-y-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Уведомления</h2>
        {unread.length > 0 && (
          <button className="text-sm text-[hsl(var(--primary))] hover:opacity-75 transition-opacity">
            Прочитать все
          </button>
        )}
      </div>

      {unread.length > 0 && (
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-4">Новые — {unread.length}</p>
          <div className="flex flex-col gap-2">
            {unread.map((n) => <NotifRow key={n.id} notif={n} />)}
          </div>
        </div>
      )}

      {read.length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-4">Прочитанные</p>
          <div className="flex flex-col gap-2">
            {read.map((n) => <NotifRow key={n.id} notif={n} />)}
          </div>
        </div>
      )}

      {notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 text-muted-foreground">
          <Icon name="BellOff" size={32} />
          <span className="text-sm">Нет уведомлений</span>
        </div>
      )}
    </div>
  );
}

function NotifRow({ notif }: { notif: typeof notifications[0] }) {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer hover:border-[hsl(var(--primary)/0.2)] hover:bg-[hsl(var(--primary)/0.02)]
      ${notif.read ? 'border-border opacity-60' : 'border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--primary)/0.04)]'}`}>
      <div className="relative shrink-0">
        <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold text-white"
          style={{ background: notif.color }}>
          {notif.avatar}
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center bg-background border border-border">
          <Icon name={typeIcon[notif.type] ?? 'Bell'} size={10} className="text-muted-foreground" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug">{notif.text}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{notif.time} назад</p>
      </div>
      {!notif.read && (
        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: 'hsl(var(--primary))' }} />
      )}
    </div>
  );
}
