from rest_framework import serializers

from .models import Document
from .validators import DocumentValidator


DOC_TYPE_ALIASES = {
    "EXAMENES": Document.DocType.EXAM,
    "EXAMEN": Document.DocType.EXAM,
    "RECETA": Document.DocType.PRESCRIPTION,
    "LICENCIA": Document.DocType.SICK_LEAVE,
    "CERTIFICADO": Document.DocType.SICK_LEAVE,
}


def normalize_doc_type(value):
    if not value:
        return Document.DocType.OTHER

    text = str(value).strip()
    upper_text = text.upper()
    if upper_text in DOC_TYPE_ALIASES:
        return DOC_TYPE_ALIASES[upper_text]

    return text


class DocumentSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    user_id = serializers.UUIDField(source="user.id", read_only=True)
    category_id = serializers.UUIDField(source="category.id", read_only=True, allow_null=True)
    category = serializers.SerializerMethodField()
    title = serializers.CharField(read_only=True)
    doc_type = serializers.CharField(read_only=True)
    file_key = serializers.CharField(read_only=True)
    file_url = serializers.CharField(read_only=True, allow_null=True)
    mime_type = serializers.CharField(read_only=True, allow_null=True)
    file_size_bytes = serializers.IntegerField(read_only=True, allow_null=True)
    document_date = serializers.DateField(read_only=True, allow_null=True)
    issuing_institution = serializers.CharField(read_only=True, allow_null=True)
    issuing_professional = serializers.CharField(read_only=True, allow_null=True)
    medical_center = serializers.SerializerMethodField()
    specialty = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    is_favorite = serializers.SerializerMethodField()
    bucket_name = serializers.SerializerMethodField()
    extracted_text = serializers.SerializerMethodField()
    ai_metadata = serializers.JSONField(read_only=True, allow_null=True)
    created_at = serializers.DateTimeField(read_only=True)
    deleted_at = serializers.DateTimeField(read_only=True, allow_null=True)

    def get_category(self, obj):
        if not obj.category:
            return None

        return {
            "id": str(obj.category.id),
            "name": obj.category.name,
            "slug": obj.category.slug,
            "icon": obj.category.icon,
        }

    def get_medical_center(self, obj):
        return obj.issuing_institution

    def get_specialty(self, obj):
        return (obj.ai_metadata or {}).get("specialty")

    def get_doctor_name(self, obj):
        return obj.issuing_professional

    def get_is_favorite(self, obj):
        return bool((obj.ai_metadata or {}).get("is_favorite"))

    def get_bucket_name(self, obj):
        return ((obj.ai_metadata or {}).get("storage") or {}).get("bucket_name")

    def get_extracted_text(self, obj):
        return ((obj.ai_metadata or {}).get("storage") or {}).get("extracted_text", "")


class CreateDocumentSerializer(serializers.Serializer):
    file = serializers.FileField(write_only=True)
    title = serializers.CharField(max_length=255)
    doc_type = serializers.CharField(required=False, allow_blank=True)
    category_id = serializers.UUIDField(required=True)
    document_date = serializers.DateField(required=False, allow_null=True)
    medical_center = serializers.CharField(required=False, allow_blank=True, max_length=255)
    specialty = serializers.CharField(required=False, allow_blank=True, max_length=100)
    doctor_name = serializers.CharField(required=False, allow_blank=True, max_length=255)
    is_favorite = serializers.BooleanField(required=False, default=False)

    def validate_file(self, file):
        DocumentValidator.validate_file_required(file)
        DocumentValidator.validate_file_size(file)
        DocumentValidator.validate_file_extension(file)
        DocumentValidator.validate_mime_type(file)
        DocumentValidator.validate_file_name(file)
        return file

    def validate_title(self, title):
        DocumentValidator.validate_title(title)
        return title.strip()

    def validate_doc_type(self, doc_type):
        normalized = normalize_doc_type(doc_type)
        DocumentValidator.validate_doc_type(normalized)
        return normalized

    def validate_document_date(self, document_date):
        DocumentValidator.validate_document_date_not_future(document_date)
        return document_date

    def validate_medical_center(self, medical_center):
        DocumentValidator.validate_medical_center(medical_center)
        return medical_center.strip() if medical_center else ""

    def validate_specialty(self, specialty):
        DocumentValidator.validate_specialty(specialty)
        return specialty.strip() if specialty else ""

    def validate_doctor_name(self, doctor_name):
        DocumentValidator.validate_doctor_name(doctor_name)
        return doctor_name.strip() if doctor_name else ""


class UpdateDocumentSerializer(serializers.Serializer):
    title = serializers.CharField(required=False, max_length=255)
    doc_type = serializers.CharField(required=False, allow_blank=True)
    category_id = serializers.UUIDField(required=False, allow_null=True)
    document_date = serializers.DateField(required=False, allow_null=True)
    medical_center = serializers.CharField(required=False, allow_blank=True, max_length=255)
    specialty = serializers.CharField(required=False, allow_blank=True, max_length=100)
    doctor_name = serializers.CharField(required=False, allow_blank=True, max_length=255)
    is_favorite = serializers.BooleanField(required=False)

    def validate_title(self, title):
        DocumentValidator.validate_title(title)
        return title.strip()

    def validate_doc_type(self, doc_type):
        normalized = normalize_doc_type(doc_type)
        DocumentValidator.validate_doc_type(normalized)
        return normalized

    def validate_document_date(self, document_date):
        DocumentValidator.validate_document_date_not_future(document_date)
        return document_date


class DocumentCategorySerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    name = serializers.CharField(read_only=True)
    slug = serializers.CharField(read_only=True)
    icon = serializers.CharField(read_only=True, allow_null=True)
