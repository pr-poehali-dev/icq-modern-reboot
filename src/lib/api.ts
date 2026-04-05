const AUTH_URL = 'https://functions.poehali.dev/27f1d522-d4b3-4402-9006-24d71e9ac121';

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  avatar: string;
  color: string;
  role: string;
}

async function call(body: Record<string, unknown>, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(AUTH_URL, { method: 'POST', headers, body: JSON.stringify(body) });
  const text = await res.text();
  let data: unknown;
  try { data = JSON.parse(text); } catch { data = text; }
  if (typeof data === 'string') {
    try { data = JSON.parse(data as string); } catch { /* keep as is */ }
  }
  return { ok: res.ok, status: res.status, data: data as Record<string, unknown> };
}

export async function apiRegister(name: string, username: string, email: string, password: string) {
  return call({ action: 'register', name, username, email, password });
}

export async function apiLogin(login: string, password: string) {
  return call({ action: 'login', login, password });
}

export async function apiMe(token: string) {
  return call({ action: 'me' }, token);
}

export async function apiLogout(token: string) {
  return call({ action: 'logout' }, token);
}
