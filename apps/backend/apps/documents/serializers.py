from rest_framework import serializers


class DocumentSerializer(serializers.Serializer):
    # todos los serializars document para el listado:
    # campos esperados mas adelante:
    # id, title, document_type, category, document_date
    # medical_center, specialty, doctor_name, is_favorite
    # file_key, file_url, mime_type, file_size_bytes
    pass


class CreateDocumentSerializer(serializers.Serializer):
    # todo los validar datos para crear/subir documento
    # campos esperados mas adelante:
    # title, document_type, category_id, document_date
    # medical_center, specialty, doctor_name, is_favorite
    # file
    pass

class UpdateDocumentSerializer(serializers.Serializer):
    pass

class DocumentCategorySerializer(serializers.Serializer):
    # TODO: serializar categorias de documentos
    # campos esperados mas adelante:
    # id, name, description
    pass
