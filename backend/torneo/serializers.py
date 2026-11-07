# Convierte el modelo a JSON y al revés.
from django.db.models import Sum
from rest_framework import serializers
from .models import Evento, Gimnasio, Peleador, Recinto, Venta


class GimnasioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gimnasio
        fields = ["id", "nombre", "ciudad"]


class PeleadorSerializer(serializers.ModelSerializer):
    gimnasio_nombre = serializers.CharField(source="gimnasio.nombre", read_only=True)

    class Meta:
        model = Peleador
        fields = ["id", "nombre", "gimnasio", "gimnasio_nombre", "apto_medico"]


# ---------- CORE: rendimiento de eventos ----------
class RecintoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recinto
        fields = ["id", "nombre", "ciudad", "aforo"]


class EventoSerializer(serializers.ModelSerializer):
    recinto_nombre = serializers.CharField(source="recinto.nombre", read_only=True)

    class Meta:
        model = Evento
        fields = ["id", "nombre", "fecha", "recinto", "recinto_nombre", "estado", "asistencia"]

    # Regla: la asistencia no puede superar el aforo del recinto.
    def validate(self, datos):
        recinto = datos.get("recinto", getattr(self.instance, "recinto", None))
        asistencia = datos.get("asistencia", getattr(self.instance, "asistencia", 0))
        if recinto and asistencia > recinto.aforo:
            raise serializers.ValidationError(
                {"asistencia": f"No puede superar el aforo del recinto ({recinto.aforo})."})
        return datos


# Venta: la API recibe el precio por unidad y calcula el monto total (cantidad × precio).
class VentaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venta
        fields = ["id", "evento", "tipo", "descripcion", "cantidad", "precio_unitario", "monto"]
        read_only_fields = ["monto"]
        extra_kwargs = {"precio_unitario": {"required": True, "allow_null": False}}

    def validate(self, datos):
        actual = self.instance
        evento = datos.get("evento", getattr(actual, "evento", None))
        tipo = datos.get("tipo", getattr(actual, "tipo", None))
        cantidad = datos.get("cantidad", getattr(actual, "cantidad", 0))
        precio = datos.get("precio_unitario", getattr(actual, "precio_unitario", None))

        # El total debe caber en el campo monto (hasta 99,999,999.99).
        if precio is not None and cantidad * precio > 99999999.99:
            raise serializers.ValidationError({"precio_unitario": "El total de la venta es demasiado grande."})

        # Regla: las entradas vendidas de un evento no pueden superar el aforo del recinto.
        if tipo == Venta.ENTRADA and evento:
            otras = evento.ventas.filter(tipo=Venta.ENTRADA).exclude(pk=getattr(actual, "pk", None))
            disponibles = evento.recinto.aforo - (otras.aggregate(total=Sum("cantidad"))["total"] or 0)
            if cantidad > disponibles:
                raise serializers.ValidationError({"cantidad": (
                    f"Con esta venta superas el aforo del recinto ({evento.recinto.aforo}): "
                    f"quedan {max(disponibles, 0)} entradas disponibles.")})
        return datos
