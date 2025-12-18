from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.logging import setup_logging, LoggingMiddleware
from app.api import auth, companies, clients, templates, documents, accountant

app = FastAPI(title="FactureZen API", version="0.1.0")
setup_logging()
app.add_middleware(LoggingMiddleware)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(companies.router, prefix="/api/companies", tags=["companies"])
app.include_router(clients.router, prefix="/api/clients", tags=["clients"])
app.include_router(templates.router, prefix="/api/templates", tags=["templates"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(accountant.router, prefix="/api/accountant", tags=["accountant"])

@app.get("/health")
async def health_check():
    return {"status": "ok"}
