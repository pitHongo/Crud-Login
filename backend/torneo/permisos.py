# Permisos por rol (parte del CONTROLADOR): quién puede hacer qué.
from rest_framework.permissions import SAFE_METHODS, BasePermission

from .models import Perfil


def rol_de(user):
    """Devuelve el rol del usuario. Un superusuario de Django cuenta como Administrador."""
    if user.is_superuser:
        return Perfil.ADMINISTRADOR
    perfil = getattr(user, "perfil", None)
    return perfil.rol if perfil else None


# Eventos y ventas: los gestionan el Administrador y el Organizador.
class AdministradorOOrganizador(BasePermission):
    def has_permission(self, request, view):
        return rol_de(request.user) in (Perfil.ADMINISTRADOR, Perfil.ORGANIZADOR)


# Recintos: todos los usuarios con sesión los pueden consultar,
# pero solo el Administrador los crea, edita o elimina.
class LeenTodosEscribeAdministrador(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user.is_authenticated
        return rol_de(request.user) == Perfil.ADMINISTRADOR
