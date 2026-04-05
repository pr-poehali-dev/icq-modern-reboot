"""
Загрузка файлов в S3. Принимает base64, отдаёт CDN URL.
Поддерживает: изображения, видео, аудио, документы.
"""
import json, os, base64, uuid, mimetypes
import boto3
import psycopg2

S = os.environ.get('MAIN_DB_SCHEMA', 't_p11440764_icq_modern_reboot')
CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization',
}

def get_conn(): return psycopg2.connect(os.environ['DATABASE_URL'])
def ok(d): return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(d, ensure_ascii=False)}
def err(c, m): return {'statusCode': c, 'headers': CORS, 'body': json.dumps({'error': m}, ensure_ascii=False)}

def get_user(cur, token):
    cur.execute(f"""SELECT u.id FROM {S}.sessions s JOIN {S}.users u ON u.id=s.user_id
        WHERE s.token=%s AND s.expires_at>NOW()""", (token,))
    row = cur.fetchone()
    return row[0] if row else None

MIME_TO_TYPE = {
    'image': 'image', 'video': 'video', 'audio': 'audio',
}

def get_file_type(mime: str) -> str:
    for k, v in MIME_TO_TYPE.items():
        if mime.startswith(k + '/'):
            return v
    return 'file'

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    auth = (event.get('headers') or {}).get('X-Authorization') or (event.get('headers') or {}).get('Authorization', '')
    token = auth.replace('Bearer ', '').strip()

    conn = get_conn(); cur = conn.cursor()
    try:
        user_id = get_user(cur, token)
        if not user_id: return err(401, 'Не авторизован')

        body = json.loads(event.get('body') or '{}')
        data_b64  = body.get('data', '')       # base64 содержимое файла
        file_name = body.get('name', 'file')   # оригинальное имя
        mime_type = body.get('mime', 'application/octet-stream')

        if not data_b64: return err(400, 'Файл не передан')

        # Ограничение 20 МБ
        raw = base64.b64decode(data_b64)
        if len(raw) > 20 * 1024 * 1024:
            return err(400, 'Файл слишком большой (максимум 20 МБ)')

        ext = os.path.splitext(file_name)[1] or mimetypes.guess_extension(mime_type) or ''
        key = f"ping/{user_id}/{uuid.uuid4().hex}{ext}"

        s3 = boto3.client(
            's3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
        )
        s3.put_object(Bucket='files', Key=key, Body=raw, ContentType=mime_type)

        cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
        file_type = get_file_type(mime_type)

        return ok({
            'url': cdn_url,
            'name': file_name,
            'type': file_type,
            'size': len(raw),
            'mime': mime_type,
        })
    finally:
        cur.close(); conn.close()
