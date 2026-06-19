from rest_framework import serializers
from .models import MedicalProfile
from .validators import UserValidator


class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(required=True, min_length=10, max_length=60)
    email = serializers.EmailField(required=True)
    rut = serializers.CharField(required=True, min_length=7, max_length=12)
    password = serializers.CharField(required=True, min_length=6, max_length=12, write_only=True)

    # la base que se usara, aqui crearemos las validaciones de entrada
    def validate_email(self, value):
        return value.strip()

    def validate_email(self, value):
        return UserValidator.validate_email_format(value)

    def validate_rut(self, value):
        return UserValidator().validate_rut_format(value)

    def validate_password(self, value):
        return UserValidator().validate_password_strength(value)

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate_email(self, value):
        return UserValidator.validate_email_format(value)

class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        return UserValidator.validate_email_format(value)

class PasswordResetConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    new_password = serializers.CharField(required=True, min_length=6, max_length=12, write_only=True)
    confirm_password = serializers.CharField(required=True, min_length=6, max_length=12, write_only=True)

    def validate_email(self, value):
        return UserValidator.validate_email_format(value)

    def validate_new_password(self, value):
        return UserValidator.validate_password_strength(value)

    def validate_confirm_password(self, value):
        return UserValidator.validate_password_strength(value)

    def validate(self, attrs):
        new_password = attrs.get("new_password")
        confirm_password = attrs.get("confirm_password")

        if new_password != confirm_password:
            raise serializers.ValidationError({
                "confirm_password": "Las contraseñas no coinciden."
            })

        return attrs

class UserSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    email = serializers.EmailField()
    rut = serializers.CharField()
    name = serializers.CharField()

class MedicalProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalProfile
        fields = [
            "first_name",
            "last_name",
            "birthdate",
            "genre",
            "blood_type",
            "weight",
            "height",
            "profile_image",
            "allergies",
            "chronic_conditions",
            "emergency_contact_name",
            "emergency_contact_phone",
            "updated_at",
        ]
        read_only_fields = [
            "updated_at",
        ]

    def validate_weight(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError("El peso debe ser mayor a 0.")
        return value

    def validate_height(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError("La altura debe ser mayor a 0.")
        return value
