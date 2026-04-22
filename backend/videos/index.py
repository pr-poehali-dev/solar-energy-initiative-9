"""
GET  — список видео для публичной страницы /stories
POST — создать или обновить видео (только для администратора)
DELETE — удалить видео (только для администратора)
"""
import json
import os
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p32278697_solar_energy_initiat")

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
}


def check_auth(event: dict) -> bool:
    headers = {k.lower(): v for k, v in (event.get("headers") or {}).items()}
    token = headers.get("x-admin-token", "")
    return token == os.environ.get("ADMIN_PASSWORD", "")


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    method = event.get("httpMethod")

    # GET — публичный список
    if method == "GET":
        params = event.get("queryStringParameters") or {}
        admin_mode = params.get("admin") == "1"

        conn = psycopg2.connect(os.environ["DATABASE_URL"])
        try:
            cur = conn.cursor()
            if admin_mode:
                cur.execute(
                    f"SELECT id, title, description, video_url, published, created_at FROM {SCHEMA}.videos ORDER BY created_at DESC"
                )
            else:
                cur.execute(
                    f"SELECT id, title, description, video_url, published, created_at FROM {SCHEMA}.videos WHERE published = true ORDER BY created_at DESC"
                )
            rows = cur.fetchall()
        finally:
            conn.close()

        videos = [
            {
                "id": r[0],
                "title": r[1],
                "description": r[2],
                "video_url": r[3],
                "published": r[4],
                "created_at": r[5].isoformat() if r[5] else None,
            }
            for r in rows
        ]
        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({"videos": videos, "total": len(videos)}),
        }

    # POST / DELETE — только для админа
    if not check_auth(event):
        return {"statusCode": 403, "headers": CORS_HEADERS, "body": json.dumps({"error": "Forbidden"})}

    body = json.loads(event.get("body") or "{}")

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    try:
        cur = conn.cursor()

        if method == "DELETE":
            cur.execute(f"DELETE FROM {SCHEMA}.videos WHERE id = %s", (body.get("id"),))
            conn.commit()
            return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"ok": True})}

        if method == "POST":
            video_id = body.get("id")
            title = body.get("title", "").strip()
            description = body.get("description", "").strip()
            video_url = body.get("video_url", "").strip()
            published = body.get("published", True)

            if not title or not video_url:
                return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "title и video_url обязательны"})}

            if video_id:
                cur.execute(
                    f"UPDATE {SCHEMA}.videos SET title=%s, description=%s, video_url=%s, published=%s WHERE id=%s RETURNING id",
                    (title, description, video_url, published, video_id),
                )
            else:
                cur.execute(
                    f"INSERT INTO {SCHEMA}.videos (title, description, video_url, published) VALUES (%s, %s, %s, %s) RETURNING id",
                    (title, description, video_url, published),
                )
            row = cur.fetchone()
            conn.commit()
            return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"ok": True, "id": row[0]})}

    finally:
        conn.close()

    return {"statusCode": 405, "headers": CORS_HEADERS, "body": json.dumps({"error": "Method not allowed"})}
