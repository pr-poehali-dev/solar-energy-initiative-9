"""
Принимает заявку о доступности места от пользователя и сохраняет в базу данных.
Статус по умолчанию: 'new' (ожидает модерации).
"""
import json
import os
import psycopg2


SCHEMA = "t_p32278697_solar_energy_initiat"

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    if event.get("httpMethod") != "POST":
        return {
            "statusCode": 405,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": "Method not allowed"}),
        }

    body = json.loads(event.get("body") or "{}")

    latitude = body.get("latitude")
    longitude = body.get("longitude")
    location_type = body.get("location_type")

    if latitude is None or longitude is None or not location_type:
        return {
            "statusCode": 400,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": "latitude, longitude и location_type обязательны"}),
        }

    features = body.get("features", [])
    comment = body.get("comment", "")
    photo_url = body.get("photo_url", "")
    photo_metadata = body.get("photo_metadata", {})
    submitter_name = body.get("submitter_name", "")
    submitter_contact = body.get("submitter_contact", "")
    city = body.get("city", "Анапа")

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    try:
        cur = conn.cursor()
        cur.execute(
            f"""
            INSERT INTO {SCHEMA}.reports
                (latitude, longitude, city, location_type, features, comment,
                 photo_url, photo_metadata, submitter_name, submitter_contact)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, created_at
            """,
            (
                latitude,
                longitude,
                city,
                location_type,
                features,
                comment,
                photo_url,
                json.dumps(photo_metadata),
                submitter_name,
                submitter_contact,
            ),
        )
        row = cur.fetchone()
        conn.commit()
    finally:
        conn.close()

    return {
        "statusCode": 201,
        "headers": CORS_HEADERS,
        "body": json.dumps({
            "success": True,
            "id": row[0],
            "created_at": row[1].isoformat(),
            "message": "Заявка принята и отправлена на проверку",
        }),
    }
