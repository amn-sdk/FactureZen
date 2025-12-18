from datetime import datetime
from typing import Optional
from sqlalchemy import String, ForeignKey, JSON, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id"), index=True)
    actor_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    action: Mapped[str] = mapped_column(String(100)) # e.g., GENERATE, LOGIN, DELETE
    entity_type: Mapped[str] = mapped_column(String(50)) # e.g., DOCUMENT, CLIENT
    entity_id: Mapped[int] = mapped_column()
    metadata_json: Mapped[dict] = mapped_column(JSON, nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(50))
    user_agent: Mapped[Optional[str]] = mapped_column(String(255))
    timestamp: Mapped[datetime] = mapped_column(default=datetime.utcnow)
