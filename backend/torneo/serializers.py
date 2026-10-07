# Convierte el modelo a JSON y al revés.
from rest_framework import serializers
from .models import Peleador


class PeleadorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Peleador
        fields = ["id", "nombre", "gimnasio", "apto_medico"]
