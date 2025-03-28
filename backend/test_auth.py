import pymysql
from pymysql.cursors import DictCursor
from passlib.context import CryptContext
import sys

# Configuraciu00f3n de seguridad para hash de contraseu00f1as
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Configuraciu00f3n de la base de datos
db_config = {
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "intel",
    "db": "stream_box",
    "charset": "utf8mb4",
    "cursorclass": DictCursor,
    "autocommit": True
}

def get_password_hash(password):
    """Genera un hash para la contraseña."""
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    """Verifica si la contraseña coincide con el hash."""
    return pwd_context.verify(plain_password, hashed_password)

def execute_procedure(connection, procedure_name, params=None):
    """Ejecuta un procedimiento almacenado y devuelve los resultados."""
    with connection.cursor() as cursor:
        cursor.callproc(procedure_name, params or [])
        return cursor.fetchall()

def register_test_user(connection, username, password):
    """Registra un usuario de prueba."""
    print(f"\nRegistrando usuario de prueba: {username}")
    
    # Generar hash de la contraseu00f1a
    password_hash = get_password_hash(password)
    print(f"Hash generado para la contraseu00f1a: {password_hash}")
    
    try:
        # Registrar usuario
        execute_procedure(
            connection,
            "sp_register_user",
            [username, f"{username}@example.com", password_hash, "Test", "User", 1]
        )
        print("Usuario registrado exitosamente")
        
        # Obtener detalles del usuario
        user_details = execute_procedure(connection, "sp_get_user_details_by_username", [username])
        if user_details:
            print(f"Usuario encontrado en la base de datos: {user_details[0]['username']}")
            print(f"Campos disponibles: {list(user_details[0].keys())}")
            
            if 'password_hash' in user_details[0]:
                stored_hash = user_details[0]['password_hash']
                print(f"Hash almacenado en la base de datos: {stored_hash}")
                
                # Verificar contraseu00f1a
                is_valid = verify_password(password, stored_hash)
                print(f"Verificaciu00f3n de contraseu00f1a: {'Exitosa' if is_valid else 'Fallida'}")
                return is_valid
            else:
                print("ERROR: El campo password_hash no estu00e1 presente en los resultados")
        else:
            print("ERROR: No se pudo encontrar el usuario reciu00e9n registrado")
    except Exception as e:
        print(f"ERROR al registrar usuario: {str(e)}")
    
    return False

def main():
    try:
        # Conectar a la base de datos
        print("Conectando a la base de datos...")
        connection = pymysql.connect(**db_config)
        print("Conexiu00f3n exitosa")
        
        # Generar un nombre de usuario u00fanico para evitar duplicados
        import random
        test_username = f"testuser_{random.randint(1000, 9999)}"
        test_password = "password123"
        
        # Registrar y probar autenticaciu00f3n
        success = register_test_user(connection, test_username, test_password)
        
        if success:
            print("\nu00a1PRUEBA EXITOSA! La autenticaciu00f3n funciona correctamente")
        else:
            print("\nPRUEBA FALLIDA: La autenticaciu00f3n no funciona correctamente")
            
    except Exception as e:
        print(f"ERROR: {str(e)}")
    finally:
        if 'connection' in locals():
            connection.close()
            print("Conexiu00f3n cerrada")

if __name__ == "__main__":
    main()
