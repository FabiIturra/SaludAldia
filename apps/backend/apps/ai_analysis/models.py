import uuid

from django.conf import settings
from django.db import models


# recomendacion generada por ia para el usuario
class AIRecommendation(models.Model):
    # niveles de prioridad de la recomendacion
    class Priority(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    # relacion con el usuario que recibe la recomendacion
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.DO_NOTHING,
        related_name="ai_recommendations",
        db_column="user_id"
    )

    title = models.CharField(max_length=255)

    body = models.TextField()

    priority = models.CharField(
        max_length=20,
        choices=Priority.choices,
        default=Priority.LOW
    )

    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "ai_recommendations"
        managed = False  # tabla administrada manualmente desde schema.sql

    def __str__(self):
        return self.title