# CONTROLADOR (C): recibe la petición, usa el modelo y responde.
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Peleador, Perfil
from .serializers import PeleadorSerializer


# CRUD completo. Protegido: sin token responde 401 (ver settings.py).
class PeleadorViewSet(viewsets.ModelViewSet):
    queryset = Peleador.objects.all().order_by("id")
    serializer_class = PeleadorSerializer


# ---------- REGISTRO (crear cuenta) ----------
@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])   # ruta pública: aún no hay sesión
def registro(request):
    datos = request.data
    nombre   = (datos.get("nombre")   or "").strip()
    apellido = (datos.get("apellido") or "").strip()
    correo   = (datos.get("correo")   or "").strip()
    celular  = (datos.get("celular")  or "").strip()
    usuario  = (datos.get("usuario")  or "").strip()
    clave    = datos.get("clave") or ""

    # 1) Todos los campos son obligatorios
    if not all([nombre, apellido, correo, celular, usuario, clave]):
        return Response({"detail": "Todos los campos son obligatorios."}, status=400)

    # 2) Contraseña de al menos 8 caracteres
    if len(clave) < 8:
        return Response({"detail": "La contraseña debe tener al menos 8 caracteres."}, status=400)

    # 3) El nombre de usuario no se puede repetir (único)
    if User.objects.filter(username__iexact=usuario).exists():
        return Response({"detail": "Ese nombre de usuario ya existe."}, status=400)

    # 4) El correo tampoco se puede repetir (único)
    if User.objects.filter(email__iexact=correo).exists():
        return Response({"detail": "Ese correo ya está registrado."}, status=400)

    # Crear el usuario. create_user guarda la contraseña ENCRIPTADA (hash PBKDF2).
    user = User.objects.create_user(
        username=usuario, email=correo, password=clave,
        first_name=nombre, last_name=apellido,
    )
    Perfil.objects.create(user=user, celular=celular)

    return Response({"detail": "Cuenta creada. Ahora puedes iniciar sesión."}, status=201)


# ---------- LOGIN (acepta usuario O correo) ----------
@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def login(request):
    ingresado = (request.data.get("username") or "").strip()
    clave = request.data.get("password") or ""

    # Si escribió un correo, buscamos a qué usuario pertenece
    # para iniciar sesión con su nombre de usuario real.
    if "@" in ingresado:
        encontrado = User.objects.filter(email__iexact=ingresado).first()
        ingresado = encontrado.username if encontrado else ingresado

    # authenticate compara la clave escrita contra el hash guardado en la BD.
    user = authenticate(username=ingresado, password=clave)
    if user is None:
        return Response({"detail": "Usuario o contraseña incorrectos."}, status=401)

    token, _ = Token.objects.get_or_create(user=user)
    return Response({"token": token.key, "username": user.username})
