from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas.user import UserResponse, UserUpdate
from app.schemas.response import StandardResponse
from app.utils.auth import get_current_user
from app.services import user_service

router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={404: {"description": "No encontrado"}},
)

@router.get("/", response_model=StandardResponse[List[UserResponse]])
async def get_users(current_user: dict = Depends(get_current_user)):
    """Obtiene la lista de todos los usuarios."""
    users = user_service.get_all_users()
    return StandardResponse(data=users, message="SUCCESS")

@router.get("/me", response_model=StandardResponse[UserResponse])
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Obtiene la información del usuario actual."""
    return StandardResponse(data=current_user, message="SUCCESS")

@router.get("/{user_id}", response_model=StandardResponse[UserResponse])
async def get_user(user_id: int, current_user: dict = Depends(get_current_user)):
    """Obtiene los detalles de un usuario específico."""
    user = user_service.get_user_by_id(user_id)
    return StandardResponse(data=user, message="SUCCESS")

@router.put("/{user_id}", response_model=StandardResponse[UserResponse])
async def update_user(user_id: int, user: UserUpdate, current_user: dict = Depends(get_current_user)):
    """Actualiza los datos de un usuario."""
    updated_user = user_service.update_user(user_id, user)
    return StandardResponse(data=updated_user, message="SUCCESS")

@router.put("/{user_id}/profile-picture", response_model=StandardResponse[UserResponse])
async def update_profile_picture(user_id: int, profile_picture: str, current_user: dict = Depends(get_current_user)):
    """Actualiza la foto de perfil de un usuario."""
    updated_user = user_service.update_profile_picture(user_id, profile_picture)
    return StandardResponse(data=updated_user, message="SUCCESS")

@router.put("/{user_id}/status", response_model=StandardResponse[UserResponse])
async def change_user_status(user_id: int, status: str, current_user: dict = Depends(get_current_user)):
    """Cambia el estado de un usuario (activo/suspendido)."""
    updated_user = user_service.change_user_status(user_id, status)
    return StandardResponse(data=updated_user, message="SUCCESS")
