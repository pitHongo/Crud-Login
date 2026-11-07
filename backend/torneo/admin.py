from django.contrib import admin
from .models import Evento, Gimnasio, Peleador, Perfil, Recinto, Venta

@admin.register(Gimnasio)
class GimnasioAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'ciudad')
    list_filter = ('ciudad',)
    search_fields = ('nombre', 'ciudad')

@admin.register(Peleador)
class PeleadorAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'gimnasio', 'apto_medico')
    list_filter = ('apto_medico', 'gimnasio')
    search_fields = ('nombre', 'gimnasio__nombre')

@admin.register(Perfil)
class PerfilAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'cedula', 'celular', 'rol')
    list_filter = ('rol',)
    search_fields = ('user__username', 'user__email', 'cedula', 'celular')

@admin.register(Recinto)
class RecintoAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'ciudad', 'aforo')
    list_filter = ('ciudad',)
    search_fields = ('nombre', 'ciudad')

class VentaInline(admin.TabularInline):
    model = Venta
    extra = 0

@admin.register(Evento)
class EventoAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'fecha', 'recinto', 'estado', 'asistencia')
    list_filter = ('estado', 'recinto')
    search_fields = ('nombre',)
    inlines = [VentaInline]
