# MODELO (M): define las tablas de la base de datos.
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from django.db import models

from .validadores import validar_cedula, validar_celular


# Gimnasio o club al que pertenece un peleador.
class Gimnasio(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    ciudad = models.CharField(max_length=60)

    def __str__(self):
        return f"{self.nombre} ({self.ciudad})"


# Peleador del torneo (el CRUD). El gimnasio se elige de la tabla Gimnasio (no se escribe a mano).
class Peleador(models.Model):
    nombre = models.CharField(max_length=100)
    gimnasio = models.ForeignKey(Gimnasio, on_delete=models.PROTECT, related_name="peleadores")
    apto_medico = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.nombre} ({self.gimnasio})"


# Datos extra de cada usuario registrado.
# El User de Django ya guarda usuario, correo, nombre, apellido y la contraseña (encriptada).
# Aquí solo añadimos el celular, la cédula (que Django no trae por defecto) y el rol dentro de la plataforma.
class Perfil(models.Model):
    ADMINISTRADOR = "administrador"
    ORGANIZADOR = "organizador"
    INVERSOR = "inversor"
    ROLES = [
        (ADMINISTRADOR, "Administrador"),
        (ORGANIZADOR, "Organizador"),
        (INVERSOR, "Inversor"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    celular = models.CharField(max_length=20, validators=[validar_celular])
    # Opcional en la BD solo para las cuentas antiguas; el registro siempre la exige.
    cedula = models.CharField(max_length=10, unique=True, null=True, blank=True, validators=[validar_cedula],
                              error_messages={"unique": "Esa cédula ya está registrada."})
    rol = models.CharField(max_length=15, choices=ROLES, default=INVERSOR)

    def __str__(self):
        return f"Perfil de {self.user.username}"


# =====================================================
# CORE: rendimiento de eventos (para inversores)
# =====================================================

# Lugar donde se realizan los eventos. El aforo es la capacidad máxima de personas.
class Recinto(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    ciudad = models.CharField(max_length=60)
    aforo = models.PositiveIntegerField(validators=[MinValueValidator(1)])

    def __str__(self):
        return f"{self.nombre} ({self.ciudad})"


# Evento de MMA. Solo los eventos "Realizado" entran al análisis de rendimiento.
class Evento(models.Model):
    PROGRAMADO = "programado"
    REALIZADO = "realizado"
    CANCELADO = "cancelado"
    ESTADOS = [
        (PROGRAMADO, "Programado"),
        (REALIZADO, "Realizado"),
        (CANCELADO, "Cancelado"),
    ]

    nombre = models.CharField(max_length=120)
    fecha = models.DateField()
    recinto = models.ForeignKey(Recinto, on_delete=models.PROTECT, related_name="eventos")
    estado = models.CharField(max_length=12, choices=ESTADOS, default=PROGRAMADO)
    asistencia = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.nombre} - {self.fecha}"


# Ingreso de un evento: venta de entradas o de merchandising.
class Venta(models.Model):
    ENTRADA = "entrada"
    MERCHANDISING = "merchandising"
    TIPOS = [
        (ENTRADA, "Entrada"),
        (MERCHANDISING, "Merchandising"),
    ]

    evento = models.ForeignKey(Evento, on_delete=models.CASCADE, related_name="ventas")
    tipo = models.CharField(max_length=15, choices=TIPOS)
    descripcion = models.CharField(max_length=100, blank=True)
    cantidad = models.PositiveIntegerField(default=1)
    # Precio de cada unidad (entrada o artículo). Vacío solo en las ventas antiguas, que traían el monto total.
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True,
                                          validators=[MinValueValidator(0)])
    # Total de la línea. Si hay precio_unitario se calcula solo al guardar: cantidad × precio.
    monto = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])

    def save(self, *args, **kwargs):
        if self.precio_unitario is not None:
            self.monto = self.cantidad * self.precio_unitario
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.get_tipo_display()} - {self.monto} ({self.evento})"
