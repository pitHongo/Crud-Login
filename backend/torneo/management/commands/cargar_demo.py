# Comando: python manage.py cargar_demo
# Carga los gimnasios, recintos y eventos de ejemplo (A-D) del documento de especificación.
# Se puede ejecutar varias veces: no duplica datos.
from datetime import date
from decimal import Decimal

from django.core.management.base import BaseCommand

from torneo.models import Evento, Gimnasio, Recinto, Venta

GIMNASIOS = [("Alpha MMA", "Quito"), ("Costa Fight Club", "Guayaquil"), ("Andes Combat", "Cuenca")]
RECINTOS = [("Recinto 1", "Quito", 20000), ("Recinto 2", "Guayaquil", 8000), ("Recinto 3", "Cuenca", 5000)]

# (nombre, fecha, recinto, asistencia, ventas); cada venta es (tipo, descripción, cantidad, monto)
EVENTOS = [
    ("Evento A", date(2026, 9, 5), "Recinto 1", 18000, [
        (Venta.ENTRADA, "General", 15000, "225000"),
        (Venta.ENTRADA, "VIP", 3000, "135000"),
        (Venta.MERCHANDISING, "Camisetas", 800, "16000")]),
    ("Evento B", date(2026, 9, 12), "Recinto 2", 3400, [
        (Venta.ENTRADA, "General", 3400, "55200"),
        (Venta.MERCHANDISING, "Camisetas", 300, "6000")]),
    ("Evento C", date(2026, 9, 19), "Recinto 3", 3900, [
        (Venta.ENTRADA, "General", 3900, "85000"),
        (Venta.MERCHANDISING, "Camisetas", 400, "8600")]),
    ("Evento D", date(2026, 9, 26), "Recinto 1", 14000, [
        (Venta.ENTRADA, "General", 14000, "235000"),
        (Venta.MERCHANDISING, "Camisetas", 600, "15000")]),
]


class Command(BaseCommand):
    help = "Carga gimnasios, recintos, eventos y ventas de ejemplo (Evento A a D)."

    def handle(self, *args, **opciones):
        for nombre, ciudad in GIMNASIOS:
            Gimnasio.objects.update_or_create(nombre=nombre, defaults={"ciudad": ciudad})

        recintos = {}
        for nombre, ciudad, aforo in RECINTOS:
            recintos[nombre], _ = Recinto.objects.update_or_create(
                nombre=nombre, defaults={"ciudad": ciudad, "aforo": aforo})

        for nombre, fecha, recinto, asistencia, ventas in EVENTOS:
            evento, _ = Evento.objects.update_or_create(
                nombre=nombre, fecha=fecha,
                defaults={"recinto": recintos[recinto], "estado": Evento.REALIZADO, "asistencia": asistencia})
            evento.ventas.all().delete()  # así volver a correr el comando no duplica ventas
            for tipo, descripcion, cantidad, monto in ventas:
                Venta.objects.create(evento=evento, tipo=tipo, descripcion=descripcion,
                                     cantidad=cantidad, monto=Decimal(monto))

        self.stdout.write(self.style.SUCCESS("Datos de ejemplo cargados: 3 gimnasios, 3 recintos y 4 eventos Realizados."))
