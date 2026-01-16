"""
Script simple para probar que la API se puede importar correctamente
"""
import sys

try:
    from app.main import app
    print("✅ API importada correctamente")
    print(f"✅ FastAPI app creada: {app.title}")
    print(f"✅ Rutas registradas: {len(app.routes)}")
    
    # Listar rutas
    print("\n📋 Rutas disponibles:")
    for route in app.routes:
        if hasattr(route, 'path') and hasattr(route, 'methods'):
            methods = ', '.join(sorted(route.methods))
            print(f"  {methods:20} {route.path}")
    
    print("\n✅ Todo listo para iniciar el servidor!")
    print("   Ejecuta: uvicorn app.main:app --reload")
    
except Exception as e:
    print(f"❌ Error al importar API: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
