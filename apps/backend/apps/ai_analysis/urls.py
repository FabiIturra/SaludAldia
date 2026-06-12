from django.urls import path
from . import views
urlpatterns = [
    path("", views.health, name="ai_analysis-health"),
]
