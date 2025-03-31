from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status, Security
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from app.config import settings
from app.schemas.user import TokenData
from app.services import auth_service
from app.database import execute_procedure
from typing import List, Optional

# Configuración de seguridad
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

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
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Obtiene el usuario actual a partir del token JWT."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        # Convertir el user_id a entero
        try:
            user_id = int(user_id)
        except ValueError:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # Obtener el usuario de la base de datos por ID
    try:
        user = execute_procedure("sp_get_user_details_by_id", [user_id])
        if not user:
            raise credentials_exception
        return user[0]
    except Exception:
        raise credentials_exception

# Clase para manejar roles
class RoleChecker:
    def __init__(self, allowed_roles: List[int]):
        self.allowed_roles = allowed_roles
        
    def __call__(self, user: dict = Security(get_current_user)):
        if user["role_id"] not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para acceder a este recurso"
            )
        return user

# Funciones de conveniencia para roles comunes
def admin_only():
    """Dependencia que solo permite acceso a administradores (role_id=3)."""
    return RoleChecker([3])

def creator_only():
    """Dependencia que solo permite acceso a creadores (role_id=1)."""
    return RoleChecker([1])

def admin_or_creator():
    """Dependencia que permite acceso a administradores y creadores (role_id=1 o 3)."""
    return RoleChecker([1, 3])

def any_role():
    """Dependencia que permite acceso a cualquier rol autenticado."""
    return RoleChecker([1, 2, 3])
