import boto3
from botocore.exceptions import ClientError
from app.core.config import settings
from app.core.logger import logger


def get_r2_client():
    return boto3.client(
        "s3",
        endpoint_url=settings.cloudflare_r2_endpoint,
        aws_access_key_id=settings.cloudflare_r2_access_key,
        aws_secret_access_key=settings.cloudflare_r2_secret_key,
        region_name="auto",
    )


async def upload_file(file_bytes: bytes, key: str, content_type: str = "application/octet-stream") -> str:
    try:
        client = get_r2_client()
        client.put_object(
            Bucket=settings.cloudflare_r2_bucket,
            Key=key,
            Body=file_bytes,
            ContentType=content_type,
        )
        return key
    except ClientError as e:
        logger.error("R2 upload failed — %s", str(e))
        err = Exception("File upload failed")
        err.status_code = 500
        raise err


def get_signed_url(key: str, expires_in: int = 3600) -> str:
    try:
        client = get_r2_client()
        return client.generate_presigned_url(
            "get_object",
            Params={"Bucket": settings.cloudflare_r2_bucket, "Key": key},
            ExpiresIn=expires_in,
        )
    except ClientError as e:
        logger.error("R2 signed URL failed — %s", str(e))
        err = Exception("Could not generate download URL")
        err.status_code = 500
        raise err


async def delete_file(key: str) -> None:
    try:
        client = get_r2_client()
        client.delete_object(Bucket=settings.cloudflare_r2_bucket, Key=key)
    except ClientError as e:
        logger.error("R2 delete failed — %s", str(e))
