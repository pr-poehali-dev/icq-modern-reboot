import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface ToggleProps { label: string; desc?: string; defaultOn?: boolean }

function Toggle({ label, desc, defaultOn = false }: ToggleProps) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-secondary transition-colors">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
      </div>
      <button
        onClick={() => setOn(!on)}
        className="relative w-11 h-6 rounded-full transition-all shrink-0"
        style={{ background: on ? 'hsl(var(--primary))' : 'hsl(var(--secondary))' }}
      >
        <span className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all"
          style={{ left: on ? '22px' : '4px' }} />
      </button>
    </div>
  );
}

const sections = [
  {
    title: 'Уведомления',
    icon: 'Bell',
    items: [
      { label: 'Уведомления о сообщениях', desc: 'Получать пуш при новом сообщении', defaultOn: true },
      { label: 'Уведомления о звонках', defaultOn: true },
      { label: 'Уведомления в тихом режиме', desc: 'Без звука, только значок' },
      { label: 'Предпросмотр сообщений', defaultOn: true },
    ],
  },
  {
    title: 'Приватность',
    icon: 'Lock',
    items: [
      { label: 'Статус «В сети»', desc: 'Показывать когда вы онлайн', defaultOn: true },
      { label: 'Время последнего входа', defaultOn: true },
      { label: 'Уведомление о прочтении', defaultOn: true },
      { label: 'Двухфакторная аутентификация' },
    ],
  },
  {
    title: 'Внешний вид',
    icon: 'Palette',
    items: [
      { label: 'Тёмная тема', defaultOn: true },
      { label: 'Компактный режим', desc: 'Уменьшить межстрочный интервал' },
      { label: 'Анимации интерфейса', defaultOn: true },
      { label: 'Крупный шрифт' },
    ],
  },
  {
    title: 'Хранилище',
    icon: 'HardDrive',
    items: [
      { label: 'Автозагрузка фото', defaultOn: true },
      { label: 'Автозагрузка видео' },
      { label: 'Сохранять медиа в галерею' },
    ],
  },
];

export default function SettingsView() {
  return (
    <div className="flex-1 flex flex-col min-w-0 p-6 overflow-y-auto animate-fade-in">
      <h2 className="text-xl font-semibold mb-6">Настройки</h2>

      <div className="flex flex-col gap-6 max-w-xl">
        {sections.map((section) => (
          <div key={section.title}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'hsl(var(--primary)/0.15)' }}>
                <Icon name={section.icon} size={14} className="text-[hsl(var(--primary))]" />
              </div>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{section.title}</p>
            </div>
            <div className="rounded-2xl border border-border overflow-hidden divide-y divide-border">
              {section.items.map((item) => (
                <Toggle key={item.label} {...item} />
              ))}
            </div>
          </div>
        ))}

        <div className="pt-4 border-t border-border flex flex-col gap-2">
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary transition-colors text-sm text-muted-foreground hover:text-foreground">
            <Icon name="HelpCircle" size={16} />
            Помощь и поддержка
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary transition-colors text-sm text-muted-foreground hover:text-foreground">
            <Icon name="Info" size={16} />
            О приложении — Ping v1.0
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-destructive/10 transition-colors text-sm text-destructive">
            <Icon name="Trash2" size={16} />
            Удалить аккаунт
          </button>
        </div>
      </div>
    </div>
  );
}
