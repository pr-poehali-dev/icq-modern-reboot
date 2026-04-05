"""
Сообщения: получение истории и отправка (текст + файл).
Polling для real-time: клиент запрашивает новые сообщения с after_id.
"""
import json, os
import psycopg2

S = os.environ.get('MAIN_DB_SCHEMA', 't_p11440764_icq_modern_reboot')
CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization',
}

def get_conn(): return psycopg2.connect(os.environ['DATABASE_URL'])
def ok(d): return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(d, ensure_ascii=False, default=str)}
def err(c, m): return {'statusCode': c, 'headers': CORS, 'body': json.dumps({'error': m}, ensure_ascii=False)}

def get_user(cur, token):
    cur.execute(f"""SELECT u.id, u.name, u.avatar, u.color
        FROM {S}.sessions s JOIN {S}.users u ON u.id=s.user_id
        WHERE s.token=%s AND s.expires_at>NOW()""", (token,))
    row = cur.fetchone()
    if not row: return None
    return {'id': row[0], 'name': row[1], 'avatar': row[2], 'color': row[3]}

def is_member(cur, chat_id, user_id):
    cur.execute(f"SELECT 1 FROM {S}.chat_members WHERE chat_id=%s AND user_id=%s", (chat_id, user_id))
    return cur.fetchone() is not None

def fmt_msg(row):
    return {
        'id': row[0], 'chat_id': row[1],
        'user_id': row[2], 'user_name': row[3], 'user_avatar': row[4], 'user_color': row[5],
        'text': row[6] or '',
        'file_url': row[7] or '', 'file_name': row[8] or '',
        'file_type': row[9] or '', 'file_size': row[10] or 0,
        'created_at': str(row[11]),
    }

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    auth = (event.get('headers') or {}).get('X-Authorization') or (event.get('headers') or {}).get('Authorization', '')
    token = auth.replace('Bearer ', '').strip()

    body = json.loads(event.get('body') or '{}')
    action = body.get('action', '')

    conn = get_conn(); cur = conn.cursor()
    try:
        me = get_user(cur, token)
        if not me: return err(401, 'Не авторизован')

        # История сообщений (с пагинацией)
        if action == 'history':
            chat_id  = body.get('chat_id')
            before_id = body.get('before_id')   # для постраничной подгрузки
            limit    = min(int(body.get('limit', 50)), 100)
            if not chat_id: return err(400, 'chat_id обязателен')
            if not is_member(cur, chat_id, me['id']): return err(403, 'Нет доступа')

            if before_id:
                cur.execute(f"""SELECT m.id, m.chat_id, m.user_id,
                    u.name, u.avatar, u.color,
                    m.text, m.file_url, m.file_name, m.file_type, m.file_size, m.created_at
                    FROM {S}.messages m JOIN {S}.users u ON u.id=m.user_id
                    WHERE m.chat_id=%s AND m.id<%s ORDER BY m.id DESC LIMIT %s""",
                    (chat_id, before_id, limit))
            else:
                cur.execute(f"""SELECT m.id, m.chat_id, m.user_id,
                    u.name, u.avatar, u.color,
                    m.text, m.file_url, m.file_name, m.file_type, m.file_size, m.created_at
                    FROM {S}.messages m JOIN {S}.users u ON u.id=m.user_id
                    WHERE m.chat_id=%s ORDER BY m.id DESC LIMIT %s""",
                    (chat_id, limit))
            rows = cur.fetchall()
            msgs = [fmt_msg(r) for r in reversed(rows)]
            return ok({'messages': msgs, 'has_more': len(rows) == limit})

        # Polling: новые сообщения после last_id
        if action == 'poll':
            chat_id = body.get('chat_id')
            after_id = body.get('after_id', 0)
            if not chat_id: return err(400, 'chat_id обязателен')
            if not is_member(cur, chat_id, me['id']): return err(403, 'Нет доступа')
            cur.execute(f"""SELECT m.id, m.chat_id, m.user_id,
                u.name, u.avatar, u.color,
                m.text, m.file_url, m.file_name, m.file_type, m.file_size, m.created_at
                FROM {S}.messages m JOIN {S}.users u ON u.id=m.user_id
                WHERE m.chat_id=%s AND m.id>%s ORDER BY m.id ASC LIMIT 50""",
                (chat_id, after_id))
            rows = cur.fetchall()
            return ok({'messages': [fmt_msg(r) for r in rows]})

        # Отправить сообщение
        if action == 'send':
            chat_id   = body.get('chat_id')
            text      = body.get('text', '').strip()
            file_url  = body.get('file_url', '')
            file_name = body.get('file_name', '')
            file_type = body.get('file_type', '')
            file_size = body.get('file_size', 0)
            if not chat_id: return err(400, 'chat_id обязателен')
            if not text and not file_url: return err(400, 'Пустое сообщение')
            if not is_member(cur, chat_id, me['id']): return err(403, 'Нет доступа')
            cur.execute(f"""INSERT INTO {S}.messages
                (chat_id, user_id, text, file_url, file_name, file_type, file_size)
                VALUES (%s,%s,%s,%s,%s,%s,%s) RETURNING id, created_at""",
                (chat_id, me['id'], text, file_url, file_name, file_type, file_size))
            msg_id, created_at = cur.fetchone()
            conn.commit()
            msg = {
                'id': msg_id, 'chat_id': chat_id,
                'user_id': me['id'], 'user_name': me['name'],
                'user_avatar': me['avatar'], 'user_color': me['color'],
                'text': text, 'file_url': file_url, 'file_name': file_name,
                'file_type': file_type, 'file_size': file_size,
                'created_at': str(created_at),
            }
            return ok({'message': msg})

        return err(400, 'Неизвестное действие')
    finally:
        cur.close(); conn.close()
