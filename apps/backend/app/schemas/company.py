from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CompanyBase(BaseModel):
    name: str
    legal_form: Optional[str] = None
    address: Optional[str] = None
    vat_number: Optional[str] = None
    registration_number: Optional[str] = None # SIRET

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    legal_form: Optional[str] = None
    address: Optional[str] = None
    vat_number: Optional[str] = None
    registration_number: Optional[str] = None

class CompanyOut(CompanyBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
