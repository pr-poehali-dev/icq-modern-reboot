CREATE TABLE t_p11440764_icq_modern_reboot.users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar TEXT DEFAULT '',
  color TEXT DEFAULT '#4A9EFF',
  role TEXT DEFAULT '',
  status TEXT DEFAULT 'offline',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_p11440764_icq_modern_reboot.sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES t_p11440764_icq_modern_reboot.users(id),
  token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
);
