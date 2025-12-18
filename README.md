# FactureZen

FactureZen est un SaaS moderne pour la génération de Devis, Factures et Contrats à partir de templates DOCX strictes. 

## Fonctionnalités
- **Multi-tenant** : Isolation complète des données par entreprise (PostgreSQL RLS).
- **Gestion CRM** : Carnet d'adresses clients avec recherche et archivage.
- **Paramètres Entreprise** : Personnalisation des informations légales et du branding.
- **Authentification Sécurisée** : JWT avec gestion des tokens de rafraîchissement.
- **Audit Trail** : Traçabilité complète des actions sensibles.
- **Génération DOCX/PDF** (En cours) : Pipeline asynchrone pour une fidélité maximale.

## Stack Technique
- **Frontend** : Next.js 15, TypeScript, Tailwind CSS, shadcn/ui.
- **Backend** : FastAPI (Python 3.12), SQLAlchemy 2.0, Pydantic v2.
- **Infrastructure** : Docker Compose, PostgreSQL 16, Redis, MinIO (S3).
- **Moteur PDF** : LibreOffice Headless (container).

## Installation

### Prérequis
- Docker & Docker Compose
- Python 3.12+
- Node.js 18+

### Setup Rapide

1. **Services (Infrastructure)** :
   ```bash
   docker-compose up -d
   ```

2. **Backend** :
   ```bash
   cd apps/backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   alembic upgrade head
   uvicorn app.main:app --reload
   ```

3. **Frontend** :
   ```bash
   cd apps/frontend
   npm install
   npm run dev
   ```

## Architecture
Le projet utilise un Monorepo :
- `apps/backend` : API REST FastAPI.
- `apps/frontend` : Application Web Next.js.
- `infra` : Configuration Docker et scripts d'initialisation DB.
