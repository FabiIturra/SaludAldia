import os
import sys


def main():
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "saludaldia.settings")

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "no se pudo importar django. revisa si el entorno virtual esta activo "
            "y si las dependencias estan instaladas."
        ) from exc

    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()