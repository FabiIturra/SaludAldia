from rest_framework import serializers
from .models import Document


class CreateDocumentSerializer(serializers.Serializer):
    category_id = serializers.UUIDField(required=False)

    title = serializers.CharField(
        required=True,
        max_length=255
    )

    doc_type = serializers.ChoiceField(
        choices=Document.DocType.choices,
        required=True
    )

    file_key = serializers.CharField(
        required=True,
        max_length=500
    )

    file_url = serializers.CharField(
        required=False,
        allow_blank=True
    )

    mime_type = serializers.CharField(
        required=False,
        allow_blank=True
    )

    file_size_bytes = serializers.IntegerField(
        required=False
    )

    document_date = serializers.DateField(
        required=False
    )

    issuing_institution = serializers.CharField(
        required=False,
        allow_blank=True
    )

    issuing_professional = serializers.CharField(
        required=False,
        allow_blank=True
    )


class UpdateDocumentSerializer(serializers.Serializer):

    title = serializers.CharField(
        required=False,
        max_length=255
    )

    doc_type = serializers.ChoiceField(
        choices=Document.DocType.choices,
        required=False
    )

    document_date = serializers.DateField(
        required=False
    )

    issuing_institution = serializers.CharField(
        required=False,
        allow_blank=True
    )

    issuing_professional = serializers.CharField(
        required=False,
        allow_blank=True
    )


class DocumentSerializer(serializers.Serializer):
    id = serializers.UUIDField()

    title = serializers.CharField()

    doc_type = serializers.CharField()

    file_key = serializers.CharField()

    file_url = serializers.CharField(
        allow_null=True,
        required=False
    )

    mime_type = serializers.CharField(
        allow_null=True,
        required=False
    )

    file_size_bytes = serializers.IntegerField(
        allow_null=True,
        required=False
    )

    document_date = serializers.DateField(
        allow_null=True,
        required=False
    )

    issuing_institution = serializers.CharField(
        allow_null=True,
        required=False
    )

    issuing_professional = serializers.CharField(
        allow_null=True,
        required=False
    )

    ai_metadata = serializers.JSONField(
        allow_null=True,
        required=False
    )

    created_at = serializers.DateTimeField()