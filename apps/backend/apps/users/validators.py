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
        if "-" not in rut:
            raise serializers.ValidationError("El RUT debe incluir un guion (ej: 12345678-9).")

        if len(rut) < 10 or len(rut) > 12:
            raise serializers.ValidationError("El RUT debe tener entre 10 y 12 caracteres.")

        if "." in rut:
            raise serializers.ValidationError("El RUT no debe contener puntos.")

        rut = UserValidator.normalize_run(rut)
        body = rut[:-1]
        verifier = rut[-1]

        if not body.isdigit():
            raise serializers.ValidationError("El cuerpo del RUT debe contener solo números.")

        if not verifier.isdigit() and verifier != "K":
            raise serializers.ValidationError("El dígito verificador debe ser un número o K.")

        total = 0
        multiplier = 2
        for digit in reversed(body):
            total += int(digit) * multiplier
            multiplier = multiplier + 1 if multiplier < 7 else 2
        remainder = total % 11
        result = 11 - remainder
        if result == 11:
            expected = "0"
        elif result == 10:
            expected = "K"
        else:
            expected = str(result)

        if verifier != expected:
            raise serializers.ValidationError(
                f"El dígito verificador no es válido. Debería ser {expected}."
            )

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