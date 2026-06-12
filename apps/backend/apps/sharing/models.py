import uuid

from django.conf import settings
from django.contrib.postgres.fields import ArrayField
from django.db import models


# enlace temporal para compartir documentos con un profesional de salud
class TemporaryAccessLink(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    # relacion con el usuario que crea el enlace
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.DO_NOTHING,
        related_name="temporary_access_links",
        db_column="user_id"
    )

    token = models.CharField(max_length=255)  # codigo unico para acceder al enlace

    professional_name = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )

    professional_rut = models.CharField(
        max_length=20,
        null=True,
        blank=True
    )

    document_ids = ArrayField(
        models.UUIDField(),
        default=list,
        blank=True
    )  # ids de los documentos compartidos en este enlace

    expires_at = models.DateTimeField()  # fecha de expiracion del enlace temporal

    # fecha en que se uso el enlace, null si aun no se usa
    accessed_at = models.DateTimeField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "temporary_access_links"
        managed = False  # tabla administrada manualmente desde schema.sql

    def __str__(self):
        return f"temporary access link - {self.token}"