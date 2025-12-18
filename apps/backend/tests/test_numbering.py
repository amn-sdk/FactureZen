import pytest
from app.services.numbering import numbering_service
from app.models.business import DocType

@pytest.mark.asyncio
async def test_get_next_number_format(db_session):
    # Test numbering for a specific company and year
    company_id = 999
    doc_type = DocType.INVOICE
    
    number = await numbering_service.get_next_number(db_session, company_id, doc_type)
    
    # Expected format: FAC-2025-0001 (assuming current year is 2025)
    import datetime
    year = datetime.datetime.now().year
    assert number.startswith(f"FAC-{year}-")
    assert len(number.split("-")[-1]) == 4 # 0001
