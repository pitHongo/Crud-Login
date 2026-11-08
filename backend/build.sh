#!/usr/bin/env bash
# Script de construcción para Render: se ejecuta en cada despliegue.
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate
python manage.py cargar_demo        # gimnasios, recintos y eventos de ejemplo (no duplica datos)

# Crea el Administrador con las variables DJANGO_SUPERUSER_*; si ya existe, no pasa nada.
python manage.py createsuperuser --noinput || echo "El administrador ya existe."
