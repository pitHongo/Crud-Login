<h1 align="center"> 🥊 FightMetrics </h1>

<p align="center">
  🌐 <a href="https://fightmetrics-udla-web.onrender.com"><b>Ver la demo en línea</b></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/STATUS-EN%20DESARROLLO-orange">
  <img src="https://img.shields.io/badge/VISTA-REACT-blue">
  <img src="https://img.shields.io/badge/CONTROLADOR-DJANGO-darkgreen">
  <img src="https://img.shields.io/badge/MODELO-SQLITE-lightblue">
</p>

## 📌 Índice
* [Descripción del Proyecto](#-descripción-del-proyecto)
* [Core: rendimiento de eventos](#-core-rendimiento-de-eventos)
* [Características de la aplicación](#-características-de-la-aplicación)
* [Roles y permisos](#-roles-y-permisos)
* [Patrón Arquitectónico MVC](#-patrón-arquitectónico-mvc)
* [Tecnologías Utilizadas](#-tecnologías-utilizadas)
* [Seguridad y Validaciones](#-seguridad-y-validaciones)
* [Estructura del proyecto](#-estructura-del-proyecto)
* [Acceso y Ejecución del Proyecto](#-acceso-y-ejecución-del-proyecto)
* [API del backend](#-api-del-backend)
* [Despliegue](#-despliegue)
* [Autores](#-autores)
* [Licencia](#-licencia)

## 📖 Descripción del Proyecto
**FightMetrics** es una aplicación web para analizar el **rendimiento de eventos de Artes Marciales Mixtas (MMA)** y ayudar a los **inversores** a decidir en qué eventos y recintos conviene invertir. Los organizadores registran eventos, asistencia y ventas; el sistema calcula la ocupación, los ingresos y compara el desempeño entre eventos y recintos. Además incluye la gestión de peleadores y gimnasios (CRUD). Todo está protegido con autenticación y estructurado bajo el patrón **MVC (Modelo-Vista-Controlador)**.

*Este proyecto es parte de la materia de Ingeniería Web de la UDLA.*

## 📊 Core: rendimiento de eventos
Solo los eventos en estado **Realizado** entran al análisis.

| Métrica | Cómo se calcula |
|---|---|
| **Ocupación** | `asistencia ÷ aforo del recinto × 100` |
| **Nivel de ocupación** | **Alta** ≥ 80 % · **Media** de 50 % a 79.9 % · **Baja** < 50 % |
| **Ingresos totales** | Suma de las ventas del evento (entradas + merchandising) |
| **Ingreso por asistente** | `ingresos totales ÷ asistencia` |
| **Diferencia vs. promedio** | Ocupación del evento menos la ocupación promedio del período, en puntos porcentuales (pp) |
| **Ranking de recintos** | Recintos ordenados por ocupación promedio de sus eventos |

- **Filtros:** fecha de inicio, fecha de fin, ciudad, recinto y evento (los selectores dependen entre sí).
- **Comparar:** permite elegir de **2 a 3 eventos** y ver sus métricas lado a lado.
- **Ventas:** cada venta se registra con *cantidad* y *precio por unidad*; el total se calcula solo (`cantidad × precio`). Las entradas vendidas no pueden superar el aforo del recinto.

## ⚙️ Características de la aplicación
- `Registro de usuarios:` cuenta con nombre, apellido, correo, celular, **cédula**, usuario, contraseña y rol (Organizador o Inversor).
- `Autenticación (Login):` acceso con el nombre de usuario o el correo electrónico.
- `Rendimiento y Comparar:` análisis del core descrito arriba, disponible para cualquier usuario con sesión.
- `Eventos:` crear eventos con **dropdowns en cascada** (Ciudad → Recinto), registrar asistencia y ventas, y marcarlos como Programado, Realizado o Cancelado.
- `Recintos:` nombre, ciudad y aforo (solo el Administrador los modifica).
- `Gimnasios:` gimnasios o clubes (nombre y ciudad) que alimentan el dropdown de peleadores.
- `Peleadores (CRUD):` inscribir (eligiendo el gimnasio de una lista), visualizar, cambiar el estado médico (Apto / Baja Médica) y retirar.
- `Rutas Protegidas:` guardián en el frontend y permisos por rol en el backend.

## 👥 Roles y permisos
| Rol | Qué puede hacer |
|---|---|
| **Administrador** | Todo: gestiona recintos, gimnasios, eventos, ventas y peleadores. Se crea desde el admin de Django (superusuario). |
| **Organizador** | Gestiona eventos, ventas, gimnasios y peleadores; consulta recintos, rendimiento y comparación. |
| **Inversor** | Solo consulta Rendimiento y Comparar. |

## 🧱 Patrón Arquitectónico MVC

La aplicación está diseñada siguiendo estricta separación de responsabilidades:

| Capa | Archivos principales | Qué hace |
|---|---|---|
| **Modelo (M)** | `backend/torneo/models.py` | Define las tablas SQLite y las reglas de los datos (Perfil, Gimnasio, Peleador, Recinto, Evento, Venta). |
| **Vista (V)** | `frontend/src/pages/` | La interfaz gráfica en React. Muestra los datos y captura las acciones del usuario. |
| **Controlador (C)** | `backend/torneo/views.py`, `servicios.py`, `permisos.py` | La lógica (API). Recibe peticiones, valida permisos, calcula las métricas y responde a la Vista. |

## 💻 Tecnologías Utilizadas
- **Frontend:** React + Vite, Vanilla CSS, React Router DOM.
- **Backend:** Python, Django, Django REST Framework, django-cors-headers.
- **Base de Datos:** SQLite.

## 🔐 Seguridad y Validaciones
- **Criptografía Fuerte:** las contraseñas **no** se guardan en texto plano. Django utiliza por defecto **PBKDF2 con SHA-256**, con iteraciones y un *Salt* único.
- **Autenticación por Token:** el frontend guarda un token de acceso en el `localStorage`; si el servidor responde `401`, la sesión se cierra automáticamente.
- **Doble Protección:** el componente `ProtectedRoute` bloquea accesos desde la interfaz y el backend devuelve `401 Unauthorized` o `403 Forbidden` según el rol.
- **Validación de datos sensibles en el Back-End** (`backend/torneo/validadores.py`): antes de guardar el registro, el servidor valida
  - la **cédula ecuatoriana** (10 dígitos, código de provincia válido y dígito verificador por módulo 10) y que no esté repetida,
  - el **celular** (10 dígitos, empieza con `09`),
  - el **correo electrónico** (formato válido y único).

  Si algo falla, el servidor responde `400` con el motivo y **no se guarda nada**. El frontend solo muestra el mensaje.
- **Reglas del core validadas en el servidor:** la asistencia no puede superar el aforo, las entradas vendidas no pueden superar el aforo, los precios y montos no pueden ser negativos.
- **Relaciones sin claves manuales:** los datos que apuntan a otra tabla se eligen en dropdowns (gimnasio de un peleador, recinto de un evento) y los filtros dependen entre sí (Ciudad → Recinto → Evento).

## 🗂️ Estructura del proyecto
```
ProyectoIngenieraWebReal/
├── backend/                      # Controlador + Modelo (Django)
│   ├── config/                   # Configuración del proyecto
│   └── torneo/
│       ├── models.py             # Tablas
│       ├── validadores.py        # Validaciones de cédula y celular
│       ├── serializers.py        # Modelo <-> JSON y reglas de negocio
│       ├── permisos.py           # Permisos por rol
│       ├── servicios.py          # Cálculo de métricas de rendimiento
│       ├── views.py              # Endpoints de la API
│       ├── urls.py               # Rutas de la API
│       ├── admin.py              # Panel de administración de Django
│       ├── migrations/           # Historial de la base de datos
│       └── management/commands/cargar_demo.py   # Datos de ejemplo
└── frontend/                     # Vista (React + Vite)
    └── src/
        ├── pages/                # Login, Registro, Rendimiento, Comparar, Eventos, Recintos, Gimnasios, Crud
        ├── components/           # Navbar, ProtectedRoute, EventoDetalle
        ├── api.js                # Llamadas a la API y manejo de sesión
        └── formato.js            # Formato de dinero, porcentajes y fechas
```

## 🚀 Acceso y Ejecución del Proyecto

Para ejecutar este proyecto en un entorno local (Windows), sigue estos pasos:

**Requisitos previos:** `Python 3.10+` y `Node.js 22+`.

---

### 1. Preparar el Backend (solo la primera vez)
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser      # crea tu usuario Administrador
python manage.py cargar_demo          # (opcional) gimnasios, recintos y eventos de ejemplo
```

### 2. Iniciar el Backend (Django)
```bash
cd backend
venv\Scripts\activate
python manage.py runserver
```

### 3. Iniciar el Frontend (React)
Abre una segunda terminal en la raíz del proyecto y ejecuta:
```bash
cd frontend
npm install        # solo la primera vez
npm run dev
```

### 4. Abrir la Aplicación
Dirígete a tu navegador y entra a: [http://localhost:5173/](http://localhost:5173/)

### 5. Datos de ejemplo
`python manage.py cargar_demo` crea 3 gimnasios, 3 recintos y 4 eventos Realizados (A, B, C y D). Con ellos el análisis completo da **4 eventos**, ocupación promedio de **70.1 %**, ingresos por **$780,800** e ingreso por asistente de **$19.87**.
Para crear usuarios Organizador o Inversor usa la pantalla de registro (la cédula debe ser válida, por ejemplo `1710034065`).

## 🔌 API del backend
Base: `http://localhost:8000/api/`. Todas las rutas (excepto registro y login) requieren el encabezado `Authorization: Token <token>`.

| Método y ruta | Descripción | Quién |
|---|---|---|
| `POST /registro/` | Crear cuenta (valida cédula, celular y correo) | Público |
| `POST /login/` | Iniciar sesión (usuario o correo); devuelve token y rol | Público |
| `GET /rendimiento/?desde=&hasta=&ciudad=&recinto=&evento=` | Resumen, detalle por evento y ranking de recintos | Cualquier usuario con sesión |
| `GET /comparar/?ids=1,2,3` | Compara de 2 a 3 eventos Realizados | Cualquier usuario con sesión |
| `/recintos/` | CRUD de recintos | Todos leen; escribe el Administrador |
| `/eventos/` | CRUD de eventos | Administrador y Organizador |
| `/ventas/?evento=<id>` | CRUD de ventas de un evento | Administrador y Organizador |
| `/gimnasios/` | CRUD de gimnasios | Administrador y Organizador |
| `/peleadores/` | CRUD de peleadores | Usuarios con sesión |

## ☁️ Despliegue
La aplicación está desplegada en [Render](https://render.com) y se describe en el archivo `render.yaml` de la raíz (infraestructura como código):

| Servicio | Tecnología | Dirección |
|---|---|---|
| **Frontend** | React + Vite (sitio estático) | https://fightmetrics-udla-web.onrender.com |
| **Backend (API)** | Django + gunicorn | https://fightmetrics-udla-api.onrender.com |
| **Base de datos** | PostgreSQL | `fightmetrics-db` (interna de Render) |

- **Cómo se despliega:** Render está conectado a este repositorio; cada `git push` a la rama `main` vuelve a desplegar automáticamente. El script `backend/build.sh` instala las dependencias, recolecta los estáticos, aplica las migraciones, carga los datos de ejemplo y crea el usuario Administrador.
- **Configuración por variables de entorno:** `SECRET_KEY`, `DEBUG`, `DATABASE_URL`, `CORS_ORIGINS` (backend) y `VITE_API_URL` (frontend). En local no hacen falta: sin ellas el proyecto usa SQLite y `localhost`.
- **Plan gratuito:** el backend se duerme tras 15 minutos sin uso, por lo que la primera carga puede tardar cerca de 1 minuto. La base de datos gratuita de Render expira a los 30 días de su creación.

## 👤 Autores
| [<img src="https://avatars.githubusercontent.com/u/9919?s=200&v=4" width=115><br><sub>Matias Flores</sub>](https://github.com/pitHongo) |
| :---: |
| **Estudiante de Ingeniería Web, UDLA** |

## 📄 Licencia
Este proyecto es de código abierto bajo licencia MIT (uso puramente académico).
