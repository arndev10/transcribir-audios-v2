# 🚀 Instrucciones para Iniciar el Servidor

## ⚠️ IMPORTANTE: Detener Servidores Anteriores

Antes de iniciar, asegúrate de que no haya otro servidor corriendo en el puerto 8000:

```powershell
# Verificar qué está usando el puerto 8000
netstat -ano | findstr :8000

# Si hay algo, detenerlo (reemplaza PID con el número que aparezca)
taskkill /F /PID <PID>
```

## 📋 Opción 1: Usar el Script de Inicio (Recomendado)

### Windows (PowerShell):
```powershell
cd backend
.\start_server.ps1
```

### Windows (CMD):
```cmd
cd backend
start_server.bat
```

## 📋 Opción 2: Comando Manual

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## ✅ Verificar que Funciona

1. Deberías ver en la consola:
   ```
   INFO:     Uvicorn running on http://0.0.0.0:8000
   INFO:     Application startup complete.
   ```

2. Abre en tu navegador:
   - **Swagger UI**: http://localhost:8000/docs
   - **ReDoc**: http://localhost:8000/redoc

3. **Verifica que veas:**
   - ✅ Título: **"Control Fit API"**
   - ✅ Descripción sobre monitoreo de grasa corporal y peso
   - ✅ **NO** debe aparecer "WhatsApp Audio Transcriber"
   - ✅ **NO** debe aparecer "transcribir audios"

## 🔍 Si Aún Ves el Proyecto Anterior

1. **Limpia la caché del navegador:**
   - Presiona `Ctrl + Shift + Delete`
   - Selecciona "Caché" o "Cached images and files"
   - Limpia la caché

2. **O usa modo incógnito:**
   - Presiona `Ctrl + Shift + N` (Chrome) o `Ctrl + Shift + P` (Firefox)
   - Abre http://localhost:8000/docs

3. **Verifica que el servidor correcto esté corriendo:**
   ```powershell
   # Deberías ver uvicorn en la lista
   netstat -ano | findstr :8000
   ```

## 📝 Rutas Disponibles

Una vez que el servidor esté corriendo, deberías ver estas secciones en Swagger:

- **auth** - Autenticación (register, login, me)
- **profile** - Perfiles de entrenamiento
- **daily-logs** - Registros diarios de peso
- **photos** - Fotos corporales
- **cheat-meals** - Comidas trampa
- **feedback** - Feedback semanal

## ❌ Si Hay Errores

### Error: "Module not found"
```bash
cd backend
pip install -r requirements.txt
```

### Error: "Address already in use"
```bash
# Detener el proceso en el puerto 8000
netstat -ano | findstr :8000
taskkill /F /PID <PID>
```

### Error: "uvicorn: command not found"
```bash
pip install uvicorn[standard]
```
