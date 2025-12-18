import asyncio
from celery import shared_task
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import engine
from app.models.business import Document, DocumentVersion, Template, DocStatus
from app.services.numbering import numbering_service
from app.services.storage import storage_service
from app.services.templates import template_engine
from sqlalchemy import select
import io

@shared_task(name="generate_document_version")
def generate_document_version_task(document_id: int, user_id: int):
    """
    Background task to generate a DOCX and PDF from a document draft.
    """
    return asyncio.run(_generate_document_version(document_id, user_id))

async def _generate_document_version(document_id: int, user_id: int):
    async with AsyncSession(engine) as session:
        # 1. Fetch document and template
        result = await session.execute(
            select(Document).where(Document.id == document_id)
        )
        doc = result.scalar_one_or_none()
        if not doc:
            return {"error": "Document not found"}

        result = await session.execute(
            select(Template).where(Template.id == doc.template_id)
        )
        template = result.scalar_one_or_none()
        
        # 2. Assign Document Number
        doc_number = await numbering_service.get_next_number(session, doc.company_id, doc.type)
        
        # 3. Render DOCX
        # Get template content from MinIO
        # Note: docx_source_url is currently a presigned URL or object name. 
        # In our implementation_plan, we use storage_service.get_file_content(object_name)
        # Let's assume for now we can get the object name from the URL or store it.
        # For simplicity, let's extract the object name from the URL if needed, 
        # but better to have it in the model. (We'll adjust models/business.py later if needed)
        
        # Mocking for now: extract name from URL
        object_name = template.docx_source_url.split("?")[0].split("/")[-1]
        if "templates/" not in object_name:
             object_name = f"templates/{doc.company_id}/{object_name}"
             
        docx_content = await storage_service.get_file_content(object_name)
        
        # Render
        render_data = {**doc.current_data, "doc_number": doc_number, "date": doc.created_at.strftime("%d/%m/%Y")}
        final_docx = await template_engine.render_document(docx_content, render_data)
        
        # 4. Upload DOCX to MinIO
        docx_path = f"documents/{doc.company_id}/{doc_number}.docx"
        await storage_service.upload_file(docx_path, final_docx)
        
        # 5. Convert to PDF via Gotenberg
        from app.services.pdf import pdf_service
        try:
            pdf_content = await pdf_service.convert_docx_to_pdf(final_docx)
            pdf_path = f"documents/{doc.company_id}/{doc_number}.pdf"
            await storage_service.upload_file(pdf_path, pdf_content)
        except Exception as e:
            # For now, log and continue, or handle as needed
            print(f"Error converting to PDF: {e}")
            pdf_path = None

        # 6. Create Version
        version = DocumentVersion(
            document_id=doc.id,
            version_number=1, 
            doc_number=doc_number,
            snapshot_data=doc.current_data,
            docx_url=docx_path,
            pdf_url=pdf_path or docx_path, # Fallback to docx if pdf fails
            generated_by=user_id
        )
        session.add(version)
        
        # Update doc status
        doc.status = DocStatus.GENERATED
        
        await session.commit()
        return {"status": "success", "doc_number": doc_number}
