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
    
    # Check for existing template to handle versioning
    result = await db.execute(
        select(Template)
        .where(Template.company_id == company_id, Template.name == name)
        .order_by(Template.version.desc())
        .limit(1)
    )
    latest_version = result.scalar_one_or_none()
    
    version = 1
    parent_id = None
    if latest_version:
        version = latest_version.version + 1
        parent_id = latest_version.parent_id or latest_version.id
        # Deactivate previous version
        latest_version.is_active = False
        db.add(latest_version)

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
        version=version,
        parent_id=parent_id,
        is_active=True
    )
    
    db.add(template)
    await db.commit()
    await db.refresh(template)
    
    # Return with signed URL
    template.docx_source_url = storage_service.get_presigned_url(template.docx_source_url)
    return template

from fastapi.responses import Response
import io

@router.post("/{template_id}/test-render")
async def test_render_template(
    template_id: int,
    data: dict,
    db: AsyncSession = Depends(get_db),
    company_id: int = Depends(get_current_company_id)
):
    result = await db.execute(select(Template).where(Template.id == template_id, Template.company_id == company_id))
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Download from storage
    # Note: we need a way to get raw bytes from storage service
    # I'll update storage_service to include get_file_content
    from app.services.storage import storage_service
    
    try:
        # For simplicity, I'll use boto3 directly here if storage_service is limited
        # But let's assume we add it to storage_service
        content = storage_service.get_file_content(template.docx_source_url)
        
        # Render
        from docxtpl import DocxTemplate
        doc = DocxTemplate(io.BytesIO(content))
        doc.render(data)
        
        output = io.BytesIO()
        doc.save(output)
        output.seek(0)
        
        return Response(
            content=output.read(),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"attachment; filename=preview_{template_id}.docx"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
