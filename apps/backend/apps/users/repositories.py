from django.contrib.auth import get_user_model

from .models import MedicalProfile

User = get_user_model()


class UserRepository:

    @staticmethod
    def get_by_id(user_id):
        pass

    @staticmethod
    def get_by_email(email):
        pass

    @staticmethod
    def get_by_rut(rut):
        pass

    @staticmethod
    def exists_by_email(email):
        pass
    @staticmethod
    def exists_by_rut(rut):
        pass

    @staticmethod
    def create_user(data):
        pass

    @staticmethod
    def save_user(user):
        pass

    @staticmethod
    def get_or_create_medical_profile(user):
        pass
        
    @staticmethod
    def save_medical_profile(profile):
        pass