from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.core import Company, Role
from app.schemas.company import CompanyOut, CompanyUpdate
from app.api.deps import get_current_company_id, check_role

router = APIRouter()

@router.get("/me", response_model=CompanyOut)
async def get_my_company(
    db: AsyncSession = Depends(get_db),
    company_id: int = Depends(get_current_company_id)
):
    result = await db.execute(select(Company).where(Company.id == company_id))
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company

@router.patch("/me", response_model=CompanyOut, dependencies=[Depends(check_role([Role.ADMIN]))])
async def update_my_company(
    company_in: CompanyUpdate,
    db: AsyncSession = Depends(get_db),
    company_id: int = Depends(get_current_company_id)
):
    result = await db.execute(select(Company).where(Company.id == company_id))
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    update_data = company_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(company, field, value)
    
    db.add(company)
    await db.commit()
    await db.refresh(company)
    return company
