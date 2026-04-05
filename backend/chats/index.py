"""
Управление чатами: список, создание личного и группового чата, поиск пользователей.
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
    cur.execute(f"""SELECT u.id, u.name, u.username, u.avatar, u.color
        FROM {S}.sessions s JOIN {S}.users u ON u.id=s.user_id
        WHERE s.token=%s AND s.expires_at>NOW()""", (token,))
    row = cur.fetchone()
    if not row: return None
    return {'id': row[0], 'name': row[1], 'username': row[2], 'avatar': row[3], 'color': row[4]}

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

        # Список моих чатов
        if action == 'list':
            cur.execute(f"""
                SELECT c.id, c.type, c.name, c.avatar, c.color,
                       m.created_at as last_time,
                       m.text as last_text, m.file_type as last_ftype,
                       m.user_id as last_uid,
                       (SELECT COUNT(*) FROM {S}.messages m2
                        WHERE m2.chat_id=c.id AND m2.user_id!=%s
                        AND m2.created_at > COALESCE(
                            (SELECT joined_at FROM {S}.chat_members WHERE chat_id=c.id AND user_id=%s), NOW()-INTERVAL '1 year'
                        )) as unread
                FROM {S}.chats c
                JOIN {S}.chat_members cm ON cm.chat_id=c.id AND cm.user_id=%s
                LEFT JOIN LATERAL (
                    SELECT text, file_type, user_id, created_at
                    FROM {S}.messages WHERE chat_id=c.id ORDER BY created_at DESC LIMIT 1
                ) m ON true
                ORDER BY COALESCE(m.created_at, c.created_at) DESC
            """, (me['id'], me['id'], me['id']))
            rows = cur.fetchall()
            result = []
            for r in rows:
                chat_id, ctype, cname, cavatar, ccolor, lt, ltxt, lftype, luid, unread = r
                # Для личного чата — имя и аватар собеседника
                display_name = cname
                display_avatar = cavatar
                display_color = ccolor
                partner = None
                if ctype == 'direct':
                    cur.execute(f"""SELECT u.id, u.name, u.avatar, u.color, u.username
                        FROM {S}.chat_members cm JOIN {S}.users u ON u.id=cm.user_id
                        WHERE cm.chat_id=%s AND cm.user_id!=%s LIMIT 1""", (chat_id, me['id']))
                    p = cur.fetchone()
                    if p:
                        partner = {'id': p[0], 'name': p[1], 'avatar': p[2], 'color': p[3], 'username': p[4]}
                        display_name = p[1]; display_avatar = p[2]; display_color = p[3]
                last_msg = None
                if lt:
                    prefix = ''
                    if luid == me['id']: prefix = 'Вы: '
                    text = ltxt if ltxt else ('📎 Файл' if lftype == 'file' else ('🖼 Фото' if lftype == 'image' else '📹 Видео'))
                    last_msg = {'text': prefix + text, 'time': str(lt)}
                result.append({'id': chat_id, 'type': ctype, 'name': display_name,
                    'avatar': display_avatar, 'color': display_color,
                    'partner': partner, 'last_msg': last_msg, 'unread': unread or 0})
            return ok({'chats': result})

        # Создать личный чат или найти существующий
        if action == 'open_direct':
            partner_id = body.get('user_id')
            if not partner_id: return err(400, 'user_id обязателен')
            if partner_id == me['id']: return err(400, 'Нельзя открыть чат с собой')
            # Ищем существующий личный чат
            cur.execute(f"""SELECT c.id FROM {S}.chats c
                JOIN {S}.chat_members a ON a.chat_id=c.id AND a.user_id=%s
                JOIN {S}.chat_members b ON b.chat_id=c.id AND b.user_id=%s
                WHERE c.type='direct' LIMIT 1""", (me['id'], partner_id))
            row = cur.fetchone()
            if row:
                return ok({'chat_id': row[0], 'created': False})
            # Создаём новый
            cur.execute(f"INSERT INTO {S}.chats (type, created_by) VALUES ('direct', %s) RETURNING id", (me['id'],))
            chat_id = cur.fetchone()[0]
            cur.execute(f"INSERT INTO {S}.chat_members (chat_id, user_id, role) VALUES (%s,%s,'member'),(%s,%s,'member')",
                (chat_id, me['id'], chat_id, partner_id))
            conn.commit()
            return ok({'chat_id': chat_id, 'created': True})

        # Создать группу
        if action == 'create_group':
            name = body.get('name', '').strip()
            member_ids = body.get('member_ids', [])
            if not name: return err(400, 'Название группы обязательно')
            if len(member_ids) < 1: return err(400, 'Добавьте хотя бы одного участника')
            colors = ['#4A9EFF','#FF6B6B','#6BCB77','#A78BFA','#F472B6','#FFB347']
            color = colors[len(name) % len(colors)]
            avatar = name[:2].upper()
            cur.execute(f"INSERT INTO {S}.chats (type, name, avatar, color, created_by) VALUES ('group',%s,%s,%s,%s) RETURNING id",
                (name, avatar, color, me['id']))
            chat_id = cur.fetchone()[0]
            all_ids = list(set([me['id']] + member_ids))
            for uid in all_ids:
                role = 'admin' if uid == me['id'] else 'member'
                cur.execute(f"INSERT INTO {S}.chat_members (chat_id, user_id, role) VALUES (%s,%s,%s)", (chat_id, uid, role))
            conn.commit()
            return ok({'chat_id': chat_id})

        # Поиск пользователей
        if action == 'search_users':
            q = body.get('q', '').strip()
            if len(q) < 1: return ok({'users': []})
            cur.execute(f"""SELECT id, name, username, avatar, color FROM {S}.users
                WHERE (name ILIKE %s OR username ILIKE %s) AND id!=%s LIMIT 20""",
                (f'%{q}%', f'%{q}%', me['id']))
            rows = cur.fetchall()
            users = [{'id': r[0], 'name': r[1], 'username': r[2], 'avatar': r[3], 'color': r[4]} for r in rows]
            return ok({'users': users})

        # Участники чата
        if action == 'members':
            chat_id = body.get('chat_id')
            cur.execute(f"""SELECT u.id, u.name, u.username, u.avatar, u.color, cm.role
                FROM {S}.chat_members cm JOIN {S}.users u ON u.id=cm.user_id
                WHERE cm.chat_id=%s""", (chat_id,))
            rows = cur.fetchall()
            members = [{'id': r[0], 'name': r[1], 'username': r[2], 'avatar': r[3], 'color': r[4], 'role': r[5]} for r in rows]
            return ok({'members': members})

        return err(400, 'Неизвестное действие')
    finally:
        cur.close(); conn.close()
