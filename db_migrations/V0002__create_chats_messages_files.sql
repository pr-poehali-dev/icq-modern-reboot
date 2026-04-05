-- Чаты (личные и групповые)
CREATE TABLE t_p11440764_icq_modern_reboot.chats (
  id          SERIAL PRIMARY KEY,
  type        TEXT NOT NULL DEFAULT 'direct', -- 'direct' | 'group'
  name        TEXT,                           -- для групп
  avatar      TEXT DEFAULT '',               -- эмодзи или инициалы группы
  color       TEXT DEFAULT '#4A9EFF',
  created_by  INTEGER REFERENCES t_p11440764_icq_modern_reboot.users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Участники чатов
CREATE TABLE t_p11440764_icq_modern_reboot.chat_members (
  id       SERIAL PRIMARY KEY,
  chat_id  INTEGER NOT NULL REFERENCES t_p11440764_icq_modern_reboot.chats(id),
  user_id  INTEGER NOT NULL REFERENCES t_p11440764_icq_modern_reboot.users(id),
  role     TEXT DEFAULT 'member', -- 'admin' | 'member'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(chat_id, user_id)
);

-- Сообщения
CREATE TABLE t_p11440764_icq_modern_reboot.messages (
  id         SERIAL PRIMARY KEY,
  chat_id    INTEGER NOT NULL REFERENCES t_p11440764_icq_modern_reboot.chats(id),
  user_id    INTEGER NOT NULL REFERENCES t_p11440764_icq_modern_reboot.users(id),
  text       TEXT DEFAULT '',
  file_url   TEXT DEFAULT '',
  file_name  TEXT DEFAULT '',
  file_type  TEXT DEFAULT '', -- 'image' | 'video' | 'audio' | 'file'
  file_size  INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для быстрой выборки
CREATE INDEX ON t_p11440764_icq_modern_reboot.messages(chat_id, created_at DESC);
CREATE INDEX ON t_p11440764_icq_modern_reboot.chat_members(user_id);
