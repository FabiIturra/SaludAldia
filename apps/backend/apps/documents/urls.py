from django.urls import path
from . import views


urlpatterns = [
    path("", views.health, name="documents-health"),

    path("list/", views.document_list, name="document-list"),
    path("create/", views.document_create, name="document-create"),

    path("<uuid:document_id>/", views.document_detail, name="document-detail"),
    path("<uuid:document_id>/update/", views.document_update, name="document-update"),
    path("<uuid:document_id>/delete/", views.document_delete, name="document-delete"),
]