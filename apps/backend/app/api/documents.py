from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user, get_current_company_id
from app.models.core import User
from app.models.business import Document, DocStatus
from app.schemas.document import DocumentOut, DocumentCreate, DocumentUpdate

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
    generate_document_version_task.delay(doc.id, current_user.id)
    
    return {"message": "Generation started in background"}
