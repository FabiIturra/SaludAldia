from rest_framework import serializers
from .repositories import UserRepository


class UserService:
    @staticmethod
    def register_user(data):
        email = data['email']
        rut = data['rut']

        if UserService.validate_email_not_registered(email):
            raise serializers.ValidationError({
                "email": "El email ya esta registrado."
            })

        if UserService.validate_rut_not_registered(rut):
            raise serializers.ValidationError({
                "rut": "El RUT ya esta registrado."
            })

        return UserRepository.create_user(data)

    @staticmethod
    def validate_email_not_registered(email):
        if UserRepository.exists_by_email(email):
            return True

        return False

    @staticmethod
    def validate_rut_not_registered(rut):
        if UserRepository.exists_by_rut(rut):
            return True

        return False

    @staticmethod
    def validate_user_exists(user):
        if user is None:
            return False

        return True

    @staticmethod
    def validate_new_password_is_different(user,new_password):
        return not user.check_password(new_password)

    @staticmethod
    def get_user_by_identifier(email=None, rut=None):
        if email:
            return UserRepository.get_by_email(email)

        if rut:
            return UserRepository.get_by_rut(rut)

        return None

    @staticmethod
    def get_medical_profile(user):
        return UserRepository.get_or_create_medical_profile(user)

    @staticmethod
    def update_medical_profile(user, data):
        profile = UserRepository.get_or_create_medical_profile(user)

        for field, value in data.items():
            setattr(profile, field, value)

        return UserRepository.save_medical_profile(profile)

class AuthService:
    @staticmethod
    def login(email, password):
        user = UserRepository.get_by_email(email)

        if not UserService.validate_user_exists(user):
            raise serializers.ValidationError({
                "email": "El usuario no existe."
            })

        if not user.check_password(password):
            raise serializers.ValidationError({
                "password": "La contraseña es incorrecta."
            })

        if not user.is_active:
            raise serializers.ValidationError({
                "user": "El usuario se encuentra desactivado."
            })

        return user

    @staticmethod
    def request_reset(email):
        user = UserRepository.get_by_email(email)

        if not UserService.validate_user_exists(user):
            raise serializers.ValidationError({
                "email": "El usuario no existe"
            })

        return user

    @staticmethod
    def confirm_reset(email, new_password):
        user = UserRepository.get_by_email(email)

        if not UserService.validate_user_exists(user):
            raise serializers.ValidationError({
                "email" : "El usuario no existe"
            })

        if not UserService.validate_new_password_is_different(user,user.password):
            raise serializers.ValidationError({
                "new_password": "La nueva contrasenha no puede ser igual a la anterior."
            })

        user.set_password(new_password)

        return UserRepository.save_user(user)