# 🥊 Gestor de Torneo MMA — CRUD + Login (MVC)

Aplicación web básica que aplica el patrón **MVC** con las operaciones **CRUD** (crear, leer, actualizar, eliminar) sobre peleadores de un torneo, protegida por un **sistema de login** con usuario y contraseña.

- **Backend:** Django + Django REST Framework
- **Frontend:** React 18 (Vite)
- **Base de datos:** SQLite
- **Proyecto de la materia:** Ingeniería Web — UDLA

## ✨ Funcionalidades

- Registro de cuenta: nombre, apellido, correo, celular, usuario y contraseña (mínimo 8 caracteres). Usuario y correo son únicos.
- Inicio de sesión con **usuario o correo** y contraseña.
- Sección protegida con el CRUD de peleadores:
  - **Create:** inscribir un peleador (nombre y gimnasio).
  - **Read:** ver la lista oficial de competidores.
  - **Update:** cambiar el estado médico (Apto / Baja médica).
  - **Delete:** retirar un peleador del torneo.
- Las URLs protegidas **no son accesibles sin autenticación**:
  - En Django, `/api/peleadores/` responde **401 Unauthorized** sin token.
  - En React, la pantalla del CRUD solo se muestra si hay sesión iniciada.
- Contraseñas guardadas **encriptadas (hash PBKDF2-SHA256)**, nunca en texto plano.
- Cierre de sesión.

## 🧱 Patrón MVC

| Capa | Archivo | Qué hace |
|---|---|---|
| **Modelo** | `backend/torneo/models.py` | Define la tabla `Peleador` y sus datos |
| **Controlador** | `backend/torneo/views.py` | Recibe las peticiones, usa el modelo y responde |
| **Vista** | `frontend/src/app/app.ts` | Pantalla de login y pantalla del CRUD (React) |

```
React (Vista) ──HTTP + Token──▶ Django (Controlador) ──▶ SQLite (Modelo)
```

## 📁 Estructura

```
ProyectoIngenieraWeb/
├── backend/
│   ├── config/            # configuración de Django
│   └── torneo/            # models.py, views.py, serializers.py, urls.py
├── frontend/
│   └── src/app/app.ts     # login + CRUD en un solo componente
└── README.md
```

## 🚀 Cómo ejecutarlo (Windows)

**Requisitos:** Python 3.10+, Node.js 22+.

### 1. Backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser     # este será el usuario para iniciar sesión
python manage.py runserver
```

Queda en `http://localhost:8000`.

### 2. Frontend (otra terminal)

```powershell
cd frontend
npm install
npm run dev
```

Queda en `http://localhost:5173`. Entra con el usuario que creaste.

## 🔌 API

| Método | URL | Protegida | Acción |
|---|---|---|---|
| POST | `/api/registro/` | No | Crea una cuenta |
| POST | `/api/login/` | No | Devuelve un token (acepta usuario o correo) |
| GET | `/api/peleadores/` | Sí | Leer |
| POST | `/api/peleadores/` | Sí | Crear |
| PATCH | `/api/peleadores/{id}/` | Sí | Actualizar |
| DELETE | `/api/peleadores/{id}/` | Sí | Eliminar |

Las rutas protegidas necesitan el header `Authorization: Token <token>`.

## 🔐 Seguridad

- **Encriptación de contraseñas:** Django guarda un hash **PBKDF2-SHA256** con sal. Es más seguro que MD5, que es rápido de romper. Se puede ver en `http://localhost:8000/admin/` → Users: la contraseña empieza con `pbkdf2_sha256$...`.
- **Rutas protegidas:** `settings.py` exige autenticación por defecto en toda la API (`IsAuthenticated`); solo el login es público.
- **Prueba sin sesión:**

```powershell
curl.exe -i http://localhost:8000/api/peleadores/
# HTTP/1.1 401 Unauthorized
```

## 🎬 Video de demostración

(Pega aquí el enlace de Loom o YouTube)

Contenido: funcionamiento del login, intento de acceso a `/peleadores` sin sesión, demostración del CRUD y contraseña encriptada en `/admin/`.

## 👤 Autor

**Ronny** — Seguridad de la Información, UDLA
