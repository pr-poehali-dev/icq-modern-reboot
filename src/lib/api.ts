const AUTH_URL     = 'https://functions.poehali.dev/27f1d522-d4b3-4402-9006-24d71e9ac121';
const CHATS_URL    = 'https://functions.poehali.dev/ee757970-8a6b-420e-8125-f64ee68f79d8';
const MESSAGES_URL = 'https://functions.poehali.dev/ba92307d-3093-4471-9331-838be59f27a9';
const UPLOAD_URL   = 'https://functions.poehali.dev/50e35d4a-c4e1-4856-9912-c7b0b1ed1c98';

export interface User {
  id: number; name: string; username: string;
  email: string; avatar: string; color: string; role: string;
}

export interface ChatItem {
  id: number; type: 'direct' | 'group';
  name: string; avatar: string; color: string;
  partner: { id: number; name: string; avatar: string; color: string; username: string } | null;
  last_msg: { text: string; time: string } | null;
  unread: number;
}

export interface Message {
  id: number; chat_id: number;
  user_id: number; user_name: string; user_avatar: string; user_color: string;
  text: string;
  file_url: string; file_name: string; file_type: string; file_size: number;
  created_at: string;
}

export interface SearchUser {
  id: number; name: string; username: string; avatar: string; color: string;
}

async function call(url: string, body: Record<string, unknown>, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res  = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  let data: unknown;
  try {
    const text = await res.text();
    data = JSON.parse(text);
    if (typeof data === 'string') data = JSON.parse(data);
  } catch { data = {}; }
  return { ok: res.ok, status: res.status, data: data as Record<string, unknown> };
}

// ── Auth ──
export const apiRegister = (name: string, username: string, email: string, password: string) =>
  call(AUTH_URL, { action: 'register', name, username, email, password });
export const apiLogin  = (login: string, password: string) =>
  call(AUTH_URL, { action: 'login', login, password });
export const apiMe     = (token: string) => call(AUTH_URL, { action: 'me' }, token);
export const apiLogout = (token: string) => call(AUTH_URL, { action: 'logout' }, token);

// ── Chats ──
export const apiChatList      = (token: string) =>
  call(CHATS_URL, { action: 'list' }, token);
export const apiOpenDirect    = (token: string, user_id: number) =>
  call(CHATS_URL, { action: 'open_direct', user_id }, token);
export const apiCreateGroup   = (token: string, name: string, member_ids: number[]) =>
  call(CHATS_URL, { action: 'create_group', name, member_ids }, token);
export const apiSearchUsers   = (token: string, q: string) =>
  call(CHATS_URL, { action: 'search_users', q }, token);
export const apiChatMembers   = (token: string, chat_id: number) =>
  call(CHATS_URL, { action: 'members', chat_id }, token);

// ── Messages ──
export const apiHistory = (token: string, chat_id: number, before_id?: number) =>
  call(MESSAGES_URL, { action: 'history', chat_id, before_id }, token);
export const apiPoll    = (token: string, chat_id: number, after_id: number) =>
  call(MESSAGES_URL, { action: 'poll', chat_id, after_id }, token);
export const apiSend    = (token: string, chat_id: number, text: string,
  file_url?: string, file_name?: string, file_type?: string, file_size?: number) =>
  call(MESSAGES_URL, { action: 'send', chat_id, text, file_url, file_name, file_type, file_size }, token);

// ── Upload ──
export async function apiUpload(token: string, file: File) {
  const buf  = await file.arrayBuffer();
  const b64  = btoa(String.fromCharCode(...new Uint8Array(buf)));
  return call(UPLOAD_URL, { data: b64, name: file.name, mime: file.type }, token);
}
