from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from app.models.business import DocType, DocStatus

class DocumentBase(BaseModel):
    client_id: int
    template_id: int
    type: DocType
    current_data: Dict[str, Any] = {}
    current_totals: Dict[str, Any] = {}

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    client_id: Optional[int] = None
    status: Optional[DocStatus] = None
    current_data: Optional[Dict[str, Any]] = None
    current_totals: Optional[Dict[str, Any]] = None

class DocumentOut(DocumentBase):
    id: int
    company_id: int
    status: DocStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DocumentVersionOut(BaseModel):
    id: int
    version_number: int
    doc_number: str
    snapshot_data: Dict[str, Any]
    pdf_url: str
    docx_url: str
    generated_at: datetime

    class Config:
        from_attributes = True
