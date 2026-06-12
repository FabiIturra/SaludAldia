from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("admin/",                   admin.site.urls),
    path("api/auth/",                include("apps.users.urls")),
    path("api/auth/token/refresh/",  TokenRefreshView.as_view(), name="token_refresh"),
    path("api/documents/",           include("apps.documents.urls")),
    path("api/sharing/",             include("apps.sharing.urls")),
    path("api/ai/",                  include("apps.ai_analysis.urls")),
    path("api/health-centers/",      include("apps.health_centers.urls")),
    path("api/pets/",                include("apps.pets.urls")),
]
