# Convierte el modelo a JSON (y al revés) y valida los datos que llegan.
from rest_framework import serializers
from .models import Peleador


class PeleadorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Peleador
        fields = ["id", "nombre", "gimnasio", "apto_medico"]

    def validate_nombre(self, valor):
        if not valor.strip():
            raise serializers.ValidationError("El nombre es obligatorio.")
        return valor.strip()

    def validate_gimnasio(self, valor):
        if not valor.strip():
            raise serializers.ValidationError("El gimnasio es obligatorio.")
        return valor.strip()
