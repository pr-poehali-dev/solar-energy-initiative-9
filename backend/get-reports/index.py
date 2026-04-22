"""
Возвращает список подтверждённых точек для публичной карты.
Поддерживает фильтрацию по городу и типу локации.
Для админа (с параметром admin=1) возвращает все заявки включая новые.
"""
import json
import os
import psycopg2


SCHEMA = "t_p32278697_solar_energy_initiat"

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    params = event.get("queryStringParameters") or {}
    city = params.get("city", "")
    location_type = params.get("location_type", "")
    admin_mode = params.get("admin") == "1"

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    try:
        cur = conn.cursor()

        conditions = []
        values = []

        if not admin_mode:
            conditions.append("status = 'approved'")
        
        if city:
            conditions.append("city = %s")
            values.append(city)

        if location_type:
            conditions.append("location_type = %s")
            values.append(location_type)

        where_clause = ("WHERE " + " AND ".join(conditions)) if conditions else ""

        cur.execute(
            f"""
            SELECT id, latitude, longitude, city, location_type, features,
                   comment, photo_url, status, submitter_name, created_at, reviewed_at
            FROM {SCHEMA}.reports
            {where_clause}
            ORDER BY created_at DESC
            LIMIT 500
            """,
            values,
        )

        rows = cur.fetchall()
    finally:
        conn.close()

    reports = []
    for r in rows:
        reports.append({
            "id": r[0],
            "latitude": r[1],
            "longitude": r[2],
            "city": r[3],
            "location_type": r[4],
            "features": r[5] or [],
            "comment": r[6],
            "photo_url": r[7],
            "status": r[8],
            "submitter_name": r[9],
            "created_at": r[10].isoformat() if r[10] else None,
            "reviewed_at": r[11].isoformat() if r[11] else None,
        })

    return {
        "statusCode": 200,
        "headers": CORS_HEADERS,
        "body": json.dumps({
            "reports": reports,
            "total": len(reports),
        }),
    }
