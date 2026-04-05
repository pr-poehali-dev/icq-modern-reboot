import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { mediaItems } from '@/data/mockData';

type Tab = 'photo' | 'video' | 'music';

export default function MediaView() {
  const [tab, setTab] = useState<Tab>('photo');
  const [playing, setPlaying] = useState<number | null>(null);

  const photos = mediaItems.filter((m) => m.type === 'photo');
  const videos = mediaItems.filter((m) => m.type === 'video');
  const music = mediaItems.filter((m) => m.type === 'music');

  const tabs: { id: Tab; label: string; icon: string; count: number }[] = [
    { id: 'photo', label: 'Фото', icon: 'Image', count: photos.length },
    { id: 'video', label: 'Видео', icon: 'Film', count: videos.length },
    { id: 'music', label: 'Музыка', icon: 'Music', count: music.length },
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden animate-fade-in">
      <div className="px-6 pt-6 pb-4 border-b border-border shrink-0">
        <h2 className="text-xl font-semibold mb-4">Медиа</h2>
        <div className="flex gap-1 bg-secondary p-1 rounded-xl w-fit">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Icon name={t.icon} size={14} />
              {t.label}
              <span className={`text-[10px] ${tab === t.id ? 'text-[hsl(var(--primary))]' : 'text-muted-foreground'}`}>{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {tab === 'photo' && (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
            {photos.map((item) => (
              <div key={item.id} className="aspect-square rounded-xl overflow-hidden cursor-pointer group relative">
                <img src={item.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Icon name="Expand" size={20} className="text-white drop-shadow-lg" />
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'video' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {videos.map((item) => (
              <div key={item.id} className="rounded-xl overflow-hidden cursor-pointer group relative aspect-video">
                <img src={item.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/30 flex items-end p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      <Icon name="Play" size={14} className="text-white ml-0.5" />
                    </div>
                    <span className="text-white text-xs font-medium font-mono-ibm">{item.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'music' && (
          <div className="flex flex-col gap-2 max-w-xl">
            {music.map((item) => (
              <div key={item.id}
                className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-[hsl(var(--primary)/0.3)] hover:bg-[hsl(var(--primary)/0.03)] transition-all cursor-pointer group"
                onClick={() => setPlaying(playing === item.id ? null : item.id)}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all"
                  style={{ background: playing === item.id ? 'hsl(var(--primary))' : 'hsl(var(--secondary))' }}>
                  <Icon
                    name={playing === item.id ? 'Pause' : 'Play'}
                    size={16}
                    className={playing === item.id ? 'text-white ml-0.5' : 'text-muted-foreground ml-0.5 group-hover:text-foreground'}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.size}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-muted-foreground font-mono-ibm">{item.duration}</span>
                  <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all">
                    <Icon name="Download" size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
