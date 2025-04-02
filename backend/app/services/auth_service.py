from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from fastapi import HTTPException, status
from passlib.context import CryptContext
from app.config import settings
from app.schemas.user import UserCreate, UserResponse, TokenData
from app.database import execute_procedure

# Configuración de seguridad
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    """Verifica si la contraseña coincide con el hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Genera un hash para la contraseña."""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    """Crea un token JWT para autenticación."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def authenticate_user(username: str, password: str):
    """Autentica un usuario verificando sus credenciales."""
    try:
        # Obtener usuario por nombre de usuario
        user_details = execute_procedure("sp_get_user_details_by_username", [username])
        if not user_details:
            print(f"Usuario no encontrado: {username}")
            return False
        
        user = user_details[0]
        
        password_match = verify_password(password, user["password_hash"])
        
        if not password_match:
            return False
        
        # Actualizar último inicio de sesión
        execute_procedure("sp_update_last_login", [user["id"], datetime.now(timezone.utc)])
        
        return user
    except Exception as e:
        print(f"Error en authenticate_user: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def register_user(user: UserCreate):
    """Registra un nuevo usuario en el sistema."""
    # Hash de la contraseña
    hashed_password = get_password_hash(user.password)
    
    # Llamar al procedimiento almacenado para registrar usuario
    try:
        execute_procedure(
            "sp_register_user",
            [user.username, user.email, hashed_password, user.first_name, user.last_name, user.role_id]
        )
        
        # Obtener los detalles del usuario recién creado
        user_details = execute_procedure("sp_get_user_details_by_email", [user.email])
        if not user_details:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al crear el usuario"
            )
        
        return user_details[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al registrar usuario: {str(e)}"
        )

def get_user_by_username(username: str):
    """Obtiene un usuario por su nombre de usuario."""
    try:
        user_details = execute_procedure("sp_get_user_details_by_username", [username])
        if not user_details:
            return None
        return user_details[0]
    except Exception:
        return None
