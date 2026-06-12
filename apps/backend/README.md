# 🐾 PetDoc Backend — Django + Supabase/PostgreSQL

Backend del sistema **PetDoc / SaludAlDía**, construido con **Django** y conectado a una base de datos **PostgreSQL** gestionada en **Supabase**.

---

## 📁 Estructura relevante del proyecto

```txt
apps/backend/
├── manage.py
├── .env                    ← archivo local con credenciales reales, no se sube al repo
├── .env.example            ← plantilla de variables de entorno
├── requirements.txt
├── scripts/
│   └── test_db_queries.py  ← prueba de conexión y consultas SQL simples
├── database/
│   └── schema.sql          ← tablas administradas manualmente en Supabase
└── ...
```

---

## 🗄️ Base de datos y archivo SQL

El proyecto usa **Supabase PostgreSQL**. Algunas tablas son creadas por Django mediante migraciones y otras se crean manualmente usando el archivo:

```txt
database/schema.sql
```

Este archivo contiene las tablas que **no son administradas por Django** mediante migraciones. Se debe ejecutar manualmente en Supabase cuando se configure el proyecto por primera vez o cuando se necesite recrear la base de datos.

### Tablas incluidas en `database/schema.sql`

| Tabla | Descripción |
|---|---|
| `document_categories` | Categorías de documentos médicos |
| `documents` | Documentos subidos por usuarios |
| `health_centers` | Centros veterinarios / de salud |
| `audit_logs` | Registro de auditoría de acciones |
| `temporary_access_links` | Links de acceso temporal compartido |
| `ai_recommendations` | Recomendaciones generadas por IA |

Estas tablas tienen modelos en Django para poder consultarlas desde el ORM, pero sus modelos usan:

```python
class Meta:
    managed = False
```

Esto significa que Django puede leerlas y usarlas, pero **no las crea ni modifica** con migraciones.

### Tablas administradas por Django

Las siguientes tablas son creadas por Django mediante:

```powershell
python manage.py migrate
```

| Tabla |
|---|
| `users` |
| `medical_profiles` |
| `pets` |

Además, Django crea tablas internas para autenticación, permisos, sesiones, admin y migraciones, como:

```txt
django_migrations
django_content_type
django_session
auth_group
auth_permission
auth_group_permissions
users_groups
users_user_permissions
django_admin_log
```

Estas tablas no deben incluirse en `database/schema.sql`.

---

## ⚙️ Cómo arrancar el proyecto en Windows — PowerShell

### 1. Entrar a la carpeta del backend

```powershell
cd ruta\del\proyecto\apps\backend
```

### 2. Crear entorno virtual con Python 3.12

```powershell
py -3.12 -m venv .venv
```

### 3. Permitir scripts en la sesión actual

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### 4. Activar entorno virtual

```powershell
.\.venv\Scripts\Activate.ps1
```

El prompt debería quedar con `(.venv)` al inicio.

### 5. Instalar dependencias

```powershell
python -m pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

### 6. Configurar variables de entorno

El proyecto incluye `.env.example` como plantilla. Para crear el archivo real:

```powershell
Copy-Item .env.example .env
```

Luego se debe editar `.env` con los datos reales de Supabase/PostgreSQL y las claves necesarias.

El archivo `.env` contiene credenciales reales, por lo que **no debe subirse al repositorio**.

### 7. Ejecutar migraciones de Django

```powershell
python manage.py migrate
```

Esto crea o actualiza solo las tablas administradas por Django.

### 8. Verificar configuración

```powershell
python manage.py check
```

### 9. Levantar servidor de desarrollo

```powershell
python manage.py runserver
```

Salida esperada:

```txt
Watching for file changes with StatReloader
Performing system checks...

System check identified no issues (0 silenced).
Django version 5.1, using settings 'saludaldia.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

Cuando aparece esa salida, el servidor está funcionando correctamente y queda esperando peticiones. No es un error que la terminal quede ocupada.

El backend queda disponible en:

```txt
http://127.0.0.1:8000/
```

---

## 🔌 Conexión a Supabase PostgreSQL

Supabase entrega distintos tipos de conexión. En algunos equipos o redes, la conexión directa puede intentar usar IPv6 y quedarse esperando respuesta.

Ejemplo de conexión directa:

```txt
db.<project-ref>.supabase.co:5432
```

Si al ejecutar `migrate` aparece un error como:

```txt
connection timed out
```

o `Test-NetConnection` queda esperando respuesta, se recomienda usar el **Connection Pooler / Supavisor** de Supabase.

Ejemplo de configuración usando pooler:

```python
DATABASES = {"default": {
    "ENGINE": "django.db.backends.postgresql",
    "NAME": os.getenv("DB_NAME", "postgres"),
    "USER": os.getenv("DB_USER", "postgres.<project-ref>"),
    "PASSWORD": os.getenv("DB_PASSWORD", "tu_password"),
    "HOST": os.getenv("DB_HOST", "aws-1-us-west-2.pooler.supabase.com"),
    "PORT": os.getenv("DB_PORT", "5432"),
    "OPTIONS": {
        "sslmode": "require",
    },
}}
```

Para probar si el puerto responde:

```powershell
Test-NetConnection aws-1-us-west-2.pooler.supabase.com -Port 5432
```

Si aparece:

```txt
TcpTestSucceeded : True
```

la conexión por red está funcionando.

---

## 🔌 Prueba de conexión a la base de datos

El proyecto incluye:

```txt
scripts/test_db_queries.py
```

Este archivo valida que Django pueda conectarse a Supabase/PostgreSQL y consultar las tablas principales. Ejecuta consultas simples tipo:

```sql
SELECT * FROM public."tabla" LIMIT 5;
```

Se ejecuta desde la carpeta `apps/backend` con:

```powershell
python manage.py shell < scripts/test_db_queries.py
```

Este script confirma que las tablas existen y que la conexión funciona, aunque estén vacías.

Si aparece algo como:

```txt
consulta exitosa: la tabla existe, pero no tiene registros.
```

significa que la tabla existe y Django pudo consultarla correctamente.

---

## 🧪 Prueba rápida de modelos `managed = False`

Las tablas con `managed = False` deben coincidir con el `schema.sql`. Si un campo del modelo tiene un typo, el error aparece al usar el ORM.

Para revisar los problemas típicos detectados en los modelos, se puede entrar al shell:

```powershell
python manage.py shell
```

Y ejecutar:

```python
exec("""
from uuid import uuid4
from django.core.exceptions import FieldDoesNotExist
from apps.documents.models import Document, DocumentCategory
from apps.health_centers.models import HealthCenter
from apps.sharing.models import TemporaryAccessLink

errors = []

def ok(msg):
    print("[OK]", msg)

def fail(msg):
    print("[ERROR]", msg)
    errors.append(msg)

def field_exists(model, field):
    try:
        model._meta.get_field(field)
        ok(f"{model.__name__}.{field} existe")
    except FieldDoesNotExist:
        fail(f"{model.__name__}.{field} NO existe")

def field_not_exists(model, field):
    try:
        model._meta.get_field(field)
        fail(f"{model.__name__}.{field} existe, pero no deberia existir")
    except FieldDoesNotExist:
        ok(f"{model.__name__}.{field} no existe, correcto")

print("\n=== TEST DE CAMPOS CORREGIDOS ===")

field_exists(Document, "title")
field_not_exists(Document, "tittle")

field_exists(Document, "ai_metadata")
field_not_exists(Document, "ai_metada")

field_exists(Document, "issuing_institution")
field_exists(Document, "issuing_professional")
field_not_exists(Document, "issuing_profesional")

field_exists(HealthCenter, "name")
field_exists(TemporaryAccessLink, "expires_at")

print("\n=== TEST DE __str__ ===")

for model in [DocumentCategory, Document, HealthCenter, TemporaryAccessLink]:
    if "__str__" in model.__dict__:
        ok(f"{model.__name__} tiene __str__ definido en la clase")
    else:
        fail(f"{model.__name__} NO tiene __str__ definido en la clase")

try:
    print(str(DocumentCategory(name="categoria prueba", slug="categoria-prueba")))
    ok("DocumentCategory.__str__ funciona")
except Exception as e:
    fail(f"DocumentCategory.__str__ fallo: {e}")

try:
    print(str(Document(id=uuid4(), user_id=uuid4(), title="documento prueba", doc_type="other", file_key="test.pdf")))
    ok("Document.__str__ funciona")
except Exception as e:
    fail(f"Document.__str__ fallo: {e}")

try:
    print(str(HealthCenter(id=uuid4(), name="centro prueba", center_type="cesfam")))
    ok("HealthCenter.__str__ funciona")
except Exception as e:
    fail(f"HealthCenter.__str__ fallo: {e}")

try:
    print(str(TemporaryAccessLink(id=uuid4(), user_id=uuid4(), token="token-prueba")))
    ok("TemporaryAccessLink.__str__ funciona")
except Exception as e:
    fail(f"TemporaryAccessLink.__str__ fallo: {e}")

print("\n=== TEST ORM REAL ===")

for model in [DocumentCategory, Document, HealthCenter, TemporaryAccessLink]:
    try:
        result = model.objects.values().first()
        ok(f"{model.__name__}.objects.values().first() funciona")
        print(result)
    except Exception as e:
        fail(f"{model.__name__} fallo en ORM: {e}")

print("\n=== RESULTADO FINAL ===")

if errors:
    print(f"hay {len(errors)} error(es):")
    for error in errors:
        print("-", error)
else:
    print("todo ok: los errores reportados ya no aparecen")
""")
```

Este test revisa que no existan los errores de campos mal escritos como:

```txt
tittle
ai_metada
issuing_profesional
```

y valida que existan los campos reales:

```txt
title
ai_metadata
issuing_institution
issuing_professional
name
expires_at
```

También prueba que `__str__` esté definido correctamente y que el ORM pueda ejecutar:

```python
model.objects.values().first()
```

---

## 🔑 Variables de entorno principales

| Variable | Descripción |
|---|---|
| `SECRET_KEY` | Clave secreta de Django |
| `DEBUG` | Modo debug de Django |
| `ALLOWED_HOSTS` | Hosts permitidos |
| `DB_NAME` | Nombre de la base de datos |
| `DB_USER` | Usuario de PostgreSQL |
| `DB_PASSWORD` | Password de PostgreSQL |
| `DB_HOST` | Host de PostgreSQL o pooler de Supabase |
| `DB_PORT` | Puerto de PostgreSQL |
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_SERVICE_KEY` | Service role key para operaciones backend |
| `SUPABASE_BUCKET` | Bucket usado para archivos médicos |
| `FRONTEND_URL` | URL del frontend para CORS |

---

## 🛠️ Tecnologías principales

- **Python 3.12**
- **Django 5.1**
- **Django REST Framework**
- **PostgreSQL**
- **Supabase**
- **psycopg2**
- **SimpleJWT**
