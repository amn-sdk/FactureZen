import pytest
from app.services.numbering import numbering_service
from app.models.business import DocType

from app.models.core import Company

@pytest.mark.asyncio
async def test_get_next_number_format(db_session):
    # Create a dummy company first
    company = Company(name="Test Company")
    db_session.add(company)
    await db_session.commit()
    await db_session.refresh(company)
    
    company_id = company.id
    doc_type = DocType.INVOICE
    
    number = await numbering_service.get_next_number(db_session, company_id, doc_type)
    
    # Expected format: FAC-2025-0001 (assuming current year is 2025)
    import datetime
    year = datetime.datetime.now().year
    assert number.startswith(f"FAC-{year}-")
    assert len(number.split("-")[-1]) == 4 # 0001
