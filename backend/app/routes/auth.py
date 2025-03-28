from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from typing import Optional
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
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    
    return StandardResponse(
        data={
            "access_token": access_token, 
            "token_type": "bearer",
            "user": {
                "id": user["id"],
                "username": user["username"],
                "email": user["email"],
                "role_id": user["role_id"]
            }
        },
        message="SUCCESS"
    )

# Mantener el endpoint de token para compatibilidad con OAuth2
@router.post("/token", response_model=StandardResponse[Token])
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """Genera un token de acceso para el usuario usando OAuth2."""
    user = auth_service.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nombre de usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_service.create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    
    return StandardResponse(
        data={
            "access_token": access_token, 
            "token_type": "bearer"
        },
        message="SUCCESS"
    )
