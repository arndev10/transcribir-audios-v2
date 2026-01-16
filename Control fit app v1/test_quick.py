"""
Script rápido para verificar que la API puede importarse sin errores
"""
import sys
import os

# Agregar el directorio actual al path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    print("🔍 Verificando imports...")
    
    # Test 1: Config
    from app.config import settings
    print("✅ Config importado")
    
    # Test 2: Database
    from app.db.base import Base
    from app.db.session import get_db
    from app.db.models import User, DailyLog, Photo, CheatMeal, WeeklyFeedback, Job, ProfileHistory
    print("✅ Database models importados")
    
    # Test 3: Schemas
    from app.schemas import auth, profile, logs, photos, cheat_meals, feedback
    print("✅ Schemas importados")
    
    # Test 4: Domain
    from app.domain.profile_helpers import get_active_profile
    from app.domain.feedback_helpers import calculate_data_hash
    print("✅ Domain helpers importados")
    
    # Test 5: API Dependencies
    from app.api.deps import get_current_active_user, create_access_token
    print("✅ API dependencies importados")
    
    # Test 6: Routes
    from app.api.routes import auth, profile, daily_logs, photos, cheat_meals, feedback
    print("✅ API routes importados")
    
    # Test 7: Main app
    from app.main import app
    print("✅ Main app importado")
    
    # Contar rutas
    route_count = len([r for r in app.routes if hasattr(r, 'path')])
    print(f"\n📊 Resumen:")
    print(f"   - Rutas registradas: {route_count}")
    print(f"   - Título: {app.title}")
    print(f"   - Versión: {app.version}")
    
    print("\n✅ ¡Todo está listo!")
    print("\n📝 Para iniciar el servidor, ejecuta:")
    print("   uvicorn app.main:app --reload")
    print("\n📖 Luego abre en tu navegador:")
    print("   http://localhost:8000/docs")
    
except ImportError as e:
    print(f"❌ Error de importación: {e}")
    print("\n💡 Asegúrate de tener instaladas las dependencias:")
    print("   pip install -r requirements.txt")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error inesperado: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
