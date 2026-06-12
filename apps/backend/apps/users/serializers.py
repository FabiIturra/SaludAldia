from rest_framework import serializers
from .models import User, MedicalProfile


class RegisterSerializer(serializers.ModelSerializer):
    password         = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    first_name       = serializers.CharField()
    last_name        = serializers.CharField()

    class Meta:
        model  = User
        fields = ["email", "rut", "password", "confirm_password", "first_name", "last_name"]

    def validate(self, data):
        if data["password"] != data.pop("confirm_password"):
            raise serializers.ValidationError("Las contraseñas no coinciden")
        return data

    def create(self, validated_data):
        first_name = validated_data.pop("first_name")
        last_name  = validated_data.pop("last_name")
        user = User.objects.create_user(**validated_data)
        MedicalProfile.objects.create(user=user, first_name=first_name, last_name=last_name)
        return user


class UserSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source="medical_profile.first_name", read_only=True)
    last_name  = serializers.CharField(source="medical_profile.last_name",  read_only=True)

    class Meta:
        model  = User
        fields = ["id", "email", "rut", "first_name", "last_name", "email_verified", "created_at"]


class MedicalProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model  = MedicalProfile
        exclude = ["user"]
