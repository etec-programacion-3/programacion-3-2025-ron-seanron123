# Proyecto Programación 3 — Ecommerce (Backend + Frontend)

Caracteristicas
- Proyecto e‑commerce con Backend (API REST en Python) y Frontend estático (HTML/CSS/JS).
- Backend: FastAPI + SQLAlchemy (carpeta: `ecommerce-backend/app/`).
- Frontend: archivos estáticos en `ecommerce-frontend/` (index.html, cart.html, login.html, register.html, script.js, style.css).
- Base de datos por defecto: SQLite (`ecommerce-backend/ecommerce.db`).
- API base esperada: `http://127.0.0.1:8000/api`.
- Archivo de pruebas: `ecommerce-backend/request.http` (ejemplos CRUD y auth).

Prerequisitos
- Python 3.10+ instalado y en PATH.
- pip (gestor de paquetes de Python).
- Visual Studio Code (para ejecutar frontend con Live Server / Go Live).
- Extensiones VS Code recomendadas:
  - Live Server (ritwickdey.LiveServer)
  - REST Client (humao.rest-client) — opcional para `request.http`.
- (Opcional) Git para control de versiones.

## ⬇️ Configuración Inicial: Clonar el Repositorio

**Propósito:** Obtener una copia local de todo el código fuente del proyecto.

#### 1. Navegar al Repositorio del Proyecto

* Abre la página del proyecto en tu navegador web.

#### 2. Copiar la URL SSH

1.  Haz clic en el botón verde **`< > Code`** (Código).
2.  Selecciona la pestaña **`SSH`**.
3.  Copia el enlace que aparece (tendrá un formato similar a `git@github.com:usuario/proyecto.git`).

#### 3. Clonar el Proyecto

* Abre tu terminal (o Git Bash) y ejecuta el siguiente comando, reemplazando el enlace de ejemplo por el que copiaste:

    ```bash
    git clone git@github.com:usuario/proyecto.git
    ```

* **Instrucción:** Ahora debes moverte a la carpeta raíz del proyecto clonado:
    ```bash
    cd nombre-del-proyecto
    ```

---
Instalacion (guía paso a paso, Windows y Linux)

Parte A — Backend (instalación y ejecución)
1) Abrir terminal y ubicarse en la carpeta del backend
- Windows (PowerShell)
  ```powershell
  cd c:\ruta\a\tu\proyecto\ecommerce-backend
  ```
- Linux / macOS (bash)
  ```bash
  cd /ruta/a/tu/proyecto/ecommerce-backend
  ```

2) Crear y activar un entorno virtual (recomendado)
- Windows (PowerShell)
  ```powershell
  python -m venv .venv
  .venv\Scripts\Activate.ps1
  ```
- Linux / macOS (bash)
  ```bash
  python3 -m venv .venv
  source .venv/bin/activate
  ```

3) Instalar dependencias
- Si existe `requirements.txt` (ya incluido):
  ```bash
  pip install -r ../requirements.txt
  ```
  (Si estás dentro de `ecommerce-backend`, usa `pip install -r requirements.txt`)

- Dependencias mínimas que se instalan con el requirements: FastAPI, Uvicorn, SQLAlchemy, python-dotenv, pydantic, passlib, bcrypt.

4) Crear la base de datos y semillas (seed)
- Ejecutar script de seed (si existe):
  ```bash
  python app/seed.py
  ```
- Si no hay seed o para asegurarse de crear tablas:
  ```bash
  python -c "from app import database; from app.models import models; database.Base.metadata.create_all(database.engine)"
  ```
  Esto crea `ecommerce.db` en la carpeta `ecommerce-backend`.

5) Ejecutar la API (uvicorn)
- Desde la carpeta `ecommerce-backend`:
  ```bash
  uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
  ```
- Verificación:
  - Abrir en navegador: `http://127.0.0.1:8000/docs` (si FastAPI sirve Swagger).
  - Probar: `GET http://127.0.0.1:8000/api/products/`

Parte B — Frontend (instalar y usar Go Live / Live Server en VS Code)
Motivo: usar Go Live evita problemas de file:// y CORS. Este proyecto fue probado con Live Server.

1) Instalar Visual Studio Code
- Descargar e instalar desde https://code.visualstudio.com/ y abrirlo.

2) Instalar extensión Live Server (Go Live)
A. Método gráfico
- Abrir VS Code → Extensions (Ctrl+Shift+X).
- Buscar: "Live Server" (autor: Ritwick Dey).
- Click en "Install".
- Reiniciar VS Code si lo solicita.

B. Método por terminal (opcional)
- Si el comando `code` está en PATH:
  ```bash
  code --install-extension ritwickdey.LiveServer
  ```

3) Abrir la carpeta del frontend en VS Code
- En VS Code: File → Open Folder → seleccionar
  `c:\Users\jeanp\Documents\programacion-3-2025-ron-seanron123\ecommerce-frontend`

4) Abrir `index.html` y arrancar Go Live
- En el Explorador de VS Code, abrir `index.html`.
- Iniciar Live Server:
  - Hacer clic en el botón "Go Live" en la esquina inferior derecha de VS Code, o
  - Click derecho sobre `index.html` → "Open with Live Server".
- Live Server abrirá el navegador en una URL como:
  `http://127.0.0.1:5500/index.html` (puerto puede variar).

5) Ajustes útiles de Live Server
- Cambiar puerto: Settings → buscar "Live Server: Port" y poner `5500` (o el puerto que prefieras).
- Cambiar navegador: Settings → "Live Server > Custom Browser".
- Detener Live Server: hacer clic en "Go Live" / barra inferior o cerrar VS Code.

6) Verificaciones después de arrancar frontend
- Asegurarse de que el backend esté corriendo (uvicorn).
- Abrir DevTools en el navegador (F12):
  - Network → comprobar `style.css` y `script.js` devuelven 200.
  - Console → revisar errores JS o CORS.
- Revisar en `ecommerce-frontend/script.js` que:
  ```js
  const API_URL = "http://127.0.0.1:8000/api";
  ```
  Si es diferente, actualizar para que apunte al backend local.

Parte C — Base de datos (SQLite por defecto)
- El proyecto usa SQLite por defecto. No necesita instalar servicio externo.
- Archivo de DB: `ecommerce-backend/ecommerce.db`.
- Para reinicializar o crear tablas usar los comandos de la sección Backend (seed o metadata.create_all).

Variables de entorno (opcional / si se requieren)
- Archivo `.env` (opcional) en `ecommerce-backend/` con ejemplo:
  ```
  DATABASE_URL=sqlite:///./ecommerce.db
  SECRET_KEY=mi_clave_secreta
  HOST=127.0.0.1
  PORT=8000
  ```
- Si el código utiliza python-dotenv, las variables se cargan automáticamente; si no, exportar manualmente:
  - Windows (PowerShell):
    ```powershell
    $env:DATABASE_URL="sqlite:///./ecommerce.db"
    $env:SECRET_KEY="mi_clave"
    ```
  - Linux / macOS (bash):
    ```bash
    export DATABASE_URL="sqlite:///./ecommerce.db"
    export SECRET_KEY="mi_clave"
    ```

Probar endpoints con `request.http`
- Abrir `ecommerce-backend/request.http` en VS Code (extensión REST Client recomendada).
- Ejecutar las peticiones listadas (POST/GET/PUT/DELETE) para verificar el estado real de la API.
- Asegurarse de que la API esté corriendo antes de ejecutar las peticiones.

Notas finales rápidas
- Orden de ejecución recomendado:
  1. Iniciar backend (uvicorn).
  2. Iniciar frontend con Go Live (VS Code).
  3. Usar la UI en el navegador o `request.http` para probar endpoints.
- Si el CSS o scripts no cargan: DevTools → Network → reparar rutas o puerto de Live Server.
- Evitar credenciales hardcodeadas en el repo; usar `.env` o variables del sistema.

Sean Thomas Ron Flores.
5to informática.
