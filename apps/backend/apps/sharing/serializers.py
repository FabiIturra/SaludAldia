from rest_framework import serializers

from apps.documents.models import Document
from apps.users.validators import UserValidator


class ShareDocumentSerializer(serializers.Serializer):

    # nombre del profesional que recibirá el enlace
    professional_name = serializers.CharField(max_length=255)

    # RUT del profesional, se valida con algoritmo módulo 11
    professional_rut = serializers.CharField(max_length=20)

    # lista de UUIDs de documentos a incluir en el enlace
    document_ids = serializers.ListField(
        child=serializers.UUIDField(),
        min_length=1,
    )

    # horas de validez del enlace (mínimo 1h, máximo 7 días = 168h)
    expire_in_hours = serializers.IntegerField(min_value=1, max_value=168)

    def validate_professional_rut(self, value):
        """Valida formato y dígito verificador del RUT usando UserValidator."""
        return UserValidator.validate_rut_format(value)

    def validate_document_ids(self, value):
        """
        Verifica que los documentos existan y pertenezcan al usuario
        autenticado. Retorna error con los IDs inválidos si alguno
        no cumple la condición.
        """
        user = self.context["request"].user
        existing = set(
            Document.objects.filter(id__in=value, user=user)
            .values_list("id", flat=True)
        )
        invalid = [str(uid) for uid in value if uid not in existing]
        if invalid:
            raise serializers.ValidationError(
                f"Documentos no encontrados o no pertenecen al usuario: "
                f"{', '.join(invalid)}"
            )
        return value
