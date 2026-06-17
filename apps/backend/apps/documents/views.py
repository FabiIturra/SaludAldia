# TODO: implementar views de documents en Sprint 2-4
from rest_framework import status, serializers

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


from .services import DocumentService
from .serializers import (
    DocumentSerializer,
    CreateDocumentSerializer,
    UpdateDocumentSerializer
)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def health(request):
    return Response({
        "status": "ok",
        "app": "documents"
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def document_list(request):

    try:
        documents = DocumentService.get_documents_by_user(request.user)

        response_serializer = DocumentSerializer(
            documents,
            many=True
        )

        return Response({
            "status": "success",
            "message": "Documentos obtenidos correctamente.",
            "documents": response_serializer.data
        }, status=status.HTTP_200_OK)

    except Exception:
        return Response({
            "status": "error",
            "message": "Ocurrio un error interno al obtener los documentos."
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def document_detail(request, document_id):

    try:
        document = DocumentService.get_document_by_id(document_id)

        if not DocumentService.validate_document_exists(document):
            return Response({
                "status": "error",
                "message": "Documento no encontrado."
            }, status=status.HTTP_404_NOT_FOUND)

        response_serializer = DocumentSerializer(document)

        return Response({
            "status": "success",
            "message": "Documento obtenido correctamente.",
            "document": response_serializer.data
        }, status=status.HTTP_200_OK)

    except Exception:
        return Response({
            "status": "error",
            "message": "Ocurrio un error interno al obtener el documento."
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def document_create(request):

    serializer = CreateDocumentSerializer(data=request.data)

    if not serializer.is_valid():
        return Response({
            "status": "error",
            "message": "Datos invalidos.",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        document = DocumentService.create_document(
            request.user,
            serializer.validated_data
        )

        response_serializer = DocumentSerializer(document)

        return Response({
            "status": "success",
            "message": "Documento creado correctamente.",
            "document": response_serializer.data
        }, status=status.HTTP_201_CREATED)

    except serializers.ValidationError as error:
        return Response({
            "status": "error",
            "message": "No se pudo crear el documento.",
            "errors": error.detail
        }, status=status.HTTP_400_BAD_REQUEST)

    except Exception:
        return Response({
            "status": "error",
            "message": "Ocurrio un error interno al crear el documento."
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def document_update(request, document_id):

    serializer = UpdateDocumentSerializer(data=request.data)

    if not serializer.is_valid():
        return Response({
            "status": "error",
            "message": "Datos invalidos.",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        document = DocumentService.get_document_by_id(document_id)

        if not DocumentService.validate_document_exists(document):
            return Response({
                "status": "error",
                "message": "Documento no encontrado."
            }, status=status.HTTP_404_NOT_FOUND)

        document = DocumentService.update_document(
            document,
            serializer.validated_data
        )

        response_serializer = DocumentSerializer(document)

        return Response({
            "status": "success",
            "message": "Documento actualizado correctamente.",
            "document": response_serializer.data
        }, status=status.HTTP_200_OK)

    except Exception:
        return Response({
            "status": "error",
            "message": "Ocurrio un error interno al actualizar el documento."
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def document_delete(request, document_id):

    try:
        document = DocumentService.get_document_by_id(document_id)

        if not DocumentService.validate_document_exists(document):
            return Response({
                "status": "error",
                "message": "Documento no encontrado."
            }, status=status.HTTP_404_NOT_FOUND)

        DocumentService.delete_document(document)

        return Response({
            "status": "success",
            "message": "Documento eliminado correctamente."
        }, status=status.HTTP_200_OK)

    except Exception:
        return Response({
            "status": "error",
            "message": "Ocurrio un error interno al eliminar el documento."
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)