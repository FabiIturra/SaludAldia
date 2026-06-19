from .repositories import DocumentRepository


class DocumentService:

    @staticmethod
    def get_documents_by_user(user):
        return DocumentRepository.get_all_by_user(user)

    @staticmethod
    def get_document_by_id(document_id):
        return DocumentRepository.get_by_id(document_id)

    @staticmethod
    def validate_document_exists(document):
        if document is None:
            return False

        return True

    @staticmethod
    def create_document(user, data):
        data["user"] = user

        return DocumentRepository.create_document(data)

    @staticmethod
    def update_document(document, data):
        for field, value in data.items():
            setattr(document, field, value)

        return DocumentRepository.save_document(document)

    @staticmethod
    def delete_document(document):
        return DocumentRepository.soft_delete(document)