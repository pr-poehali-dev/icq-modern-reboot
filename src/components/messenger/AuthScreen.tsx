import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { apiLogin, apiRegister } from '@/lib/api';
import type { User } from '@/lib/api';

interface AuthScreenProps {
  onAuth: (token: string, user: User) => void;
}

export default function AuthScreen({ onAuth }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });

  const set = (k: string, v: string) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    setError('');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let res;
      if (mode === 'login') {
        res = await apiLogin(form.email, form.password);
      } else {
        res = await apiRegister(form.name, form.username, form.email, form.password);
      }
      if (!res.ok) {
        setError((res.data as { error?: string }).error || 'Ошибка сервера');
        return;
      }
      const token = (res.data as { token: string }).token;
      const user = (res.data as { user: User }).user;
      localStorage.setItem('ping_token', token);
      onAuth(token, user);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-background animate-fade-in">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full opacity-5 blur-3xl"
          style={{ background: 'hsl(var(--primary))' }} />
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 rounded-full opacity-5 blur-3xl"
          style={{ background: 'hsl(var(--primary))' }} />
      </div>

      <div className="w-full max-w-sm px-6 animate-slide-up relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'hsl(var(--primary))' }}>
            <span className="text-white font-bold text-2xl font-mono-ibm">P</span>
          </div>
          <h1 className="text-2xl font-semibold">Ping</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {mode === 'login' ? 'Добро пожаловать обратно' : 'Создайте аккаунт'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-secondary p-1 rounded-xl mb-6">
          {(['login', 'register'] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all
                ${mode === m ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              {m === 'login' ? 'Войти' : 'Регистрация'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={submit} className="flex flex-col gap-3">
          {mode === 'register' && (
            <>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Имя</label>
                <input
                  value={form.name} onChange={(e) => set('name', e.target.value)}
                  placeholder="Иван Иванов" required
                  className="w-full bg-secondary rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 ring-[hsl(var(--primary)/0.5)] transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Username</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                  <input
                    value={form.username} onChange={(e) => set('username', e.target.value)}
                    placeholder="ivan_ivanov" required
                    className="w-full bg-secondary rounded-xl px-4 pl-8 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 ring-[hsl(var(--primary)/0.5)] transition-all"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">
              {mode === 'login' ? 'Email или username' : 'Email'}
            </label>
            <input
              value={form.email} onChange={(e) => set('email', e.target.value)}
              placeholder={mode === 'login' ? 'email или @username' : 'you@example.com'}
              required type={mode === 'register' ? 'email' : 'text'}
              className="w-full bg-secondary rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 ring-[hsl(var(--primary)/0.5)] transition-all"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Пароль</label>
            <input
              value={form.password} onChange={(e) => set('password', e.target.value)}
              placeholder={mode === 'register' ? 'Минимум 6 символов' : '••••••••'}
              required type="password" minLength={6}
              className="w-full bg-secondary rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 ring-[hsl(var(--primary)/0.5)] transition-all"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
              style={{ background: 'hsl(var(--destructive)/0.1)', color: 'hsl(var(--destructive))' }}>
              <Icon name="AlertCircle" size={14} />
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="mt-1 w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'hsl(var(--primary))', color: '#fff' }}>
            {loading ? (
              <><Icon name="Loader2" size={15} className="animate-spin" />Подождите...</>
            ) : (
              mode === 'login' ? 'Войти' : 'Создать аккаунт'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Ping — безопасный мессенджер нового поколения
        </p>
      </div>
    </div>
  );
}
