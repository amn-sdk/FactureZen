from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.api.deps import get_current_user, get_current_company_id, get_db
from app.models.core import User, Company
from app.models.business import Document, DocStatus, DocumentVersion
from app.schemas.document import DocumentOut, DocumentCreate, DocumentUpdate, DocumentVersionOut

router = APIRouter()

@router.get("/", response_model=List[DocumentOut])
async def list_documents(
    db: AsyncSession = Depends(get_db),
    company_id: int = Depends(get_current_company_id)
):
    result = await db.execute(select(Document).where(Document.company_id == company_id))
    return result.scalars().all()

@router.post("/", response_model=DocumentOut)
async def create_document(
    doc_in: DocumentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    company_id: int = Depends(get_current_company_id)
):
    doc = Document(
        **doc_in.model_dump(),
        company_id=company_id,
        created_by=current_user.id,
        status=DocStatus.DRAFT
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return doc

@router.get("/{document_id}", response_model=DocumentOut)
async def get_document(
    document_id: int,
    db: AsyncSession = Depends(get_db),
    company_id: int = Depends(get_current_company_id)
):
    result = await db.execute(
        select(Document).where(Document.id == document_id, Document.company_id == company_id)
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.patch("/{document_id}", response_model=DocumentOut)
async def update_document(
    document_id: int,
    doc_in: DocumentUpdate,
    db: AsyncSession = Depends(get_db),
    company_id: int = Depends(get_current_company_id)
):
    result = await db.execute(
        select(Document).where(Document.id == document_id, Document.company_id == company_id)
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Check Period Lock
    comp_res = await db.execute(select(Company).where(Company.id == company_id))
    company = comp_res.scalar_one_or_none()
    if company and company.period_locked_until:
        # If doc date is before lock, block edit
        doc_date = doc.created_at # Or a specific field like document_date
        if doc_date < company.period_locked_until:
            raise HTTPException(status_code=403, detail="Document is in a locked period and cannot be edited")
    
    update_data = doc_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(doc, field, value)
    
    await db.commit()
    await db.refresh(doc)
    return doc

@router.delete("/{document_id}")
async def delete_document(
    document_id: int,
    db: AsyncSession = Depends(get_db),
    company_id: int = Depends(get_current_company_id)
):
    result = await db.execute(
        select(Document).where(Document.id == document_id, Document.company_id == company_id)
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if doc.status != DocStatus.DRAFT:
        raise HTTPException(status_code=400, detail="Can only delete draft documents")
    
    await db.delete(doc)
    await db.commit()
    return {"message": "Document deleted"}

from app.tasks.documents import generate_document_version_task

@router.post("/{document_id}/generate")
async def generate_document(
    document_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    company_id: int = Depends(get_current_company_id)
):
    result = await db.execute(
        select(Document).where(Document.id == document_id, Document.company_id == company_id)
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if doc.status == DocStatus.GENERATED:
        raise HTTPException(status_code=400, detail="Document already generated")

    # For dev, we might want to run it sync or use worker. 
    # Let's use .delay() which requires a running worker.
@router.get("/{document_id}/versions", response_model=List[DocumentVersionOut])
async def list_document_versions(
    document_id: int,
    db: AsyncSession = Depends(get_db),
    company_id: int = Depends(get_current_company_id)
):
    # Verify document ownership
    result = await db.execute(
        select(Document).where(Document.id == document_id, Document.company_id == company_id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Document not found")
        
    result = await db.execute(
        select(DocumentVersion).where(DocumentVersion.document_id == document_id)
    )
    return result.scalars().all()

@router.get("/{document_id}/download/{version_id}")
async def download_version_file(
    document_id: int,
    version_id: int,
    file_type: str = "pdf",
    db: AsyncSession = Depends(get_db),
    company_id: int = Depends(get_current_company_id)
):
    # Verify ownership and fetch version
    result = await db.execute(
        select(DocumentVersion).where(
            DocumentVersion.id == version_id, 
            DocumentVersion.document_id == document_id
        )
    )
    version = result.scalar_one_or_none()
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
        
    object_name = version.pdf_url if file_type == "pdf" else version.docx_url
    
    # Generate presigned URL
    from app.services.storage import storage_service
    url = await storage_service.generate_presigned_url(object_name)
    
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url)

@router.get("/export/csv")
async def export_documents_csv(
    db: AsyncSession = Depends(get_db),
    company_id: int = Depends(get_current_company_id)
):
    from app.services.exports import export_service
    from sqlalchemy.orm import selectinload
    
    # Fetch all generated documents for the company
    stmt = (
        select(Document)
        .where(Document.company_id == company_id, Document.status == DocStatus.GENERATED)
    )
    result = await db.execute(stmt)
    docs = result.scalars().all()
    
    # Convert to dict for the service (could be specialized schemas too)
    data = []
    for d in docs:
        data.append({
            "id": d.id,
            "updated_at": d.updated_at,
            "type": d.type,
            "doc_number": "DOC-" + str(d.id), # Fallback if doc_number not on draft
            "current_totals": d.current_totals,
            "status": d.status
        })
        
    csv_content = export_service.generate_accounting_csv(data)
    
    from fastapi.responses import Response
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=export_{company_id}.csv"}
    )
