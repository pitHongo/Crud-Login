# CONTROLADOR (C): igual que tu controlador.py, recibe la petición,
# usa el modelo y responde.
from django.contrib.auth import authenticate
from rest_framework import viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Peleador
from .serializers import PeleadorSerializer


# CRUD completo (crear, leer, actualizar, eliminar) con una sola clase.
# Está protegido: sin token responde 401 (ver settings.py).
class PeleadorViewSet(viewsets.ModelViewSet):
    queryset = Peleador.objects.all().order_by("id")
    serializer_class = PeleadorSerializer


# LOGIN: única ruta pública.
@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def login(request):
    # authenticate compara la clave escrita contra el hash guardado en la BD
    user = authenticate(username=request.data.get("username"),
                        password=request.data.get("password"))
    if user is None:
        return Response({"detail": "Usuario o contraseña incorrectos."}, status=401)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({"token": token.key, "username": user.username})
