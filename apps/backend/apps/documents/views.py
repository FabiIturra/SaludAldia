from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser


# views base del modulo documents

@api_view(["GET", "POST"])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser])
def documents_view(request):
    # get: listar documentos del usuario
    # post: crear o subir documento
    pass


@api_view(["GET", "PUT", "DELETE"])
@permission_classes([AllowAny])
def document_detail_view(request, document_id):
    # get: obtener detalle del documento
    # put: actualizar metadata del documento
    # delete: eliminar documento con soft delete
    pass


@api_view(["GET"])
@permission_classes([AllowAny])
def document_categories_view(request):
    # get: listar categorias de documentos
    pass
