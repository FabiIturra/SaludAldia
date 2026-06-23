from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser


# ──────────────────────────────────────────────
# Views nuevas (plantilla MVP)
# ──────────────────────────────────────────────

@api_view(["GET", "POST"])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser])
def documents_view(request):
    # GET: listar documentos del usuario
    # POST: crear/subir documento
    pass


@api_view(["DELETE"])
@permission_classes([AllowAny])
def document_detail_view(request, document_id):
    # DELETE: eliminar documento del usuario mediante soft delete
    pass


@api_view(["GET"])
@permission_classes([AllowAny])
def document_categories_view(request):
    # GET: listar categorias de documentos
    pass

# Stubs temporales requeridos por urls.py actual
# TODO: eliminar cuando se actualice urls.py

@api_view(["GET"])
@permission_classes([AllowAny])
def health(request):
    pass


@api_view(["GET"])
@permission_classes([AllowAny])
def document_list(request):
    pass


@api_view(["POST"])
@permission_classes([AllowAny])
def document_create(request):
    pass


@api_view(["GET"])
@permission_classes([AllowAny])
def document_detail(request, document_id):
    pass


@api_view(["PUT"])
@permission_classes([AllowAny])
def document_update(request, document_id):
    pass


@api_view(["DELETE"])
@permission_classes([AllowAny])
def document_delete(request, document_id):
    pass
