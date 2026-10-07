# MODELO (M): igual que tu clase Peleador de modelo.py,
# pero Django la convierte en una tabla de la base de datos.
from django.db import models


class Peleador(models.Model):
    nombre = models.CharField(max_length=100)
    gimnasio = models.CharField(max_length=100)
    apto_medico = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.nombre} ({self.gimnasio})"
