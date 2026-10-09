<h1 align="center"> 🥊 Gestor de Torneo MMA </h1>

<p align="center">
  <img src="https://img.shields.io/badge/STATUS-COMPLETADO-green">
  <img src="https://img.shields.io/badge/VISTA-REACT-blue">
  <img src="https://img.shields.io/badge/CONTROLADOR-DJANGO-darkgreen">
  <img src="https://img.shields.io/badge/MODELO-SQLITE-lightblue">
</p>

## 📌 Índice
* [Descripción del Proyecto](#-descripción-del-proyecto)
* [Características de la aplicación](#-características-de-la-aplicación)
* [Patrón Arquitectónico MVC](#-patrón-arquitectónico-mvc)
* [Tecnologías Utilizadas](#-tecnologías-utilizadas)
* [Seguridad y Encriptación](#-seguridad-y-encriptación)
* [Acceso y Ejecución del Proyecto](#-acceso-y-ejecución-del-proyecto)
* [Autores](#-autores)
* [Licencia](#-licencia)

## 📖 Descripción del Proyecto
Aplicación web robusta diseñada para gestionar las operaciones de un Torneo de Artes Marciales Mixtas (MMA). Permite a los administradores registrar, visualizar, actualizar y eliminar (CRUD) la información de los peleadores. Todo el sistema está protegido mediante autenticación de usuarios y estructurado bajo el patrón de diseño **MVC (Modelo-Vista-Controlador)**.

*Este proyecto es parte de la materia de Ingeniería Web de la UDLA.*

## ⚙️ Características de la aplicación
- `Registro de usuarios:` Creación de cuentas validando datos obligatorios (nombre, correo, celular, etc) y contraseñas seguras.
- `Autenticación (Login):` Acceso seguro usando el nombre de usuario o correo electrónico.
- `Gestor de Peleadores (CRUD):`
  - **Inscribir:** Registrar nuevos competidores al torneo.
  - **Visualizar:** Ver la lista oficial de competidores.
  - **Actualizar:** Cambiar el estado médico del peleador (Apto / Baja Médica).
  - **Retirar:** Eliminar permanentemente al competidor del torneo.
- `Rutas Protegidas:` Sistema de guardián en frontend y backend que impide el acceso a la tabla del torneo si no hay una sesión activa.

## 🧱 Patrón Arquitectónico MVC

La aplicación está diseñada siguiendo estricta separación de responsabilidades:

| Capa | Archivo principal | Qué hace |
|---|---|---|
| **Modelo (M)** | `backend/torneo/models.py` | Define las tablas SQLite y las reglas de los datos (Peleador, Perfil). |
| **Vista (V)** | `frontend/src/pages/Crud.jsx` | La interfaz gráfica en React. Muestra los datos y captura las acciones del usuario. |
| **Controlador (C)** | `backend/torneo/views.py` | La lógica (API). Recibe peticiones, consulta al Modelo y responde a la Vista. |

## 💻 Tecnologías Utilizadas
- **Frontend:** React + Vite, Vanilla CSS, React Router DOM.
- **Backend:** Python, Django, Django REST Framework.
- **Base de Datos:** SQLite.

## 🔐 Seguridad y Encriptación
- **Criptografía Fuerte:** Las contraseñas **no** se guardan en texto plano y no usamos esquemas obsoletos como MD5. Django utiliza por defecto **PBKDF2 con SHA-256**, un algoritmo avanzado con iteraciones y una clave *Salt* única.
- **Autenticación por Token:** El frontend almacena un Token de acceso seguro en el `localStorage`.
- **Doble Protección:** El componente `ProtectedRoute` bloquea accesos no deseados desde la interfaz web, y el controlador del backend devuelve `HTTP 401 Unauthorized` bloqueando cualquier acceso directo a los datos.

## 🚀 Acceso y Ejecución del Proyecto

Para ejecutar este proyecto en un entorno local (Windows), sigue estos pasos:

**Requisitos previos:** `Python 3.10+` y `Node.js 22+`.

### 1. Iniciar el Backend (Django)
Abre una terminal en la carpeta del proyecto y ejecuta:
```bash
cd backend
venv\Scripts\activate
python manage.py runserver
```

### 2. Iniciar el Frontend (React)
Abre una segunda terminal en la raíz del proyecto y ejecuta:
```bash
cd frontend
npm run dev
```

### 3. Abrir la Aplicación
Dirígete a tu navegador y entra a: [http://localhost:5173/](http://localhost:5173/)

## 👤 Autores
| [<img src="https://avatars.githubusercontent.com/u/9919?s=200&v=4" width=115><br><sub>Matias</sub>](https://github.com) |
| :---: |
| **Estudiante de Ingeniería Web, UDLA** |

## 📄 Licencia
Este proyecto es de código abierto bajo licencia MIT (uso puramente académico).
