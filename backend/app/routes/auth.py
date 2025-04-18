from fastapi import APIRouter, HTTPException, status
from datetime import timedelta, datetime, timezone
from pydantic import BaseModel
from app.schemas.user import UserCreate, UserResponse, Token
from app.schemas.response import StandardResponse
from app.services import auth_service
from app.config import settings

router = APIRouter(
    prefix="/auth",
    tags=["authentication"],
    responses={401: {"description": "No autorizado"}},
)

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/register", response_model=StandardResponse[UserResponse], status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    """Registra un nuevo usuario en el sistema."""
    user_data = auth_service.register_user(user)
    return StandardResponse(data=user_data, message="SUCCESS")

@router.post("/login", response_model=StandardResponse[Token])
async def login(login_data: LoginRequest):
    """Genera un token de acceso para el usuario usando username y password."""
    user = auth_service.authenticate_user(login_data.username, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nombre de usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_service.create_access_token(
        data={"sub": str(user["id"])}, expires_delta=access_token_expires
    )
    
    # Create a user response object with only the fields we have
    user_response = {
        "id": user["id"],
        "username": user["username"],
        "email": user["email"],
        "role_id": user["role_id"],
        "status": user.get("status", "active"),  # Default to active if not present
        "created_at": user.get("created_at", datetime.now(timezone.utc))  # Default to now if not present
    }
    
    return StandardResponse(
        data={
            "access_token": access_token, 
            "token_type": "bearer",
            "user": user_response
        },
        message="SUCCESS"
    )
