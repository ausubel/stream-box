from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional

from app.schemas.response import StandardResponse
from app.schemas.user import UserUpdateProfile, UserResponse
from app.utils.auth import get_current_user, any_role
from app.services import profile_service

router = APIRouter(
    prefix="/profile",
    tags=["profile"],
    responses={404: {"description": "No encontrado"}},
    dependencies=[Depends(any_role())]
)

class ProfilePictureUpdate(BaseModel):
    profile_picture: str

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

@router.get("/", response_model=StandardResponse[UserResponse])
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Obtiene los datos del perfil del usuario actual."""
    profile = profile_service.get_profile(current_user["id"])
    return StandardResponse(data=profile, message="SUCCESS")

@router.put("/", response_model=StandardResponse[UserResponse])
async def update_profile(profile_data: UserUpdateProfile, current_user: dict = Depends(get_current_user)):
    """Actualiza los datos personales del usuario actual."""
    updated_profile = profile_service.update_profile(current_user["id"], profile_data)
    return StandardResponse(data=updated_profile, message="SUCCESS")

@router.put("/password", response_model=StandardResponse)
async def change_password(password_data: PasswordUpdate, current_user: dict = Depends(get_current_user)):
    """Cambia la contraseu00f1a del usuario actual."""
    result = profile_service.change_password(
        current_user["id"], 
        password_data.current_password, 
        password_data.new_password
    )
    return StandardResponse(message="SUCCESS")

@router.put("/picture", response_model=StandardResponse[UserResponse])
async def update_profile_picture(picture_data: ProfilePictureUpdate, current_user: dict = Depends(get_current_user)):
    """Actualiza la foto de perfil del usuario actual."""
    updated_profile = profile_service.update_profile_picture(current_user["id"], picture_data.profile_picture)
    return StandardResponse(data=updated_profile, message="SUCCESS")
