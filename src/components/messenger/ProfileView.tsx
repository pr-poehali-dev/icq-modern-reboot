import Icon from '@/components/ui/icon';
import type { User } from '@/lib/api';

interface ProfileViewProps {
  user: User;
}

export default function ProfileView({ user }: ProfileViewProps) {
  const stats = [
    { label: 'Сообщений', value: '0' },
    { label: 'Контактов', value: '0' },
    { label: 'Файлов', value: '0' },
  ];

  const info = [
    { icon: 'Mail', label: 'Email', value: user.email },
    { icon: 'AtSign', label: 'Username', value: `@${user.username}` },
    { icon: 'Briefcase', label: 'Должность', value: user.role || 'Не указано' },
    { icon: 'Hash', label: 'Ping ID', value: String(user.id) },
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto animate-fade-in">
      <div className="h-40 shrink-0 relative" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)/0.3) 0%, hsl(var(--primary)/0.05) 100%)' }}>
        <div className="absolute inset-0" style={{ background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%234A9EFF\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
      </div>

      <div className="px-6 pb-6">
        <div className="flex items-end justify-between -mt-10 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white border-4 border-background"
              style={{ background: user.color }}>
              {user.avatar}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg flex items-center justify-center border-2 border-background"
              style={{ background: 'hsl(var(--primary))' }}>
              <Icon name="Camera" size={12} className="text-white" />
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-border hover:border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--primary)/0.05)] transition-all">
            <Icon name="Pencil" size={14} />
            Редактировать
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold">{user.name}</h2>
          <p className="text-muted-foreground text-sm mt-1">@{user.username}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center p-4 rounded-2xl border border-border">
              <p className="text-xl font-semibold">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-4">Информация</p>
          <div className="flex flex-col gap-2 max-w-md">
            {info.map((item) => (
              <div key={item.label} className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary transition-colors">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-secondary">
                  <Icon name={item.icon} size={14} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
