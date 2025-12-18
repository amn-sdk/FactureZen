from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "facturezen",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.tasks.documents"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Europe/Paris",
    enable_utc=True,
    task_track_started=True
)
