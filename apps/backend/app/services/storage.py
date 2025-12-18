import boto3
from botocore.exceptions import ClientError
from app.core.config import settings
from typing import Optional

class StorageService:
    def __init__(self):
        self.s3_client = boto3.client(
            "s3",
            endpoint_url=f"http://{settings.MINIO_ENDPOINT}" if not settings.MINIO_USE_SSL else f"https://{settings.MINIO_ENDPOINT}",
            aws_access_key_id=settings.MINIO_ROOT_USER,
            aws_secret_access_key=settings.MINIO_ROOT_PASSWORD,
            region_name="us-east-1", # MinIO doesn't care much about region
        )
        self.bucket_name = "facturezen"
        self._ensure_bucket_exists()

    def _ensure_bucket_exists(self):
        try:
            self.s3_client.head_bucket(Bucket=self.bucket_name)
        except ClientError:
            self.s3_client.create_bucket(Bucket=self.bucket_name)

    def upload_file(self, file_content: bytes, object_name: str, content_type: Optional[str] = None) -> str:
        extra_args = {}
        if content_type:
            extra_args["ContentType"] = content_type
            
        self.s3_client.put_object(
            Bucket=self.bucket_name,
            Key=object_name,
            Body=file_content,
            **extra_args
        )
        return object_name

    def get_presigned_url(self, object_name: str, expiration: int = 3600) -> str:
        try:
            response = self.s3_client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket_name, "Key": object_name},
                ExpiresIn=expiration,
            )
        except ClientError as e:
            return None
        return response

storage_service = StorageService()
