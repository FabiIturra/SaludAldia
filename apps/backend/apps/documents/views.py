from rest_framework import serializers, status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response

from apps.users.services import UserService

from .serializers import (
    CreateDocumentSerializer,
    DocumentCategorySerializer,
    DocumentSerializer,
    UpdateDocumentSerializer,
)
from .services import DocumentCategoryService, DocumentService


def get_request_user(request):
    email = request.query_params.get("email") or request.data.get("email")
    rut = request.query_params.get("rut") or request.data.get("rut")

    if not email and not rut:
        raise serializers.ValidationError({
            "user": "Debe enviar email o rut para buscar el usuario."
        })

    user = UserService.get_user_by_identifier(email=email, rut=rut)

    if not UserService.validate_user_exists(user):
        raise serializers.ValidationError({
            "user": "Usuario no encontrado."
        })

    return user


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def documents_view(request):
    try:
        user = get_request_user(request)

        if request.method == "GET":
            documents = DocumentService.get_documents_by_user(user)
            response_serializer = DocumentSerializer(documents, many=True)

            return Response({
                "status": "success",
                "message": "Documentos obtenidos correctamente.",
                "documents": response_serializer.data,
            }, status=status.HTTP_200_OK)

        serializer = CreateDocumentSerializer(data=request.data)

        if not serializer.is_valid():
            return Response({
                "status": "error",
                "message": "Datos invalidos.",
                "errors": serializer.errors,
            }, status=status.HTTP_400_BAD_REQUEST)

        document = DocumentService.create_document(
            user=user,
            data=serializer.validated_data,
        )
        response_serializer = DocumentSerializer(document)

        return Response({
            "status": "success",
            "message": "Documento creado correctamente.",
            "document": response_serializer.data,
        }, status=status.HTTP_201_CREATED)

    except serializers.ValidationError as error:
        return Response({
            "status": "error",
            "message": "No se pudo procesar la solicitud.",
            "errors": error.detail,
        }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as error:
        return Response({
            "status": "error",
            "message": "Ocurrio un error interno en documentos.",
            "details": str(error),
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([AllowAny])
def document_detail_view(request, document_id):
    try:
        user = get_request_user(request)
        document = DocumentService.get_document_by_id_and_user(document_id, user)

        if request.method == "GET":
            response_serializer = DocumentSerializer(document)

            return Response({
                "status": "success",
                "message": "Documento obtenido correctamente.",
                "document": response_serializer.data,
            }, status=status.HTTP_200_OK)

        if request.method in ["PUT", "PATCH"]:
            serializer = UpdateDocumentSerializer(
                data=request.data,
                partial=request.method == "PATCH",
            )

            if not serializer.is_valid():
                return Response({
                    "status": "error",
                    "message": "Datos invalidos.",
                    "errors": serializer.errors,
                }, status=status.HTTP_400_BAD_REQUEST)

            updated_document = DocumentService.update_document(
                document=document,
                data=serializer.validated_data,
            )
            response_serializer = DocumentSerializer(updated_document)

            return Response({
                "status": "success",
                "message": "Documento actualizado correctamente.",
                "document": response_serializer.data,
            }, status=status.HTTP_200_OK)

        DocumentService.delete_document(document)

        return Response({
            "status": "success",
            "message": "Documento eliminado correctamente.",
        }, status=status.HTTP_200_OK)

    except serializers.ValidationError as error:
        return Response({
            "status": "error",
            "message": "No se pudo procesar la solicitud.",
            "errors": error.detail,
        }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as error:
        return Response({
            "status": "error",
            "message": "Ocurrio un error interno en documentos.",
            "details": str(error),
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([AllowAny])
def document_categories_view(request):
    try:
        categories = DocumentCategoryService.get_categories()
        response_serializer = DocumentCategorySerializer(categories, many=True)

        return Response({
            "status": "success",
            "message": "Categorias obtenidas correctamente.",
            "categories": response_serializer.data,
        }, status=status.HTTP_200_OK)

    except Exception as error:
        return Response({
            "status": "error",
            "message": "Ocurrio un error interno al obtener categorias.",
            "details": str(error),
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
