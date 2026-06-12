import uuid

from django.contrib.postgres.fields import ArrayField
from django.db import models


# centro de salud (hospital, cesfam, clinica, farmacia, etc)
class HealthCenter(models.Model):
    # tipos de centro de salud disponibles
    class CenterType(models.TextChoices):
        HOSPITAL_PUBLICO = "hospital_publico", "Hospital publico"
        CESFAM = "cesfam", "Cesfam"
        CLINICA_PRIVADA = "clinica_privada", "Clinica privada"
        FARMACIA = "farmacia", "Farmacia"
        URGENCIA = "urgencia", "Urgencia"
        OTHER = "other", "Other"

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    name = models.CharField(max_length=255)

    center_type = models.CharField(
        max_length=50,
        choices=CenterType.choices
    )

    address = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )

    region = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    comuna = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    lat = models.FloatField(
        null=True,
        blank=True
    )

    lng = models.FloatField(
        null=True,
        blank=True
    )

    phone = models.CharField(
        max_length=30,
        null=True,
        blank=True
    )

    services = ArrayField(
        models.TextField(),
        default=list,
        blank=True
    )  # lista de servicios que ofrece el centro

    class Meta:
        db_table = "health_centers"
        managed = False  # tabla administrada manualmente desde schema.sql

    def __str__(self):
        return self.name