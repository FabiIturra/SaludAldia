from rest_framework import serializers

from .repositories import DocumentRepository, DocumentCategoryRepository


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

        category_id = data.pop("category_id", None)

        if category_id:
            category = DocumentCategoryRepository.get_by_id(category_id)

            if not DocumentService.validate_category_exists(category):
                raise serializers.ValidationError({
                    "category_id": "La categoria indicada no existe."
                })

            data["category"] = category

        data["user"] = user

        return DocumentRepository.create_document(data)

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
