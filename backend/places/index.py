"""
Управление местами (рестораны, санатории, развлечения) с оценкой доступности.
GET — публичный список. POST/PUT/DELETE — только для администратора.
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
    expected = os.environ.get("ADMIN_PASSWORD", "")
    return expected and token == expected


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    method = event.get("httpMethod", "GET")

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    try:
        cur = conn.cursor()

        # GET — публичный список
        if method == "GET":
            params = event.get("queryStringParameters") or {}
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
