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

print("\\n=== TEST DE CAMPOS CORREGIDOS ===")

field_exists(Document, "title")
field_not_exists(Document, "tittle")

field_exists(Document, "ai_metadata")
field_not_exists(Document, "ai_metada")

field_exists(Document, "issuing_institution")
field_exists(Document, "issuing_professional")
field_not_exists(Document, "issuing_profesional")

field_exists(HealthCenter, "name")
field_exists(TemporaryAccessLink, "expires_at")

print("\\n=== TEST DE __str__ ===")

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

print("\\n=== TEST ORM REAL ===")

for model in [DocumentCategory, Document, HealthCenter, TemporaryAccessLink]:
    try:
        result = model.objects.values().first()
        ok(f"{model.__name__}.objects.values().first() funciona")
        print(result)
    except Exception as e:
        fail(f"{model.__name__} fallo en ORM: {e}")

print("\\n=== RESULTADO FINAL ===")

if errors:
    print(f"hay {len(errors)} error(es):")
    for error in errors:
        print("-", error)
else:
    print("todo ok: los errores reportados ya no aparecen")
""")