import uuid

from django.conf import settings
from django.db import models


# registro de auditoria de acciones del sistema
class AuditLog(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    # usuario que realizo la accion (puede ser null si la genera el sistema)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.DO_NOTHING,
        null=True,
        blank=True,
        related_name="audit_logs",
        db_column="user_id"
    )

    action = models.CharField(max_length=100)

    entity_type = models.CharField(
        max_length=50,
        null=True,
        blank=True
    )

    entity_id = models.UUIDField(
        null=True,
        blank=True
    )

    metadata = models.JSONField(
        null=True,
        blank=True
    )  # datos adicionales sobre la accion

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "audit_logs"
        managed = False  # tabla administrada manualmente desde schema.sql

    def __str__(self):
        return f"{self.action} - {self.created_at}"