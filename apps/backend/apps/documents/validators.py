from pathlib import Path

from rest_framework import serializers


class DocumentValidator:
    MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
    ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png", ".webp"}
    ALLOWED_MIME_TYPES = {
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/webp",
    }

    @staticmethod
    def validate_file_required(file):
        if file is None:
            raise serializers.ValidationError("Debe adjuntar un archivo.")

    @staticmethod
    def validate_file_size(file):
        if file and file.size > DocumentValidator.MAX_FILE_SIZE_BYTES:
            raise serializers.ValidationError("El archivo no puede superar los 10 MB.")

    @staticmethod
    def validate_file_extension(file):
        if not file:
            return

        extension = Path(file.name).suffix.lower()
        if extension not in DocumentValidator.ALLOWED_EXTENSIONS:
            raise serializers.ValidationError(
                "Formato no permitido. Use PDF, JPG, PNG o WEBP."
            )

    @staticmethod
    def validate_mime_type(file):
        if not file:
            return

        if file.content_type not in DocumentValidator.ALLOWED_MIME_TYPES:
            raise serializers.ValidationError("Tipo de archivo no permitido.")

    @staticmethod
    def validate_file_name(file):
        if file and len(file.name) > 180:
            raise serializers.ValidationError("El nombre del archivo es demasiado largo.")

    @staticmethod
    def validate_title(title):
        if not title or not title.strip():
            raise serializers.ValidationError("El titulo es obligatorio.")

    @staticmethod
    def validate_doc_type(doc_type):
        valid_types = {"exam", "prescription", "sick_leave", "report", "vaccine", "other"}
        if doc_type not in valid_types:
            raise serializers.ValidationError("Tipo de documento no valido.")

    @staticmethod
    def validate_document_date(document_date):
        return document_date

    @staticmethod
    def validate_document_date_not_future(document_date):
        from django.utils import timezone

        if document_date and document_date > timezone.localdate():
            raise serializers.ValidationError(
                "La fecha del documento no puede ser futura."
            )

    @staticmethod
    def validate_medical_center(medical_center):
        if medical_center and len(medical_center) > 255:
            raise serializers.ValidationError("El centro medico es demasiado largo.")

    @staticmethod
    def validate_specialty(specialty):
        if specialty and len(specialty) > 100:
            raise serializers.ValidationError("La especialidad es demasiado larga.")

    @staticmethod
    def validate_doctor_name(doctor_name):
        if doctor_name and len(doctor_name) > 255:
            raise serializers.ValidationError("El nombre del medico es demasiado largo.")

    @staticmethod
    def validate_is_favorite(is_favorite):
        return bool(is_favorite)

    @staticmethod
    def validate_category_id(category_id):
        return category_id

    @staticmethod
    def validate_metadata(data):
        return data
