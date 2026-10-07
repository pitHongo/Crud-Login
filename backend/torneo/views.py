# CONTROLADOR (C): recibe la petición, usa el modelo y responde.
# Equivale a tu controlador.py (en Django estas funciones se llaman "views").
from django.contrib.auth import authenticate
from rest_framework import viewsets, status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Peleador
from .serializers import PeleadorSerializer


class PeleadorViewSet(viewsets.ModelViewSet):
    """CRUD completo con una sola clase:
       POST   /api/peleadores/       -> Crear
       GET    /api/peleadores/       -> Leer
       PATCH  /api/peleadores/{id}/  -> Actualizar (ej. estado médico)
       DELETE /api/peleadores/{id}/  -> Eliminar
    Sin token válido responde 401 (viene protegido por configuración)."""
    queryset = Peleador.objects.all().order_by("id")
    serializer_class = PeleadorSerializer


@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])   # el login es la única ruta pública
def login_view(request):
    usuario = request.data.get("username", "")
    clave = request.data.get("password", "")

    # authenticate compara la clave escrita contra el hash guardado en la BD.
    user = authenticate(username=usuario, password=clave)
    if user is None:
        return Response({"detail": "Usuario o contraseña incorrectos."},
                        status=status.HTTP_401_UNAUTHORIZED)

    token, _ = Token.objects.get_or_create(user=user)
    return Response({"token": token.key, "username": user.username})


@api_view(["POST"])
def logout_view(request):
    # Borra el token en el servidor: queda inservible.
    Token.objects.filter(user=request.user).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
