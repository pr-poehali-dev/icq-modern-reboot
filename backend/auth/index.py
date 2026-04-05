"""
Авторизация пользователей мессенджера Ping.
action: register | login | me | logout
"""

import json
import os
import hashlib
import secrets
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p11440764_icq_modern_reboot')

COLORS = ['#4A9EFF', '#FF6B6B', '#FFB347', '#6BCB77', '#A78BFA', '#F472B6', '#34D399', '#FB923C']

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization',
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def make_token() -> str:
    return secrets.token_hex(32)

def make_avatar(name: str) -> str:
    parts = name.strip().split()
    if len(parts) >= 2:
        return parts[0][0].upper() + parts[1][0].upper()
    return name[:2].upper()

def ok(data: dict) -> dict:
    return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(data, ensure_ascii=False)}

def err(code: int, msg: str) -> dict:
    return {'statusCode': code, 'headers': CORS, 'body': json.dumps({'error': msg}, ensure_ascii=False)}

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    action = body.get('action', '')
    conn = get_conn()
    cur = conn.cursor()

    try:
        if action == 'register':
            name = body.get('name', '').strip()
            email = body.get('email', '').strip().lower()
            username = body.get('username', '').strip().lower()
            password = body.get('password', '')

            if not all([name, email, username, password]):
                return err(400, 'Заполните все поля')
            if len(password) < 6:
                return err(400, 'Пароль должен быть не менее 6 символов')

            cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE email = %s OR username = %s", (email, username))
            if cur.fetchone():
                return err(409, 'Email или username уже занят')

            color = COLORS[len(name) % len(COLORS)]
            avatar = make_avatar(name)
            pw_hash = hash_password(password)

            cur.execute(
                f"INSERT INTO {SCHEMA}.users (name, username, email, password_hash, avatar, color) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id",
                (name, username, email, pw_hash, avatar, color)
            )
            user_id = cur.fetchone()[0]
            token = make_token()
            cur.execute(f"INSERT INTO {SCHEMA}.sessions (user_id, token) VALUES (%s, %s)", (user_id, token))
            conn.commit()

            return ok({'token': token, 'user': {'id': user_id, 'name': name, 'username': username, 'email': email, 'avatar': avatar, 'color': color, 'role': ''}})

        if action == 'login':
            login = body.get('login', '').strip().lower()
            password = body.get('password', '')
            if not login or not password:
                return err(400, 'Введите логин и пароль')

            pw_hash = hash_password(password)
            cur.execute(
                f"SELECT id, name, username, email, avatar, color, role FROM {SCHEMA}.users WHERE (email = %s OR username = %s) AND password_hash = %s",
                (login, login, pw_hash)
            )
            row = cur.fetchone()
            if not row:
                return err(401, 'Неверный логин или пароль')

            user = {'id': row[0], 'name': row[1], 'username': row[2], 'email': row[3], 'avatar': row[4], 'color': row[5], 'role': row[6]}
            token = make_token()
            cur.execute(f"INSERT INTO {SCHEMA}.sessions (user_id, token) VALUES (%s, %s)", (user['id'], token))
            conn.commit()

            return ok({'token': token, 'user': user})

        if action == 'me':
            auth = event.get('headers', {}).get('X-Authorization') or event.get('headers', {}).get('Authorization', '')
            token = auth.replace('Bearer ', '').strip()
            if not token:
                return err(401, 'Нет токена')

            cur.execute(
                f"""SELECT u.id, u.name, u.username, u.email, u.avatar, u.color, u.role
                    FROM {SCHEMA}.sessions s
                    JOIN {SCHEMA}.users u ON u.id = s.user_id
                    WHERE s.token = %s AND s.expires_at > NOW()""",
                (token,)
            )
            row = cur.fetchone()
            if not row:
                return err(401, 'Сессия истекла')

            user = {'id': row[0], 'name': row[1], 'username': row[2], 'email': row[3], 'avatar': row[4], 'color': row[5], 'role': row[6]}
            return ok({'user': user})

        if action == 'logout':
            auth = event.get('headers', {}).get('X-Authorization') or event.get('headers', {}).get('Authorization', '')
            token = auth.replace('Bearer ', '').strip()
            if token:
                cur.execute(f"DELETE FROM {SCHEMA}.sessions WHERE token = %s", (token,))
                conn.commit()
            return ok({'ok': True})

        return err(400, 'Неизвестное действие')

    finally:
        cur.close()
        conn.close()
