import uuid
from pathlib import Path

from django.conf import settings
from rest_framework import serializers
from supabase import create_client

from .repositories import DocumentRepository, DocumentCategoryRepository


class DocumentStorageService:
    @staticmethod
    def build_file_key(user, category, uploaded_file):
        extension = Path(uploaded_file.name).suffix.lower()
        return f"{user.id}/{category.slug}/{uuid.uuid4()}{extension}"

    @staticmethod
    def upload_file(user, category, uploaded_file):
        bucket_name = category.slug
        file_key = DocumentStorageService.build_file_key(user, category, uploaded_file)

        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
            raise serializers.ValidationError({
                "storage": "Supabase Storage no esta configurado."
            })

        client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        bucket = client.storage.from_(bucket_name)
        uploaded_file.seek(0)
        bucket.upload(
            file_key,
            uploaded_file.read(),
            {
                "content-type": uploaded_file.content_type,
                "upsert": "false",
            },
        )

        return {
            "bucket_name": bucket_name,
            "file_key": file_key,
            "file_url": None,
            "mime_type": uploaded_file.content_type,
            "file_size_bytes": uploaded_file.size,
            "extracted_text": "",
        }


class DocumentService:

    @staticmethod
    def get_documents_by_user(user):
        if not DocumentService.validate_user_exists(user):
            raise serializers.ValidationError({
                "user": "El usuario no existe."
            })

        return DocumentRepository.get_all_by_user(user)

    @staticmethod
    def get_document_by_id_and_user(document_id, user):
        if not DocumentService.validate_user_exists(user):
            raise serializers.ValidationError({
                "user": "El usuario no existe."
            })

        document = DocumentRepository.get_by_id_and_user(document_id, user)

        if not DocumentService.validate_document_exists(document):
            raise serializers.ValidationError({
                "document": "El documento no existe o no pertenece al usuario."
            })

        return document

    @staticmethod
    def create_document(user, data):
        if not DocumentService.validate_user_exists(user):
            raise serializers.ValidationError({
                "user": "El usuario no existe."
            })

        data = data.copy()
        uploaded_file = data.pop("file", None)
        if uploaded_file is None:
            raise serializers.ValidationError({
                "file": "Debe adjuntar un archivo."
            })

        category_id = data.pop("category_id", None)
        if category_id is None:
            raise serializers.ValidationError({
                "category_id": "La categoria es obligatoria."
            })

        specialty = data.pop("specialty", "")
        is_favorite = data.pop("is_favorite", False)
        data["issuing_institution"] = data.pop("medical_center", "")
        data["issuing_professional"] = data.pop("doctor_name", "")
        data["ai_metadata"] = {
            "specialty": specialty,
            "is_favorite": is_favorite,
        }

        category = DocumentCategoryRepository.get_by_id(category_id)

        if not DocumentService.validate_category_exists(category):
            raise serializers.ValidationError({
                "category_id": "La categoria indicada no existe."
            })

        data["category"] = category

        storage_data = DocumentStorageService.upload_file(
            user=user,
            category=category,
            uploaded_file=uploaded_file,
        )

        data["file_key"] = storage_data["file_key"]
        data["file_url"] = storage_data["file_url"]
        data["mime_type"] = storage_data["mime_type"]
        data["file_size_bytes"] = storage_data["file_size_bytes"]
        data["ai_metadata"]["storage"] = {
            "bucket_name": storage_data["bucket_name"],
            "extracted_text": storage_data["extracted_text"],
        }
        data["user"] = user

        return DocumentRepository.create_document(data)

    @staticmethod
    def update_document(document, data):
        if not DocumentService.validate_document_exists(document):
            raise serializers.ValidationError({
                "document": "El documento no existe."
            })

        data = data.copy()
        category_id = data.pop("category_id", None)
        metadata = document.ai_metadata or {}

        if "medical_center" in data:
            data["issuing_institution"] = data.pop("medical_center")

        if "doctor_name" in data:
            data["issuing_professional"] = data.pop("doctor_name")

        if "specialty" in data:
            metadata["specialty"] = data.pop("specialty")

        if "is_favorite" in data:
            metadata["is_favorite"] = data.pop("is_favorite")

        data["ai_metadata"] = metadata

        if category_id:
            category = DocumentCategoryRepository.get_by_id(category_id)

            if not DocumentService.validate_category_exists(category):
                raise serializers.ValidationError({
                    "category_id": "La categoria indicada no existe."
                })

            data["category"] = category

        for field, value in data.items():
            setattr(document, field, value)

        return DocumentRepository.save_document(document)

    @staticmethod
    def delete_document(document):
        if not DocumentService.validate_document_exists(document):
            raise serializers.ValidationError({
                "document": "El documento no existe."
            })

        return DocumentRepository.soft_delete(document)

    @staticmethod
    def validate_user_exists(user):
        return user is not None

    @staticmethod
    def validate_document_exists(document):
        return document is not None

    @staticmethod
    def validate_category_exists(category):
        return category is not None


class DocumentCategoryService:

    @staticmethod
    def get_categories():
        return DocumentCategoryRepository.get_all()

    @staticmethod
    def get_category_by_id(category_id):
        category = DocumentCategoryRepository.get_by_id(category_id)

        if category is None:
            raise serializers.ValidationError({
                "category_id": "La categoria indicada no existe."
            })

        return category
