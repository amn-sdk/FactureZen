from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.core import User, Membership, Company, Role
from app.schemas.company import CompanyOut

router = APIRouter()

@router.get("/companies", response_model=List[CompanyOut])
async def list_accountant_companies(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns all companies where the current user has the ACCOUNTANT role.
    """
    # Query memberships to find companies where user is accountant
    stmt = (
        select(Company)
        .join(Membership)
        .where(
            Membership.user_id == current_user.id,
            Membership.role == Role.ACCOUNTANT
        )
    )
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/companies/{company_id}/lock")
async def lock_period(
    company_id: int,
    until_date: str, # Format YYYY-MM-DD
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Locks a company's period until a specific date.
    Only ADMIN or assigned ACCOUNTANT can do this.
    """
    # Check permissions
    membership_stmt = select(Membership).where(
        Membership.user_id == current_user.id,
        Membership.company_id == company_id,
        Membership.role.in_([Role.ADMIN, Role.ACCOUNTANT])
    )
    membership_result = await db.execute(membership_stmt)
    if not membership_result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    from datetime import datetime
    try:
        lock_date = datetime.strptime(until_date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    company_stmt = select(Company).where(Company.id == company_id)
    company_result = await db.execute(company_stmt)
    company = company_result.scalar_one_or_none()
    
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
        
    company.period_locked_until = lock_date
    await db.commit()
    
    return {"message": f"Period locked until {until_date}"}
