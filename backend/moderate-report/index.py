"""
Меняет статус заявки: new → approved или rejected.
Доступно только для администратора (простая проверка по паролю через заголовок X-Admin-Token).
"""
import json
import os
import psycopg2
from datetime import datetime, timezone

SCHEMA = "t_p32278697_solar_energy_initiat"

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    admin_token = event.get("headers", {}).get("X-Admin-Token", "")
    expected = os.environ.get("ADMIN_PASSWORD", "")
    if not expected or admin_token != expected:
        return {
            "statusCode": 403,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": "Доступ запрещён"}),
        }

    body = json.loads(event.get("body") or "{}")
    report_id = body.get("id")
    new_status = body.get("status")
    reject_reason = body.get("reject_reason", "")

    if not report_id or new_status not in ("approved", "rejected", "new"):
        return {
            "statusCode": 400,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": "Укажите id и status (approved / rejected / new)"}),
        }

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    try:
        cur = conn.cursor()
        cur.execute(
            f"""
            UPDATE {SCHEMA}.reports
            SET status = %s,
                reviewed_at = %s,
                reviewed_by = 'admin',
                reject_reason = %s
            WHERE id = %s
            RETURNING id, status
            """,
            (new_status, datetime.now(timezone.utc), reject_reason, report_id),
        )
        row = cur.fetchone()
        conn.commit()
    finally:
        conn.close()

    if not row:
        return {
            "statusCode": 404,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": "Заявка не найдена"}),
        }

    return {
        "statusCode": 200,
        "headers": CORS_HEADERS,
        "body": json.dumps({"success": True, "id": row[0], "status": row[1]}),
    }
