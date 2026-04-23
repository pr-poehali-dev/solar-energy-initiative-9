"""
Заявки о доступности мест.
GET — публичный список (одобренные). GET?admin=1 — все для админа.
POST — модерация (смена статуса, is_problem). Только для администратора.
"""
import json
import os
import psycopg2
from datetime import datetime, timezone

SCHEMA = "t_p32278697_solar_energy_initiat"

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    method = event.get("httpMethod", "GET")

    # POST — модерация (только для админа)
    if method == "POST":
        admin_token = event.get("headers", {}).get("X-Admin-Token", "")
        expected = os.environ.get("ADMIN_PASSWORD", "")
        if not expected or admin_token != expected:
            return {"statusCode": 403, "headers": CORS_HEADERS,
                    "body": json.dumps({"error": "Доступ запрещён"})}

        body = json.loads(event.get("body") or "{}")
        report_id = body.get("id")
        new_status = body.get("status")
        reject_reason = body.get("reject_reason", "")
        is_problem = body.get("is_problem")

        if not report_id:
            return {"statusCode": 400, "headers": CORS_HEADERS,
                    "body": json.dumps({"error": "id обязателен"})}

        conn = psycopg2.connect(os.environ["DATABASE_URL"])
        try:
            cur = conn.cursor()

            if is_problem is not None and new_status not in ("approved", "rejected", "new"):
                cur.execute(
                    f"UPDATE {SCHEMA}.reports SET is_problem = %s WHERE id = %s",
                    (bool(is_problem), report_id),
                )
                conn.commit()
                return {"statusCode": 200, "headers": CORS_HEADERS,
                        "body": json.dumps({"success": True, "id": report_id})}

            if new_status not in ("approved", "rejected", "new"):
                return {"statusCode": 400, "headers": CORS_HEADERS,
                        "body": json.dumps({"error": "Укажите status (approved / rejected / new)"})}

            cur.execute(
                f"""
                UPDATE {SCHEMA}.reports
                SET status = %s, reviewed_at = %s, reviewed_by = 'admin',
                    reject_reason = %s, is_problem = COALESCE(%s, is_problem)
                WHERE id = %s RETURNING id, status
                """,
                (new_status, datetime.now(timezone.utc), reject_reason,
                 bool(is_problem) if is_problem is not None else None, report_id),
            )
            row = cur.fetchone()
            conn.commit()
        finally:
            conn.close()

        if not row:
            return {"statusCode": 404, "headers": CORS_HEADERS,
                    "body": json.dumps({"error": "Заявка не найдена"})}
        return {"statusCode": 200, "headers": CORS_HEADERS,
                "body": json.dumps({"success": True, "id": row[0], "status": row[1]})}

    # GET — список
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

        if params.get("problems") == "1":
            conditions.append("is_problem = true")

        where_clause = ("WHERE " + " AND ".join(conditions)) if conditions else ""

        cur.execute(
            f"""
            SELECT id, latitude, longitude, city, location_type, features,
                   comment, photo_url, status, submitter_name, created_at, reviewed_at,
                   is_problem, place_type
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
            "id": r[0], "latitude": r[1], "longitude": r[2],
            "city": r[3], "location_type": r[4],
            "features": r[5] or [], "comment": r[6],
            "photo_url": r[7], "status": r[8],
            "submitter_name": r[9],
            "created_at": r[10].isoformat() if r[10] else None,
            "reviewed_at": r[11].isoformat() if r[11] else None,
            "is_problem": r[12], "place_type": r[13],
        })

    return {"statusCode": 200, "headers": CORS_HEADERS,
            "body": json.dumps({"reports": reports, "total": len(reports)})}
