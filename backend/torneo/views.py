# CONTROLADOR (C): recibe la petición, usa el modelo y responde.
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db.models import ProtectedError
from django.utils.dateparse import parse_date
from rest_framework import viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from . import servicios
from .models import Evento, Gimnasio, Peleador, Perfil, Recinto, Venta
from .permisos import AdministradorOOrganizador, LeenTodosEscribeAdministrador, rol_de
from .serializers import (EventoSerializer, GimnasioSerializer, PeleadorSerializer,
                          RecintoSerializer, VentaSerializer)


# CRUD completo. Protegido: sin token responde 401 (ver settings.py).
class PeleadorViewSet(viewsets.ModelViewSet):
    queryset = Peleador.objects.select_related("gimnasio").order_by("id")
    serializer_class = PeleadorSerializer


# Gimnasios (alimentan el dropdown de Peleadores): los gestionan el Administrador y el Organizador.
class GimnasioViewSet(viewsets.ModelViewSet):
    queryset = Gimnasio.objects.all().order_by("nombre")
    serializer_class = GimnasioSerializer
    permission_classes = [AdministradorOOrganizador]

    # Un gimnasio con peleadores no se puede borrar (error claro, no un 500).
    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response({"detail": "No se puede eliminar un gimnasio que tiene peleadores."}, status=400)


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
    cedula   = (datos.get("cedula")   or "").strip()
    usuario  = (datos.get("usuario")  or "").strip()
    clave    = datos.get("clave") or ""
    rol      = (datos.get("rol") or Perfil.INVERSOR).strip()

    # 1) Todos los campos son obligatorios
    if not all([nombre, apellido, correo, celular, cedula, usuario, clave]):
        return Response({"detail": "Todos los campos son obligatorios."}, status=400)

    # 2) Contraseña de al menos 8 caracteres
    if len(clave) < 8:
        return Response({"detail": "La contraseña debe tener al menos 8 caracteres."}, status=400)

    # 3) El rol solo puede ser Organizador o Inversor (el Administrador se crea desde el admin de Django)
    if rol not in (Perfil.ORGANIZADOR, Perfil.INVERSOR):
        return Response({"detail": "El rol debe ser Organizador o Inversor."}, status=400)

    # 4) El nombre de usuario no se puede repetir (único)
    if User.objects.filter(username__iexact=usuario).exists():
        return Response({"detail": "Ese nombre de usuario ya existe."}, status=400)

    # 5) El correo tampoco se puede repetir (único)
    if User.objects.filter(email__iexact=correo).exists():
        return Response({"detail": "Ese correo ya está registrado."}, status=400)

    # 6) Datos sensibles (correo, celular, cédula): se validan aquí, en el servidor, antes de guardar.
    try:
        validate_email(correo)
        Perfil(celular=celular, cedula=cedula, rol=rol).full_clean(exclude=["user"])
    except ValidationError as error:
        return Response({"detail": error.messages[0]}, status=400)

    # Crear el usuario. create_user guarda la contraseña ENCRIPTADA (hash PBKDF2).
    user = User.objects.create_user(
        username=usuario, email=correo, password=clave,
        first_name=nombre, last_name=apellido,
    )
    Perfil.objects.create(user=user, celular=celular, cedula=cedula, rol=rol)

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
    return Response({"token": token.key, "username": user.username, "rol": rol_de(user)})


# =====================================================
# CORE: rendimiento de eventos
# =====================================================

# Recintos: todos los leen, solo el Administrador los gestiona.
class RecintoViewSet(viewsets.ModelViewSet):
    queryset = Recinto.objects.all().order_by("nombre")
    serializer_class = RecintoSerializer
    permission_classes = [LeenTodosEscribeAdministrador]

    # Un recinto con eventos no se puede borrar (devolvemos un error claro, no un 500).
    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response({"detail": "No se puede eliminar un recinto que tiene eventos."}, status=400)


# Eventos: los gestionan el Administrador y el Organizador.
class EventoViewSet(viewsets.ModelViewSet):
    queryset = Evento.objects.select_related("recinto").order_by("-fecha")
    serializer_class = EventoSerializer
    permission_classes = [AdministradorOOrganizador]


# Ventas de un evento (opcional: /api/ventas/?evento=3).
class VentaViewSet(viewsets.ModelViewSet):
    serializer_class = VentaSerializer
    permission_classes = [AdministradorOOrganizador]

    def get_queryset(self):
        ventas = Venta.objects.order_by("id")
        evento = self.request.query_params.get("evento")
        return ventas.filter(evento_id=evento) if evento and evento.isdigit() else ventas


def _fecha(texto):
    """Convierte 'AAAA-MM-DD' en fecha; devuelve None si no es válida."""
    try:
        return parse_date(texto or "")
    except ValueError:
        return None


# GET /api/rendimiento/?desde=&hasta=&ciudad=&recinto=&evento=   (cualquier usuario con sesión)
@api_view(["GET"])
def rendimiento(request):
    p = request.query_params
    desde, hasta = _fecha(p.get("desde")), _fecha(p.get("hasta"))
    if (p.get("desde") and not desde) or (p.get("hasta") and not hasta):
        return Response({"detail": "Las fechas deben tener el formato AAAA-MM-DD."}, status=400)
    if desde and hasta and desde > hasta:
        return Response({"detail": "La fecha inicial no puede ser mayor a la final."}, status=400)
    recinto = p.get("recinto")
    if recinto and not recinto.isdigit():
        return Response({"detail": "El recinto debe ser un número (id)."}, status=400)
    evento = p.get("evento")
    if evento and not evento.isdigit():
        return Response({"detail": "El evento debe ser un número (id)."}, status=400)
    return Response(servicios.rendimiento(desde, hasta, p.get("ciudad"), recinto, evento))


# GET /api/comparar/?ids=1,2,3   (de 2 a 3 eventos Realizados)
@api_view(["GET"])
def comparar(request):
    ids = [int(i) for i in (request.query_params.get("ids") or "").split(",") if i.strip().isdigit()]
    ids = list(dict.fromkeys(ids))  # sin repetidos
    if not 2 <= len(ids) <= 3:
        return Response({"detail": "Elige de 2 a 3 eventos para comparar."}, status=400)
    eventos = servicios.comparar(ids)
    if len(eventos) != len(ids):
        return Response({"detail": "Todos los eventos deben existir y estar Realizados."}, status=400)
    return Response(eventos)
