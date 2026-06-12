# 🌿 Saludaldia — Célula 20

> **Tu historial médico, siempre contigo.**
> Plataforma web PWA para que pacientes chilenos centralicen su historial médico digital.

---

## 📋 Tabla de contenidos

- [¿Qué es Saludaldia?](#qué-es-saludaldia)
- [Equipo](#equipo--célula-20)
- [Stack tecnológico](#stack-tecnológico)
- [Requisitos previos](#requisitos-previos)
- [Instalación local](#instalación-local)
- [Flujo de trabajo Git](#flujo-de-trabajo-git)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Convención de commits](#convención-de-commits)
- [Pull Requests](#pull-requests)
- [Contacto](#contacto)

---

## ¿Qué es Saludaldia?

En Chile los documentos médicos se pierden sin continuidad entre hospitales, CESFAM y clínicas privadas. Saludaldia permite que cada paciente tenga un perfil médico digital donde organiza y comparte sus documentos de salud con su equipo médico.

---

## Equipo — Célula 20

| Nombre | Rol | Área |
|---|---|---|
| **Fabián Iturra** | **Líder del proyecto** | Arquitectura + coordinación |
| Cristian Parra | Encargado backend | Python, Django |
| Patricia Martínez | Backend | Python, Django, PostgreSQL |
| Héctor Hidalgo | Backend | Por definir |
| Daniela Aranguiz | Backend / investigación / Co-líder | Python, MySQL |
| Juan Cavieres | Frontend | React, HTML, CSS, JS |
| Ignacio | Encargado frontend | React, Angular, JS, PHP |
| Romina | Frontend | React, Angular, JS, PHP |
| Daniela Montecinos | Diseñadora UI | Figma |

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| Routing | React Router v6 |
| Estado | Zustand + TanStack Query |
| Backend | Python 3.12 + Django 5.1 + Django REST Framework |
| Autenticación | SimpleJWT (Bearer tokens) |
| Base de datos | PostgreSQL |
| Storage archivos | Supabase Storage |
| Escaneo docs | Scanbot Web SDK 7.x |
| IA | Anthropic Claude API |
| Deploy | Vercel (frontend) + Railway (backend) |

---

## Requisitos previos

- **Node.js** v18 o superior → [nodejs.org](https://nodejs.org)
- **Python** 3.12 → [python.org](https://python.org)
- **Git** → [git-scm.com](https://git-scm.com)
- **PostgreSQL** v15 → [postgresql.org](https://postgresql.org)
- **Cuenta GitHub** con acceso al repositorio (pedir a Fabián Iturra)

```bash
node --version    # v18.x.x o superior
python --version  # 3.12.x
git --version     # 2.x.x
```

---

## Instalación local

### 1. Clona el repositorio y crea tu rama

```bash
git clone https://github.com/USUARIO/saludaldia.git
cd saludaldia

git fetch origin
git checkout Testing
git pull origin Testing

# Crea tu rama personal
git checkout -b Practicante/NombreApellido
```

### 2. Frontend (React)

```bash
cd apps/frontend
npm install
cp .env.example .env
# Editar .env con tus valores
npm run dev
# → http://localhost:3000
```

### 3. Backend (Django)

```bash
cd apps/backend

# Crear entorno virtual
python -m venv venv

# Activar (Windows)
venv\Scripts\activate
# Activar (macOS/Linux)
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL

# Crear base de datos en PostgreSQL
# (desde psql o pgAdmin: CREATE DATABASE saludaldia;)

# Correr migraciones
python manage.py migrate

# Crear superusuario (admin)
python manage.py createsuperuser

# Iniciar servidor
python manage.py runserver
# → http://localhost:8000
```

---

## Flujo de trabajo Git

### Estructura de ramas

```
main          ← Producción. Solo código estable. NUNCA push directo.
Testing       ← Integración y pruebas. Todo pasa por aquí antes de main.
Practicante/  ← Tu rama personal de trabajo diario.
  └── NombreApellido
```

### Al inicio de cada día

```bash
git pull origin Practicante/NombreApellido
```

### Escenario 1 — Testing no cambió

Trabaja directo en tu rama. No hay pasos extra.

### Escenario 2 — Testing cambió, no tienes cambios pendientes

```bash
git checkout Testing
git pull origin Testing
git checkout Practicante/NombreApellido
git merge Testing
```

### Escenario 3 — Testing cambió y tienes cambios sin commit

```bash
git add .
git commit -m "feat: lo que hiciste"
git checkout Testing
git pull origin Testing
git checkout Practicante/NombreApellido
git merge Testing
```

### Escenario 4 — Testing no cambió y tienes cambios listos

```bash
git add .
git commit -m "feat: lo que hiciste"
git push origin Practicante/NombreApellido
```

### Subir cambios a Testing

Solo cuando todo funciona en tu rama:

```bash
git checkout Testing
git pull origin Testing
git merge Practicante/NombreApellido
git push origin Testing
git checkout Practicante/NombreApellido
```

### Si hay conflictos

Si ves `<<<<<<<` en un archivo: abre VS Code, elige la versión correcta, elimina las marcas y ejecuta:

```bash
git add .
git commit
```

> 💬 Si no estás seguro, avísale a Fabián Iturra por Discord antes de resolver solo.

---

## Estructura del proyecto

```
saludaldia/
├── apps/
│   ├── frontend/                 ← React + Vite (puerto 3000)
│   │   └── src/
│   │       ├── App.tsx           ← rutas principales
│   │       ├── main.tsx          ← entry point
│   │       ├── components/       ← componentes reutilizables
│   │       ├── pages/            ← páginas por sección
│   │       │   ├── auth/         ← login, signup
│   │       │   ├── dashboard/    ← app principal
│   │       │   └── share/        ← portal médico público
│   │       ├── lib/
│   │       │   ├── api/          ← cliente HTTP (axios)
│   │       │   └── store/        ← estado global (zustand)
│   │       └── lib/utils.ts      ← funciones puras (RUT, formato)
│   │
│   └── backend/                  ← Django (puerto 8000)
│       ├── saludaldia/           ← configuración Django
│       │   ├── settings.py
│       │   └── urls.py
│       ├── apps/
│       │   ├── users/            ← User, MedicalProfile
│       │   ├── documents/        ← Document, Folder
│       │   ├── sharing/          ← TemporaryAccessLink
│       │   ├── ai_analysis/      ← AIRecommendation
│       │   ├── health_centers/   ← HealthCenter
│       │   ├── pets/             ← Pet, PetDocument
│       │   └── audit/            ← AuditLog
│       ├── requirements.txt
│       └── manage.py
│
├── packages/
│   ├── types/                    ← tipos TypeScript compartidos
│   └── utils/                    ← utilidades compartidas
│
├── CLAUDE.md                     ← contexto para Claude Code / IA
└── README.md                     ← este archivo
```

---

## Convención de commits

| Prefijo | Uso |
|---|---|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de error |
| `chore:` | Configuración, dependencias, limpieza |
| `docs:` | Documentación, README |
| `style:` | Estilos CSS sin cambios lógicos |
| `refactor:` | Reestructuración sin cambios funcionales |
| `test:` | Tests unitarios o e2e |

**Ejemplos:**
```bash
git commit -m "feat: agregar login con email y contraseña"
git commit -m "fix: corregir validación de RUT chileno"
git commit -m "docs: actualizar instrucciones de instalación"
```

---

## Pull Requests

1. Asegúrate de que tu rama está actualizada con Testing
2. Haz push: `git push origin Practicante/NombreApellido`
3. Ve al repositorio en GitHub → **"Compare & pull request"**
4. Destino: `Testing` ← `Practicante/NombreApellido`
5. Describe brevemente qué hiciste
6. Asigna el PR a **Fabián Iturra** para revisión
7. **No hagas merge de tu propio PR** — espera la aprobación

---

## Contacto

**Fabián Iturra — Líder Célula 20**
Discord del equipo: canal `#celula-20-saludaldia`

> 💡 Si llevas más de 30 minutos bloqueado en un problema, pregunta en Discord. Pedir ayuda es parte del proceso de trabajo.

---

<div align="center">
  <sub>🌿 Saludaldia · Célula 20 · HubLab · 2026</sub>
</div>
