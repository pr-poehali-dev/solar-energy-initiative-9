"""
Принимает фото в формате base64, загружает в S3 и возвращает публичный URL.
Используется формой сбора данных перед отправкой основной заявки.
"""
import json
import os
import base64
import uuid
import hmac
import hashlib
from datetime import datetime, timezone
from urllib.request import Request, urlopen
from urllib.error import HTTPError

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

ALLOWED_TYPES = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/heic": "heic",
}


def sign(key, msg):
    return hmac.new(key, msg.encode("utf-8"), hashlib.sha256).digest()


def get_signature_key(secret, date, region, service):
    k_date = sign(("AWS4" + secret).encode("utf-8"), date)
    k_region = sign(k_date, region)
    k_service = sign(k_region, service)
    k_signing = sign(k_service, "aws4_request")
    return k_signing


def s3_put(key: str, data: bytes, content_type: str) -> None:
    access_key = os.environ["AWS_ACCESS_KEY_ID"]
    secret_key = os.environ["AWS_SECRET_ACCESS_KEY"]
    bucket = "files"
    host = "bucket.poehali.dev"
    region = "us-east-1"
    service = "s3"

    now = datetime.now(timezone.utc)
    amz_date = now.strftime("%Y%m%dT%H%M%SZ")
    date_stamp = now.strftime("%Y%m%d")

    canonical_uri = f"/{bucket}/{key}"
    canonical_querystring = ""
    payload_hash = hashlib.sha256(data).hexdigest()
    canonical_headers = (
        f"content-type:{content_type}\n"
        f"host:{host}\n"
        f"x-amz-content-sha256:{payload_hash}\n"
        f"x-amz-date:{amz_date}\n"
    )
    signed_headers = "content-type;host;x-amz-content-sha256;x-amz-date"

    canonical_request = "\n".join([
        "PUT", canonical_uri, canonical_querystring,
        canonical_headers, signed_headers, payload_hash,
    ])

    credential_scope = f"{date_stamp}/{region}/{service}/aws4_request"
    string_to_sign = "\n".join([
        "AWS4-HMAC-SHA256", amz_date, credential_scope,
        hashlib.sha256(canonical_request.encode("utf-8")).hexdigest(),
    ])

    signing_key = get_signature_key(secret_key, date_stamp, region, service)
    signature = hmac.new(signing_key, string_to_sign.encode("utf-8"), hashlib.sha256).hexdigest()

    authorization = (
        f"AWS4-HMAC-SHA256 Credential={access_key}/{credential_scope}, "
        f"SignedHeaders={signed_headers}, Signature={signature}"
    )

    url = f"https://{host}/{bucket}/{key}"
    req = Request(url, data=data, method="PUT")
    req.add_header("Authorization", authorization)
    req.add_header("Content-Type", content_type)
    req.add_header("x-amz-date", amz_date)
    req.add_header("x-amz-content-sha256", payload_hash)
    urlopen(req)


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    body = json.loads(event.get("body") or "{}")
    data_url = body.get("data")
    content_type = body.get("content_type", "image/jpeg")

    if not data_url:
        return {
            "statusCode": 400,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": "Нет данных фото"}),
        }

    if "," in data_url:
        data_url = data_url.split(",", 1)[1]

    image_bytes = base64.b64decode(data_url)

    ext = ALLOWED_TYPES.get(content_type, "jpg")
    date_prefix = datetime.now(timezone.utc).strftime("%Y/%m")
    filename = f"reports/{date_prefix}/{uuid.uuid4().hex}.{ext}"

    s3_put(filename, image_bytes, content_type)

    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{filename}"

    return {
        "statusCode": 200,
        "headers": CORS_HEADERS,
        "body": json.dumps({"url": cdn_url}),
    }
