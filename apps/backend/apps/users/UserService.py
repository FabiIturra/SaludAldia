class UserService:

    @staticmethod
    def register_user(data):
        pass

    @staticmethod
    def validate_email_not_registered(email):
        pass

    @staticmethod
    def validate_rut_not_registered(rut):
        pass

    @staticmethod
    def validate_user_exists(user):
        pass

    @staticmethod
    def validate_new_password_is_different(user,new_password):
        pass

class AuthService:
    @staticmethod
    def request_reset(email):
        pass

    @staticmethod
    def confirm_reset(email):
        pass