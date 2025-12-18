import asyncio
import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.models import core, business  # Import models to register them
from app.main import app
from httpx import AsyncClient

# Database URL for testing
SQLALCHEMY_DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost:5435/facturezen_test"

engine = create_async_engine(SQLALCHEMY_DATABASE_URL)
TestingSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest_asyncio.fixture
async def db_session():
    async with TestingSessionLocal() as session:
        yield session

@pytest_asyncio.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
