from datetime import datetime
from enum import Enum
from typing import List, Optional
from sqlalchemy import String, ForeignKey, JSON, Integer, Boolean, DateTime, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Role(str, Enum):
    ADMIN = "ADMIN"
    ACCOUNTANT = "ACCOUNTANT"
    USER = "USER"
    VIEWER = "VIEWER"

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[Optional[str]] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(default=True)
    mfa_enabled: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    memberships: Mapped[List["Membership"]] = relationship(back_populates="user")

class Company(Base):
    __tablename__ = "companies"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    legal_form: Mapped[Optional[str]] = mapped_column(String(100))
    address: Mapped[Optional[str]] = mapped_column(String(500))
    vat_number: Mapped[Optional[str]] = mapped_column(String(50))
    registration_number: Mapped[Optional[str]] = mapped_column(String(50)) # SIRET
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    memberships: Mapped[List["Membership"]] = relationship(back_populates="company")

class Membership(Base):
    __tablename__ = "memberships"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id"))
    role: Mapped[Role] = mapped_column(default=Role.USER)
    permissions: Mapped[Optional[dict]] = mapped_column(JSON) # Fine-grained overrides

    user: Mapped["User"] = relationship(back_populates="memberships")
    company: Mapped["Company"] = relationship(back_populates="memberships")

    __table_args__ = (UniqueConstraint("user_id", "company_id", name="uix_user_company"),)
