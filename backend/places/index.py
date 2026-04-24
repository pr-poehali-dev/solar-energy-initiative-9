"""
Управление местами (рестораны, санатории, развлечения) с оценкой доступности.
GET — публичный список. POST/PUT/DELETE — только для администратора.
GET ?type=support — список обращений в поддержку (только для админа).
POST ?type=support — создать обращение (публично).
PUT ?type=support — ответить на обращение (только для админа).
"""
import json
import os
import psycopg2
from datetime import datetime, timezone

SCHEMA = "t_p32278697_solar_energy_initiat"

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
}


def check_admin(event):
    token = event.get("headers", {}).get("X-Admin-Token", "")
    p1 = os.environ.get("ADMIN_PASSWORD", "")
    p2 = os.environ.get("ADMIN_PASSWORD_2", "")
    return (p1 and token == p1) or (p2 and token == p2)


def handle_support(event, method, params):
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    try:
        cur = conn.cursor()

        # POST — создать новый тикет (публично)
        if method == "POST":
            body = json.loads(event.get("body") or "{}")
            # Если admin отправляет сообщение в существующий тикет
            ticket_id = body.get("ticket_id")
            if ticket_id and check_admin(event):
                text = body.get("text", "").strip()
                if not text:
                    return {"statusCode": 400, "headers": CORS_HEADERS,
                            "body": json.dumps({"error": "text обязателен"})}
                cur.execute(
                    f"INSERT INTO {SCHEMA}.support_messages (ticket_id, sender, text) VALUES (%s, 'admin', %s) RETURNING id",
                    (ticket_id, text),
                )
                cur.execute(
                    f"UPDATE {SCHEMA}.support_tickets SET status='replied', replied_at=%s, admin_reply=%s WHERE id=%s",
                    (datetime.now(timezone.utc), text, ticket_id),
                )
                conn.commit()
                return {"statusCode": 201, "headers": CORS_HEADERS,
                        "body": json.dumps({"success": True})}

            # Публичный ответ пользователя в существующий тикет
            if ticket_id and not check_admin(event):
                text = body.get("text", "").strip()
                if not text:
                    return {"statusCode": 400, "headers": CORS_HEADERS,
                            "body": json.dumps({"error": "text обязателен"})}
                cur.execute(
                    f"SELECT id FROM {SCHEMA}.support_tickets WHERE id=%s",
                    (ticket_id,),
                )
                if not cur.fetchone():
                    return {"statusCode": 404, "headers": CORS_HEADERS,
                            "body": json.dumps({"error": "Тикет не найден"})}
                cur.execute(
                    f"INSERT INTO {SCHEMA}.support_messages (ticket_id, sender, text) VALUES (%s, 'user', %s) RETURNING id",
                    (ticket_id, text),
                )
                cur.execute(
                    f"UPDATE {SCHEMA}.support_tickets SET status='new' WHERE id=%s",
                    (ticket_id,),
                )
                conn.commit()
                return {"statusCode": 201, "headers": CORS_HEADERS,
                        "body": json.dumps({"success": True})}

            # Публичное создание тикета
            name = body.get("name", "").strip()
            email = body.get("email", "").strip()
            message = body.get("message", "").strip()
            if not name or not message:
                return {"statusCode": 400, "headers": CORS_HEADERS,
                        "body": json.dumps({"error": "Имя и сообщение обязательны"})}
            cur.execute(
                f"INSERT INTO {SCHEMA}.support_tickets (name, email, message) VALUES (%s, %s, %s) RETURNING id",
                (name, email or None, message),
            )
            new_id = cur.fetchone()[0]
            cur.execute(
                f"INSERT INTO {SCHEMA}.support_messages (ticket_id, sender, text) VALUES (%s, 'user', %s)",
                (new_id, message),
            )
            conn.commit()
            return {"statusCode": 201, "headers": CORS_HEADERS,
                    "body": json.dumps({"success": True, "id": new_id})}

        # GET — список тикетов или сообщения конкретного тикета
        if method == "GET":
            ticket_id = params.get("ticket_id")

            # Публичный доступ к сообщениям своего тикета по ticket_id
            if ticket_id and not check_admin(event):
                cur.execute(
                    f"SELECT id, sender, text, created_at FROM {SCHEMA}.support_messages WHERE ticket_id=%s ORDER BY created_at ASC",
                    (ticket_id,),
                )
                rows = cur.fetchall()
                if not rows:
                    return {"statusCode": 404, "headers": CORS_HEADERS,
                            "body": json.dumps({"error": "Тикет не найден"})}
                messages = [
                    {"id": r[0], "sender": r[1], "text": r[2],
                     "created_at": r[3].isoformat() if r[3] else None}
                    for r in rows
                ]
                return {"statusCode": 200, "headers": CORS_HEADERS,
                        "body": json.dumps({"messages": messages})}

            if not check_admin(event):
                return {"statusCode": 403, "headers": CORS_HEADERS,
                        "body": json.dumps({"error": "Доступ запрещён"})}

            if ticket_id:
                cur.execute(
                    f"SELECT id, sender, text, created_at FROM {SCHEMA}.support_messages WHERE ticket_id=%s ORDER BY created_at ASC",
                    (ticket_id,),
                )
                rows = cur.fetchall()
                messages = [
                    {"id": r[0], "sender": r[1], "text": r[2],
                     "created_at": r[3].isoformat() if r[3] else None}
                    for r in rows
                ]
                return {"statusCode": 200, "headers": CORS_HEADERS,
                        "body": json.dumps({"messages": messages})}

            cur.execute(
                f"""SELECT t.id, t.name, t.email, t.status, t.created_at,
                    (SELECT COUNT(*) FROM {SCHEMA}.support_messages WHERE ticket_id=t.id) as msg_count,
                    (SELECT text FROM {SCHEMA}.support_messages WHERE ticket_id=t.id ORDER BY created_at DESC LIMIT 1) as last_msg
                    FROM {SCHEMA}.support_tickets t ORDER BY t.created_at DESC"""
            )
            rows = cur.fetchall()
            tickets = [
                {
                    "id": r[0], "name": r[1], "email": r[2],
                    "status": r[3],
                    "created_at": r[4].isoformat() if r[4] else None,
                    "msg_count": r[5], "last_msg": r[6],
                }
                for r in rows
            ]
            return {"statusCode": 200, "headers": CORS_HEADERS,
                    "body": json.dumps({"tickets": tickets, "total": len(tickets)})}

        return {"statusCode": 405, "headers": CORS_HEADERS,
                "body": json.dumps({"error": "Method not allowed"})}
    finally:
        conn.close()


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    try:
        # Роутинг для поддержки
        if params.get("type") == "support":
            return handle_support(event, method, params)

        cur = conn.cursor()

        # GET — публичный список мест
        if method == "GET":
            category = params.get("category", "")
            conditions = ["published = true"]
            values = []
            if category:
                conditions.append("category = %s")
                values.append(category)
            where = "WHERE " + " AND ".join(conditions)
            cur.execute(
                f"""
                SELECT id, name, category, address, city, latitude, longitude,
                       access_rating, access_comment, features, photo_url,
                       website, phone, created_at
                FROM {SCHEMA}.places
                {where}
                ORDER BY access_rating DESC, name
                """,
                values,
            )
            rows = cur.fetchall()
            places = []
            for r in rows:
                places.append({
                    "id": r[0], "name": r[1], "category": r[2],
                    "address": r[3], "city": r[4],
                    "latitude": r[5], "longitude": r[6],
                    "access_rating": r[7], "access_comment": r[8],
                    "features": r[9] or [], "photo_url": r[10],
                    "website": r[11], "phone": r[12],
                    "created_at": r[13].isoformat() if r[13] else None,
                })
            return {"statusCode": 200, "headers": CORS_HEADERS,
                    "body": json.dumps({"places": places, "total": len(places)})}

        # Все остальные методы — только для админа
        if not check_admin(event):
            return {"statusCode": 403, "headers": CORS_HEADERS,
                    "body": json.dumps({"error": "Доступ запрещён"})}

        body = json.loads(event.get("body") or "{}")

        if method == "POST":
            cur.execute(
                f"""
                INSERT INTO {SCHEMA}.places
                    (name, category, address, city, latitude, longitude,
                     access_rating, access_comment, features, photo_url,
                     website, phone, published)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                RETURNING id
                """,
                (
                    body.get("name", ""),
                    body.get("category", "other"),
                    body.get("address", ""),
                    body.get("city", "Анапа"),
                    body.get("latitude"),
                    body.get("longitude"),
                    body.get("access_rating", 3),
                    body.get("access_comment", ""),
                    body.get("features", []),
                    body.get("photo_url", ""),
                    body.get("website", ""),
                    body.get("phone", ""),
                    body.get("published", True),
                ),
            )
            new_id = cur.fetchone()[0]
            conn.commit()
            return {"statusCode": 201, "headers": CORS_HEADERS,
                    "body": json.dumps({"success": True, "id": new_id})}

        if method == "PUT":
            pid = body.get("id")
            if not pid:
                return {"statusCode": 400, "headers": CORS_HEADERS,
                        "body": json.dumps({"error": "id обязателен"})}
            cur.execute(
                f"""
                UPDATE {SCHEMA}.places SET
                    name=%s, category=%s, address=%s, city=%s,
                    latitude=%s, longitude=%s, access_rating=%s,
                    access_comment=%s, features=%s, photo_url=%s,
                    website=%s, phone=%s, published=%s,
                    updated_at=%s
                WHERE id=%s RETURNING id
                """,
                (
                    body.get("name", ""),
                    body.get("category", "other"),
                    body.get("address", ""),
                    body.get("city", "Анапа"),
                    body.get("latitude"),
                    body.get("longitude"),
                    body.get("access_rating", 3),
                    body.get("access_comment", ""),
                    body.get("features", []),
                    body.get("photo_url", ""),
                    body.get("website", ""),
                    body.get("phone", ""),
                    body.get("published", True),
                    datetime.now(timezone.utc),
                    pid,
                ),
            )
            row = cur.fetchone()
            conn.commit()
            if not row:
                return {"statusCode": 404, "headers": CORS_HEADERS,
                        "body": json.dumps({"error": "Место не найдено"})}
            return {"statusCode": 200, "headers": CORS_HEADERS,
                    "body": json.dumps({"success": True, "id": row[0]})}

        if method == "DELETE":
            pid = body.get("id")
            if not pid:
                return {"statusCode": 400, "headers": CORS_HEADERS,
                        "body": json.dumps({"error": "id обязателен"})}
            cur.execute(f"DELETE FROM {SCHEMA}.places WHERE id=%s RETURNING id", (pid,))
            row = cur.fetchone()
            conn.commit()
            if not row:
                return {"statusCode": 404, "headers": CORS_HEADERS,
                        "body": json.dumps({"error": "Место не найдено"})}
            return {"statusCode": 200, "headers": CORS_HEADERS,
                    "body": json.dumps({"success": True})}

        return {"statusCode": 405, "headers": CORS_HEADERS,
                "body": json.dumps({"error": "Method not allowed"})}

    finally:
        conn.close()