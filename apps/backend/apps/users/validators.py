import re

from rest_framework import serializers
from unicodedata import normalize


class UserValidator:
    # ------------------------------------------
    # normalizadores de email y rut
    # ------------------------------------------
    @staticmethod
    def normalize_email(email):
        # valida que el correo no venga vacio
        if not email:
            raise serializers.ValidationError("El email es requerido")

        # elimina espacios al inicio/final y deja el correo en minusculas
        return email.lower().strip()

    @staticmethod
    def normalize_run(rut):
        # valida que el rut no venga vacio
        if not rut:
            raise serializers.ValidationError("El rut es requerido")

        # elimina espacios, deja la k en mayuscula y quita puntos/guion
        # ejemplo: 12.345.678-k -> 12345678K
        rut = rut.strip().upper()
        rut = rut.replace(".","")
        rut = rut.replace("-","")

        return rut

    # ------------------------
    # valdiadores de logica
    # ------------------------
    @staticmethod
    def validate_email_format(email):
        # primero normalizamos el correo para trabajar siempre con el mismo formato
        email = UserValidator.normalize_email(email)

        # valida que el correo contenga @
        if "@" not in email:
            raise serializers.ValidationError("El correo debe de contener un @.")

        # split("@") separa el correo en partes
        # [-1] toma la ultima parte, que corresponde al dominio
        domain = email.split("@")[-1]

        # valida que el dominio tenga al menos un punto
        # ejemplo valido: gmail.com
        if "." not in domain:
            raise serializers.ValidationError("El correo debe de contener un dominio valido.")

        return email

    @staticmethod
    def validate_rut_format(rut):
        # primero normalizamos el rut para validar siempre el mismo formato
        rut = UserValidator.normalize_run(rut)

        # valida largo del rut ya normalizado, sin puntos ni guion
        if len(rut) < 7 or len(rut) > 9:
            raise serializers.ValidationError("El RUT debe de tener entre 7 y 9 caracteres")

        # rut[:-1] toma todo menos el ultimo caracter
        # ejemplo: 12345678K -> 12345678
        body = rut[:1]

        # rut[-1] toma solo el ultimo caracter
        # ejemplo: 12345678K -> K
        verifier = rut[-1]

        # isdigit() valida que todos los caracteres sean numeros
        if not body.isdigit():
            raise serializers.ValidationError("El cuerpo del RUT debe contener solo numeros.")

        # el digito verificador puede ser un numero o la letra K
        if not verifier.isdigit() and verifier != "K":
            raise serializers.ValidationError("El digito verificador debe ser un numero o K.")

        return rut

    @staticmethod
    def validate_password_strength(password):
        # valida que la contraseña no venga vacia
        if not password:
            raise serializers.ValidationError("La contraseña es obligatoria.")

        # valida largo minimo
        if len(password) < 6:
            raise serializers.ValidationError("La contraseña debe tener al menos 6 caracteres.")

        # valida largo maximo
        if len(password) > 12:
            raise serializers.ValidationError("La contraseña no puede tener mas de 12 caracteres.")

        # re.search busca si existe al menos una coincidencia con el patron indicado
        # [A-Z] valida que exista al menos una mayuscula
        if not re.search(r"[A-Z]", password):
            raise serializers.ValidationError("La contraseña debe tener al menos una mayuscula.")

        # [a-z] valida que exista al menos una minuscula
        if not re.search(r"[a-z]", password):
            raise serializers.ValidationError("La contraseña debe tener al menos una minuscula.")

        # \d valida que exista al menos un numero
        if not re.search(r"\d", password):
            raise serializers.ValidationError("La contraseña debe tener al menos un numero.")

        # [^\w\s] valida que exista al menos un signo o simbolo
        # es decir, algo que no sea letra, numero, guion bajo o espacio
        if not re.search(r"[^\w\s]", password):
            raise serializers.ValidationError("La contraseña debe tener al menos un signo o simbolo.")

        return password

    @staticmethod
    def validate_passwords_match(password, confirm_password):
        # valida que ambas contraseñas sean iguales
        if password != confirm_password:
            raise serializers.ValidationError("Las contraseñas no coinciden.")

        return True