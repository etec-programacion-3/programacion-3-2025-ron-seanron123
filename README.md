# Ecommerce - Proyecto Programación 3

Proyecto que implementa un backend con FastAPI y un frontend estático que consume la API.

Contenido relevante:
- `ecommerce-backend/` - código del backend (FastAPI, SQLAlchemy).
- `ecommerce-frontend/` - frontend estático (HTML/CSS/JS) que consume la API.

## Requisitos
- Python 3.10+

## Ejecutar el backend
1. Crear un entorno virtual e instalar dependencias (si dispone de `requirements.txt`):

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2. Ejecutar la aplicación:

Opción recomendada (más simple y evita problemas de importación):

```bash
# desde la raíz del repo
cd ecommerce-backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Alternativa (sin cambiar de directorio) — exportar PYTHONPATH para que Python encuentre el paquete `app`:

```bash
export PYTHONPATH=$(pwd)/ecommerce-backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

3. La API quedará disponible en `http://127.0.0.1:8000/`.

Nota: por defecto el proyecto usa SQLite (`sqlite:///./ecommerce.db`) si no se define `DATABASE_URL`.

## Ejecutar el frontend
Abrir el archivo `ecommerce-frontend/index.html` en el navegador (puede usar un servidor estático simple), por ejemplo:

```bash
python -m http.server 8080 --directory ecommerce-frontend
# Luego abrir http://127.0.0.1:8080/index.html
```

El frontend llama a la API en `http://127.0.0.1:8000/api` por defecto.

## Archivo `request.http`
En `ecommerce-backend/request.http` encontrará ejemplos de llamadas (CRUD) para categorías, productos y usuarios. Algunos endpoints protegidos requieren el header `Authorization: Bearer <token>` o el header legacy `x-token: fake-jwt-token` (esto se indica en `.env.example`).

Nota sobre autenticación en este repo:
- El backend por ahora devuelve un token "fake" en el endpoint de login para mantener compatibilidad con el frontend y pruebas locales.
- Flujo recomendado por ahora: hacer POST a `/api/users/login`, obtener el campo `token` en la respuesta y usarlo en los requests protegidos enviando el header `Authorization: Bearer <token>` (o `x-token: fake-jwt-token` como fallback).


