import { useState, useRef, useEffect } from 'react';
import { STATUSES, STATUS_GROUPS, getStatus } from '@/lib/statuses';

interface StatusPickerProps {
  current: string;
  onChange: (id: string) => void;
  size?: 'sm' | 'md';
}

export default function StatusPicker({ current, onChange, size = 'md' }: StatusPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const st = getStatus(current);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const dotSize = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-secondary transition-colors text-xs font-medium"
        title="Изменить статус"
      >
        <span className={`${dotSize} rounded-full shrink-0 ring-2 ring-background`} style={{ background: st.dotColor }} />
        <span className="text-muted-foreground">{st.emoji} {st.label}</span>
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 left-0 z-50 w-52 rounded-2xl border border-border shadow-2xl overflow-hidden animate-slide-up"
          style={{ background: 'hsl(var(--card))' }}>
          {STATUS_GROUPS.map((group) => {
            const items = STATUSES.filter((s) => s.group === group.id);
            return (
              <div key={group.id}>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-3 pt-3 pb-1">{group.label}</p>
                {items.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { onChange(s.id); setOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-secondary
                      ${current === s.id ? 'bg-[hsl(var(--primary)/0.08)]' : ''}`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.dotColor }} />
                    <span>{s.emoji}</span>
                    <span className={current === s.id ? 'text-[hsl(var(--primary))] font-medium' : ''}>{s.label}</span>
                    {current === s.id && <span className="ml-auto text-[hsl(var(--primary))]">✓</span>}
                  </button>
                ))}
              </div>
            );
          })}
          <div className="h-2" />
        </div>
      )}
    </div>
  );
}
