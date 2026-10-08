# MODELO (M): define las tablas de la base de datos.
from django.contrib.auth.models import User
from django.db import models


# Peleador del torneo (el CRUD).
class Peleador(models.Model):
    nombre = models.CharField(max_length=100)
    gimnasio = models.CharField(max_length=100)
    apto_medico = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.nombre} ({self.gimnasio})"


# Datos extra de cada usuario registrado.
# El User de Django ya guarda usuario, correo, nombre, apellido y la contraseña (encriptada).
# Aquí solo añadimos el celular, que Django no trae por defecto.
class Perfil(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    celular = models.CharField(max_length=20)

    def __str__(self):
        return f"Perfil de {self.user.username}"
