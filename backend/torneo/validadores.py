# Validaciones de datos sensibles. Se ejecutan en el SERVIDOR antes de guardar en la base de datos.
import re

from django.core.exceptions import ValidationError


def validar_celular(valor):
    """Celular ecuatoriano: 10 dígitos que empiezan con 09."""
    if not re.fullmatch(r"09\d{8}", valor):
        raise ValidationError("El celular debe tener 10 dígitos y empezar con 09.")


def validar_cedula(valor):
    """Cédula ecuatoriana: 10 dígitos, provincia válida y dígito verificador (módulo 10)."""
    if not re.fullmatch(r"\d{10}", valor):
        raise ValidationError("La cédula debe tener 10 dígitos numéricos.")
    provincia = int(valor[:2])
    if not (1 <= provincia <= 24 or provincia == 30):
        raise ValidationError("La cédula tiene un código de provincia inválido.")
    if int(valor[2]) > 5:
        raise ValidationError("La cédula no es válida (tercer dígito).")
    total = 0
    for posicion, digito in enumerate(valor[:9]):
        producto = int(digito) * (2 if posicion % 2 == 0 else 1)
        total += producto - 9 if producto > 9 else producto
    if (10 - total % 10) % 10 != int(valor[9]):
        raise ValidationError("La cédula no es válida (dígito verificador).")
