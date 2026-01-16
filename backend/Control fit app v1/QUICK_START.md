# 🚀 Inicio Rápido - Probar la API

## Paso 1: Instalar Dependencias

```bash
cd backend
pip install -r requirements.txt
```

## Paso 2: Verificar que Todo Está Correcto

```bash
python test_quick.py
```

Este script verifica que todos los imports funcionan correctamente.

## Paso 3: Iniciar el Servidor

```bash
uvicorn app.main:app --reload
```

Deberías ver algo como:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

## Paso 4: Abrir la Documentación Interactiva

Abre en tu navegador:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Paso 5: Probar la API

### Opción A: Usar Swagger UI (Recomendado)

1. Abre http://localhost:8000/docs
2. Primero, registra un usuario:
   - Expande `POST /api/auth/register`
   - Click en "Try it out"
   - Ingresa:
     ```json
     {
       "email": "test@example.com",
       "password": "test123"
     }
     ```
   - Click en "Execute"
3. Luego, haz login:
   - Expande `POST /api/auth/login`
   - Click en "Try it out"
   - Ingresa:
     - username: `test@example.com`
     - password: `test123`
   - Click en "Execute"
   - **Copia el `access_token` de la respuesta**
4. Autentícate en Swagger:
   - Click en el botón "Authorize" (arriba a la derecha)
   - Pega el token en el campo "Value"
   - Click en "Authorize"
5. Ahora puedes probar todas las rutas protegidas:
   - Crear perfil
   - Crear daily logs
   - Subir fotos
   - Crear cheat meals
   - Solicitar feedback semanal

### Opción B: Usar curl

Ver `TESTING.md` para ejemplos completos con curl.

### Opción C: Usar Python requests

Ver `TESTING.md` para un script de ejemplo.

## Rutas Disponibles

### Públicas (sin autenticación)
- `GET /` - Mensaje de bienvenida
- `GET /health` - Health check
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Login

### Protegidas (requieren token)
- `GET /api/auth/me` - Usuario actual
- `GET /api/profile` - Listar perfiles
- `POST /api/profile` - Crear perfil
- `GET /api/profile/active` - Perfil activo
- `GET /api/daily-logs` - Listar logs
- `POST /api/daily-logs` - Crear log
- `GET /api/photos` - Listar fotos
- `POST /api/photos` - Subir foto
- `GET /api/cheat-meals` - Listar cheat meals
- `POST /api/cheat-meals` - Crear cheat meal
- `POST /api/feedback/weekly` - Solicitar feedback
- `GET /api/feedback/weekly` - Listar feedbacks

## Verificar Base de Datos

La base de datos SQLite se crea automáticamente en `backend/control_fit.db`.

Para verificar:
```bash
sqlite3 control_fit.db
.tables
SELECT * FROM users;
```

## Solución de Problemas

### Error: "Module not found"
```bash
# Asegúrate de estar en el directorio backend
cd backend
pip install -r requirements.txt
```

### Error: "Address already in use"
```bash
# El puerto 8000 está ocupado, usa otro puerto:
uvicorn app.main:app --reload --port 8001
```

### Error: "Could not validate credentials"
- Verifica que estés enviando el token correctamente
- El token expira después de 30 minutos, haz login nuevamente

### Error: "422 Validation Error"
- Revisa los schemas en `app/schemas/`
- Verifica que los datos cumplan con las validaciones (fechas, rangos, etc.)

## Próximos Pasos

Una vez que la API esté funcionando:
1. ✅ Probar todas las rutas desde Swagger UI
2. ⏳ Implementar workers para procesamiento asíncrono
3. ⏳ Implementar domain logic para cálculos determinísticos
4. ⏳ Integrar servicios de AI
