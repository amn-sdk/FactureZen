from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import uuid

from app.core.database import get_db
from app.models.business import Template, DocType, DocStatus
from app.schemas.template import TemplateOut
from app.api.deps import get_current_company_id
from app.services.storage import storage_service
from app.services.templates import template_engine

router = APIRouter()

@router.get("/", response_model=List[TemplateOut])
async def list_templates(
    type: DocType = None,
    db: AsyncSession = Depends(get_db),
    company_id: int = Depends(get_current_company_id)
):
    query = select(Template).where(Template.company_id == company_id)
    if type:
        query = query.where(Template.type == type)
    
    result = await db.execute(query)
    templates = result.scalars().all()
    
    # Add signed URLs for preview
    for t in templates:
        t.docx_source_url = storage_service.get_presigned_url(t.docx_source_url)
        
    return templates

@router.post("/", response_model=TemplateOut)
async def upload_template(
    name: str = Form(...),
    type: DocType = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    company_id: int = Depends(get_current_company_id)
):
    if not file.filename.endswith(".docx"):
        raise HTTPException(status_code=400, detail="Only .docx files are allowed")

    content = await file.read()
    
    # Extract variables
    variables = template_engine.extract_variables(content)
    schema = template_engine.generate_json_schema(variables)
    
    # Upload to storage
    file_uuid = uuid.uuid4()
    object_name = f"templates/{company_id}/{file_uuid}.docx"
    storage_service.upload_file(content, object_name, content_type=file.content_type)
    
    # Create template record
    template = Template(
        company_id=company_id,
        name=name,
        type=type,
        docx_source_url=object_name,
        schema_json=schema,
        is_active=True
    )
    
    db.add(template)
    await db.commit()
    await db.refresh(template)
    
    # Return with signed URL
    template.docx_source_url = storage_service.get_presigned_url(template.docx_source_url)
    return template

@router.delete("/{template_id}")
async def delete_template(
    template_id: int,
    db: AsyncSession = Depends(get_db),
    company_id: int = Depends(get_current_company_id)
):
    result = await db.execute(select(Template).where(Template.id == template_id, Template.company_id == company_id))
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    template.is_active = False # Soft delete
    db.add(template)
    await db.commit()
    return {"status": "success"}
