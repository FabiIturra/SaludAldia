# Saludaldia — Contexto del proyecto para Claude Code

## ¿Qué es Saludaldia?
Plataforma web PWA para que pacientes chilenos centralicen su historial médico digital.
Células 20 de HubLab. Líder: Fabián Iturra. MVP: 01 agosto 2026.

## Stack tecnológico (definido reunión 08/06/2026)
- Frontend: React + Vite + TypeScript + Tailwind CSS + React Router + Zustand + TanStack Query
- Backend: Python 3.12 + Django 5.1 + Django REST Framework + SimpleJWT
- Base de datos: PostgreSQL
- Storage: Supabase (archivos médicos)
- Escáner: Scanbot Web SDK 7.x
- IA: Anthropic Claude API
- Deploy: Vercel (frontend) + Railway/Render (backend)

## Arquitectura — Monorepo
saludaldia/
├── apps/
│   ├── frontend/   ← React + Vite (puerto 3000)
│   └── backend/    ← Django DRF (puerto 8000)
└── packages/
    ├── types/      ← tipos TypeScript compartidos
    └── utils/      ← utilidades compartidas

## Colores brand
brand-700: #2D6A4F (principal), brand-100: #D8F3DC, surface-light: #F5F7F5

## Reglas de código
- Frontend: componentes en PascalCase, hooks en camelCase con use-prefix
- Backend: modelos en PascalCase, vistas en snake_case, URLs en kebab-case
- Commits: feat:, fix:, chore:, docs:
- Ramas: main > Testing > Practicante/NombreApellido

## Apps Django
- apps.users: User (custom), MedicalProfile
- apps.documents: Document, DocumentCategory, MedicalFolder
- apps.sharing: TemporaryAccessLink
- apps.ai_analysis: AIRecommendation
- apps.health_centers: HealthCenter
- apps.pets: Pet, PetProfile, PetDocument
- apps.audit: AuditLog

## Requerimientos del cliente (feedback post-presentación)
1. Mostrar nombre del paciente post-login ← YA IMPLEMENTADO en DashboardLayout
2. Mostrar nombre del centro médico en cada documento
3. Escaneo de documentos con cámara (Scanbot Web SDK)
4. IA conectada con respuesta visible en demo (Anthropic API)
5. Lanzamiento y testeo temprano con usuarios reales
6. Versión mascotas en paralelo (apps.pets)

## Para iniciar el proyecto
Frontend: cd apps/frontend && npm install && npm run dev
Backend:  cd apps/backend && python -m venv venv && pip install -r requirements.txt
          cp .env.example .env && python manage.py migrate && python manage.py runserver
