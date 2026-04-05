import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPWA() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (isStandalone) { setInstalled(true); return; }

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!prompt) return;
    setInstalling(true);
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setInstalling(false);
    setPrompt(null);
  };

  if (installed) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#22c55e22' }}>
          <Icon name="CheckCircle" size={16} className="text-green-500" />
        </div>
        <div>
          <p className="text-sm font-medium">Приложение установлено</p>
          <p className="text-xs text-muted-foreground">Ping работает как нативное приложение</p>
        </div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border opacity-60">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-secondary">
          <Icon name="Download" size={16} className="text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">Установить приложение</p>
          <p className="text-xs text-muted-foreground">Откройте сайт в Chrome / Edge / Safari для установки</p>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={install}
      disabled={installing}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all hover:border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--primary)/0.05)] disabled:opacity-50"
      style={{ borderColor: 'hsl(var(--primary)/0.3)' }}
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'hsl(var(--primary)/0.15)' }}>
        {installing
          ? <Icon name="Loader2" size={16} className="text-[hsl(var(--primary))] animate-spin" />
          : <Icon name="Download" size={16} className="text-[hsl(var(--primary))]" />
        }
      </div>
      <div className="text-left">
        <p className="text-sm font-medium">{installing ? 'Устанавливаем...' : 'Установить Ping'}</p>
        <p className="text-xs text-muted-foreground">Работает без браузера, как обычное приложение</p>
      </div>
      {!installing && (
        <Icon name="ChevronRight" size={16} className="text-muted-foreground ml-auto" />
      )}
    </button>
  );
}
