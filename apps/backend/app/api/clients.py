from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from typing import List
from app.core.database import get_db
from app.models.business import Client
from app.schemas.client import ClientOut, ClientCreate, ClientUpdate
from app.api.deps import get_current_company_id

router = APIRouter()

@router.get("/", response_model=List[ClientOut])
async def list_clients(
    search: str = Query(None),
    include_archived: bool = False,
    db: AsyncSession = Depends(get_db),
    company_id: int = Depends(get_current_company_id)
):
    query = select(Client).where(Client.company_id == company_id)
    if not include_archived:
        query = query.where(Client.is_archived == False)
    if search:
        query = query.where(or_(
            Client.name.ilike(f"%{search}%"),
            Client.email.ilike(f"%{search}%")
        ))
    
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/", response_model=ClientOut)
async def create_client(
    client_in: ClientCreate,
    db: AsyncSession = Depends(get_db),
    company_id: int = Depends(get_current_company_id)
):
    client = Client(
        **client_in.model_dump(),
        company_id=company_id
    )
    db.add(client)
    await db.commit()
    await db.refresh(client)
    return client

@router.get("/{client_id}", response_model=ClientOut)
async def get_client(
    client_id: int,
    db: AsyncSession = Depends(get_db),
    company_id: int = Depends(get_current_company_id)
):
    result = await db.execute(select(Client).where(Client.id == client_id, Client.company_id == company_id))
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@router.patch("/{client_id}", response_model=ClientOut)
async def update_client(
    client_id: int,
    client_in: ClientUpdate,
    db: AsyncSession = Depends(get_db),
    company_id: int = Depends(get_current_company_id)
):
    result = await db.execute(select(Client).where(Client.id == client_id, Client.company_id == company_id))
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    update_data = client_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(client, field, value)
    
    db.add(client)
    await db.commit()
    await db.refresh(client)
    return client

@router.post("/{client_id}/archive", response_model=ClientOut)
async def archive_client(
    client_id: int,
    db: AsyncSession = Depends(get_db),
    company_id: int = Depends(get_current_company_id)
):
    result = await db.execute(select(Client).where(Client.id == client_id, Client.company_id == company_id))
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    client.is_archived = True
    db.add(client)
    await db.commit()
    await db.refresh(client)
    return client
