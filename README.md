# FactureZen ⚡️

FactureZen est une plateforme SaaS complète pour la gestion d'entreprise : Devis, Factures et Contrats. Conçue pour la fidélité visuelle via DOCX et la conformité fiscale française.

## 🚀 Fonctionnalités Clés

- **Multi-tenant (RLS)** : Isolation stricte des données par entreprise via PostgreSQL Row Level Security.
- **Génération Haute Fidélité** : Pipeline asynchrone (Celery + Redis) utilisant `docxtpl` et Gotenberg pour transformer des fichiers DOCX en PDF parfaits.
- **Espace Expert-Comptable** : Gestion multi-dossiers, exports FEC/CSV et verrouillage de périodes fiscales.
- **Conformité & Audit** : Historique des versions de documents et piste d'audit fiable (Audit Trail).
- **Observability** : Logs structurés JSON et monitoring de performance des requêtes.

## 🛠 Stack Technique

- **Frontend** : Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui.
- **Backend** : FastAPI (Python 3.12), SQLAlchemy 2.0 (Async), Celery + Redis.
- **Infra (Dev)** : Docker Compose, PostgreSQL 16, MinIO (S3), Gotenberg.
- **DevOps** : Kubernetes (K8s manifestations), GitHub Actions CI/CD (lint, test, build, deploy).

## 📦 Installation & Développement

### Local (Docker Compose)

1. **Lancer l'infrastructure** :
   ```bash
   docker-compose up -d
   ```

2. **Backend** :
   ```bash
   cd apps/backend
   python3 -m venv venv && source venv/bin/activate
   pip install -r requirements.txt
   alembic upgrade head
   uvicorn app.main:app --reload
   ```

3. **Frontend** :
   ```bash
   cd apps/frontend
   npm install && npm run dev
   ```

### Kubernetes (Production)

Les manifests se trouvent dans le dossier `/k8s`.
```bash
# Appliquer toute la stack
kubectl apply -f k8s/
```

## 🧪 Tests & Qualité

- **Backend** : `pytest` (Tests async + DB fixtures).
- **Frontend** : `vitest` (Composants UI).
- **CI/CD** : GitHub Actions automatiques sur chaque PR/Push.

---
FactureZen • Professional SaaS Foundation • 2025
