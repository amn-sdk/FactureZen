from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.business import DocType

class TemplateBase(BaseModel):
    name: str
    type: DocType
    is_active: bool = True

class TemplateCreate(TemplateBase):
    pass

class TemplateOut(TemplateBase):
    id: int
    company_id: int
    version: int
    docx_source_url: str
    schema_json: dict
    created_at: datetime

    class Config:
        from_attributes = True
