export interface StatusConfig {
  id: string;
  label: string;
  emoji: string;
  color: string;
  dotColor: string;
  group: 'active' | 'busy' | 'away';
}

export const STATUSES: StatusConfig[] = [
  { id: 'online',   label: 'В сети',      emoji: '🟢', color: '#22c55e', dotColor: '#22c55e', group: 'active' },
  { id: 'work',     label: 'На работе',   emoji: '💼', color: '#4A9EFF', dotColor: '#4A9EFF', group: 'active' },
  { id: 'study',    label: 'На учёбе',    emoji: '📚', color: '#818cf8', dotColor: '#818cf8', group: 'active' },
  { id: 'busy',     label: 'Занят',       emoji: '🔴', color: '#ef4444', dotColor: '#ef4444', group: 'busy'   },
  { id: 'sick',     label: 'Болею',       emoji: '🤒', color: '#f97316', dotColor: '#f97316', group: 'busy'   },
  { id: 'angry',    label: 'Злой',        emoji: '😠', color: '#dc2626', dotColor: '#dc2626', group: 'busy'   },
  { id: 'sad',      label: 'Грустный',    emoji: '😔', color: '#64748b', dotColor: '#64748b', group: 'away'   },
  { id: 'away',     label: 'Отошёл',      emoji: '🕐', color: '#f59e0b', dotColor: '#f59e0b', group: 'away'   },
  { id: 'vacation', label: 'В отпуске',   emoji: '🌴', color: '#10b981', dotColor: '#10b981', group: 'away'   },
  { id: 'sleep',    label: 'Сплю',        emoji: '😴', color: '#8b5cf6', dotColor: '#8b5cf6', group: 'away'   },
  { id: 'offline',  label: 'Не в сети',   emoji: '⚫', color: '#6b7280', dotColor: '#6b7280', group: 'away'   },
];

export const STATUS_GROUPS = [
  { id: 'active', label: 'Активен' },
  { id: 'busy',   label: 'Занят' },
  { id: 'away',   label: 'Недоступен' },
] as const;

export function getStatus(id: string): StatusConfig {
  return STATUSES.find((s) => s.id === id) ?? STATUSES[STATUSES.length - 1];
}

export function isOnlineGroup(id: string): boolean {
  const s = getStatus(id);
  return s.group === 'active';
}
