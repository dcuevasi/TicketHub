"""
Script para crear un usuario de prueba en la base de datos
Ejecutar: python create_user.py
"""
from app.db import SessionLocal
from app.crud import create_user
from app.schemas import UserCreate

def main():
    db = SessionLocal()
    try:
        # Crear usuario de prueba
        user_data = UserCreate(
            username="admin",
            email="admin@example.com",
            password="admin123"  # Cambia esto por una contraseña segura
        )
        
        # Verificar si ya existe
        from app.crud import get_user_by_username
        existing_user = get_user_by_username(db, user_data.username)
        
        if existing_user:
            print(f"❌ El usuario '{user_data.username}' ya existe.")
        else:
            user = create_user(db, user_data)
            print("   Usuario creado exitosamente:")
            print(f"   Username: {user.username}")
            print(f"   Email: {user.email}")
            print(f"   Role: {user.role}")
            print("\n Credenciales de login:")
            print(f"  Username: {user_data.username}")
            print("   Password: admin123")
    except Exception as e:
        print(f"❌ Error al crear usuario: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
