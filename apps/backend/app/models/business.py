from datetime import datetime
from enum import Enum
from typing import Optional, List
from sqlalchemy import String, ForeignKey, JSON, Integer, Boolean, DateTime, UniqueConstraint, BigInteger
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class DocType(str, Enum):
    QUOTE = "QUOTE"
    INVOICE = "INVOICE"
    CONTRACT = "CONTRACT"

class DocStatus(str, Enum):
    DRAFT = "DRAFT"
    GENERATED = "GENERATED"
    SENT = "SENT"
    PAID = "PAID"
    CANCELLED = "CANCELLED"

class Client(Base):
    __tablename__ = "clients"

    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id"), index=True)
    name: Mapped[str] = mapped_column(String(255))
    email: Mapped[Optional[str]] = mapped_column(String(255))
    address: Mapped[Optional[str]] = mapped_column(String(500))
    vat_number: Mapped[Optional[str]] = mapped_column(String(50))
    registration_number: Mapped[Optional[str]] = mapped_column(String(50)) # SIRET
    is_archived: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

class Template(Base):
    __tablename__ = "templates"

    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id"), index=True)
    type: Mapped[DocType] = mapped_column(String(20))
    name: Mapped[str] = mapped_column(String(255))
    version: Mapped[int] = mapped_column(default=1)
    is_active: Mapped[bool] = mapped_column(default=True)
    docx_source_url: Mapped[str] = mapped_column(String(1000))
    schema_json: Mapped[dict] = mapped_column(JSON) # Field definitions
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

class Document(Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id"), index=True)
    client_id: Mapped[int] = mapped_column(ForeignKey("clients.id"), index=True)
    template_id: Mapped[int] = mapped_column(ForeignKey("templates.id"))
    type: Mapped[DocType] = mapped_column(String(20))
    status: Mapped[DocStatus] = mapped_column(default=DocStatus.DRAFT)
    
    current_data: Mapped[dict] = mapped_column(JSON) # Variable values
    current_totals: Mapped[dict] = mapped_column(JSON) # Precomputed totals
    
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow)

    versions: Mapped[List["DocumentVersion"]] = relationship(back_populates="document")

class DocumentVersion(Base):
    __tablename__ = "document_versions"

    id: Mapped[int] = mapped_column(primary_key=True)
    document_id: Mapped[int] = mapped_column(ForeignKey("documents.id"), index=True)
    version_number: Mapped[int] = mapped_column()
    doc_number: Mapped[str] = mapped_column(String(50)) # Final number like FAC-2026-0001
    
    snapshot_data: Mapped[dict] = mapped_column(JSON)
    pdf_url: Mapped[str] = mapped_column(String(1000))
    docx_url: Mapped[str] = mapped_column(String(1000))
    
    generated_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    generated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    document: Mapped["Document"] = relationship(back_populates="versions")

class NumberSequence(Base):
    __tablename__ = "number_sequences"

    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id"), index=True)
    doc_type: Mapped[DocType] = mapped_column(String(20))
    year: Mapped[int] = mapped_column()
    last_value: Mapped[int] = mapped_column(default=0)

    __table_args__ = (UniqueConstraint("company_id", "doc_type", "year", name="uix_company_type_year"),)
