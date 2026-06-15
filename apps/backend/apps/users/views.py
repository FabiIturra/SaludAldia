from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated


# --------------------------
# parte del Auth
# --------------------------
@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    pass

@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    pass

# --------------------------
# parte de las ventanas
# me , medical profile
# --------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    pass

@api_view(["GET","PATCH"])
@permission_classes([IsAuthenticated])
def medical_profile(request):
    pass

# --------------
# recovery del password
# --------------
@api_view(["POST"])
@permission_classes([AllowAny])
def password_reset_request(request):
    pass

@api_view(["POST"])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    pass