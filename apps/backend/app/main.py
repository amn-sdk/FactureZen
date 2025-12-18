from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, companies, clients, templates

app = FastAPI(title="FactureZen API", version="0.1.0")

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

@app.get("/health")
async def health_check():
    return {"status": "ok"}
