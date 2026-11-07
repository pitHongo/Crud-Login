from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("peleadores", views.PeleadorViewSet, basename="peleador")
router.register("gimnasios", views.GimnasioViewSet, basename="gimnasio")
router.register("recintos", views.RecintoViewSet, basename="recinto")
router.register("eventos", views.EventoViewSet, basename="evento")
router.register("ventas", views.VentaViewSet, basename="venta")

urlpatterns = [
    path("registro/", views.registro),
    path("login/", views.login),
    path("rendimiento/", views.rendimiento),
    path("comparar/", views.comparar),
    path("", include(router.urls)),
]
