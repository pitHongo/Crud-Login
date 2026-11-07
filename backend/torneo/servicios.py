# Cálculos del core (rendimiento de eventos). Son funciones simples, sin HTTP:
# la vista recibe la petición, llama a estas funciones y responde.
from collections import defaultdict
from decimal import Decimal

from .models import Evento, Venta

# Niveles de ocupación (%): Alta >= 80, Media 50 a 79.9, Baja < 50
OCUPACION_ALTA = 80
OCUPACION_MEDIA = 50


def nivel_ocupacion(ocupacion):
    if ocupacion >= OCUPACION_ALTA:
        return "Alta"
    if ocupacion >= OCUPACION_MEDIA:
        return "Media"
    return "Baja"


def _eventos_realizados(desde=None, hasta=None, ciudad=None, recinto_id=None, evento_id=None):
    """Solo los eventos 'Realizado' entran al análisis, con los filtros opcionales."""
    eventos = (Evento.objects.filter(estado=Evento.REALIZADO)
               .select_related("recinto").prefetch_related("ventas"))
    if desde:
        eventos = eventos.filter(fecha__gte=desde)
    if hasta:
        eventos = eventos.filter(fecha__lte=hasta)
    if ciudad:
        eventos = eventos.filter(recinto__ciudad__iexact=ciudad)
    if recinto_id:
        eventos = eventos.filter(recinto_id=recinto_id)
    if evento_id:
        eventos = eventos.filter(id=evento_id)
    return eventos


def _metricas_evento(evento):
    """Números sin redondear de un evento: ocupación e ingresos."""
    ventas = evento.ventas.all()
    entradas = sum((v.monto for v in ventas if v.tipo == Venta.ENTRADA), Decimal(0))
    merch = sum((v.monto for v in ventas if v.tipo == Venta.MERCHANDISING), Decimal(0))
    ingresos = entradas + merch
    return {
        "id": evento.id, "nombre": evento.nombre, "fecha": evento.fecha,
        "recinto_id": evento.recinto_id, "recinto": evento.recinto.nombre,
        "ciudad": evento.recinto.ciudad,
        "asistencia": evento.asistencia, "aforo": evento.recinto.aforo,
        "ocupacion": evento.asistencia / evento.recinto.aforo * 100,
        "ingresos_entradas": entradas, "ingresos_merch": merch, "ingresos_totales": ingresos,
    }


def _presentar(m):
    """Redondea un evento para mostrarlo y le agrega su nivel."""
    asistencia = m["asistencia"]
    return {
        "id": m["id"], "nombre": m["nombre"], "fecha": m["fecha"],
        "recinto": m["recinto"], "ciudad": m["ciudad"],
        "asistencia": asistencia, "aforo": m["aforo"],
        "ocupacion": round(m["ocupacion"], 1),
        "nivel": nivel_ocupacion(m["ocupacion"]),
        "ingresos_entradas": float(m["ingresos_entradas"]),
        "ingresos_merch": float(m["ingresos_merch"]),
        "ingresos_totales": float(m["ingresos_totales"]),
        "ingreso_por_asistente": round(float(m["ingresos_totales"]) / asistencia, 2) if asistencia else 0,
    }


def rendimiento(desde=None, hasta=None, ciudad=None, recinto_id=None, evento_id=None):
    """Resumen, detalle por evento (con diferencia vs promedio) y ranking de recintos."""
    metricas = [_metricas_evento(e) for e in _eventos_realizados(desde, hasta, ciudad, recinto_id, evento_id)]
    if not metricas:
        return {"resumen": {"eventos_analizados": 0, "ocupacion_promedio": 0,
                            "ingresos_totales": 0, "ingreso_por_asistente": 0},
                "eventos": [], "ranking_recintos": []}

    promedio = sum(m["ocupacion"] for m in metricas) / len(metricas)
    ingresos = sum(m["ingresos_totales"] for m in metricas)
    asistentes = sum(m["asistencia"] for m in metricas)

    eventos = []
    for m in sorted(metricas, key=lambda m: m["ocupacion"], reverse=True):
        evento = _presentar(m)
        evento["diferencia_vs_promedio"] = round(m["ocupacion"] - promedio, 1)  # puntos porcentuales
        eventos.append(evento)

    por_recinto = defaultdict(list)
    for m in metricas:
        por_recinto[m["recinto_id"]].append(m)
    ranking = [{
        "recinto": lista[0]["recinto"], "ciudad": lista[0]["ciudad"], "eventos": len(lista),
        "ocupacion_promedio": round(sum(m["ocupacion"] for m in lista) / len(lista), 1),
        "ingresos_totales": float(sum(m["ingresos_totales"] for m in lista)),
    } for lista in por_recinto.values()]
    ranking.sort(key=lambda r: r["ocupacion_promedio"], reverse=True)

    return {
        "resumen": {
            "eventos_analizados": len(metricas),
            "ocupacion_promedio": round(promedio, 1),
            "ingresos_totales": float(ingresos),
            "ingreso_por_asistente": round(float(ingresos) / asistentes, 2) if asistentes else 0,
        },
        "eventos": eventos,
        "ranking_recintos": ranking,
    }


def comparar(ids):
    """Métricas de los eventos 'Realizado' pedidos, en el mismo orden de los ids."""
    por_id = {e.id: e for e in _eventos_realizados().filter(id__in=ids)}
    return [_presentar(_metricas_evento(por_id[i])) for i in ids if i in por_id]
