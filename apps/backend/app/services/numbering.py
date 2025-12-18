from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models.business import NumberSequence, DocType

class NumberingService:
    @staticmethod
    async def get_next_number(db: AsyncSession, company_id: int, doc_type: DocType) -> str:
        """
        Increments and returns the next sequence number for a given document type and company.
        Uses an atomic update to prevent race conditions.
        Format: {PREFIX}-{YEAR}-{COUNTER} (e.g., INV-2025-0001)
        """
        year = datetime.utcnow().year
        
        # Mapping DocType to Prefixes
        prefixes = {
            DocType.QUOTE: "DEVIS",
            DocType.INVOICE: "FAC",
            DocType.CONTRACT: "CTR"
        }
        prefix = prefixes.get(doc_type, "DOC")

        # Try to update existing sequence
        stmt = (
            update(NumberSequence)
            .where(
                NumberSequence.company_id == company_id,
                NumberSequence.doc_type == doc_type,
                NumberSequence.year == year
            )
            .values(last_value=NumberSequence.last_value + 1)
            .returning(NumberSequence.last_value)
        )
        
        result = await db.execute(stmt)
        last_value = result.scalar_one_or_none()

        if last_value is None:
            # Sequence doesn't exist for this year, create it
            # We use a select for update or handle potential conflict
            new_seq = NumberSequence(
                company_id=company_id,
                doc_type=doc_type,
                year=year,
                last_value=1
            )
            db.add(new_seq)
            await db.flush()
            last_value = 1
        
        # Format the number with leading zeros (4 digits)
        counter_str = str(last_value).zfill(4)
        return f"{prefix}-{year}-{counter_str}"

numbering_service = NumberingService()
