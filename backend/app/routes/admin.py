from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional

from app.schemas.response import StandardResponse
from app.schemas.user import UserResponse
from app.schemas.video import VideoResponse
from app.schemas.report import ReportResponse, ReportUpdate
from app.utils.auth import get_current_user, admin_only
from app.services import admin_service, moderation_service

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    responses={404: {"description": "No encontrado"}},
    dependencies=[Depends(admin_only())]
)

class RoleUpdate(BaseModel):
    role_id: int

class StatusUpdate(BaseModel):
    status: str

class PasswordReset(BaseModel):
    new_password: str

# Endpoints para administración de usuarios
@router.get("/users", response_model=StandardResponse[List[UserResponse]])
async def get_all_users(_: dict = Depends(admin_only())):
    """Listar todos los usuarios registrados. Solo administradores (role_id=3)."""
    users = admin_service.get_all_users()
    return StandardResponse(data=users, message="SUCCESS")

@router.put("/users/{user_id}/role", response_model=StandardResponse[UserResponse])
async def change_user_role(user_id: int, role_data: RoleUpdate, _: dict = Depends(admin_only())):
    """Cambiar rol del usuario. Solo administradores (role_id=3)."""
    updated_user = admin_service.change_user_role(user_id, role_data.role_id)
    return StandardResponse(data=updated_user, message="SUCCESS")

@router.put("/users/{user_id}/status", response_model=StandardResponse[UserResponse])
async def change_user_status(user_id: int, status_data: StatusUpdate, _: dict = Depends(admin_only())):
    """Suspender/reactivar cuenta de usuario. Solo administradores (role_id=3)."""
    updated_user = admin_service.change_user_status(user_id, status_data.status)
    return StandardResponse(data=updated_user, message="SUCCESS")

@router.delete("/users/{user_id}", response_model=StandardResponse)
async def delete_user(user_id: int, _: dict = Depends(admin_only())):
    """Eliminar cuenta del sistema. Solo administradores (role_id=3)."""
    admin_service.delete_user(user_id)
    return StandardResponse(message="SUCCESS")

@router.put("/users/{user_id}/reset", response_model=StandardResponse)
async def reset_user_password(user_id: int, password_data: PasswordReset, _: dict = Depends(admin_only())):
    """Restablecer contraseu00f1a de usuario. Solo administradores (role_id=3)."""
    admin_service.reset_user_password(user_id, password_data.new_password)
    return StandardResponse(message="SUCCESS")

# Endpoints para moderación de contenido
@router.get("/videos", response_model=StandardResponse[List[VideoResponse]])
async def get_all_videos_for_moderation(_: dict = Depends(admin_only())):
    """Listar todos los videos para moderación. Solo administradores (role_id=3)."""
    videos = moderation_service.get_all_videos()
    return StandardResponse(data=videos, message="SUCCESS")

@router.delete("/videos/{video_id}", response_model=StandardResponse)
async def delete_video_by_admin(video_id: int, _: dict = Depends(admin_only())):
    """Eliminar video por incumplimiento. Solo administradores (role_id=3)."""
    moderation_service.delete_video(video_id)
    return StandardResponse(message="SUCCESS")

@router.get("/reports", response_model=StandardResponse[List[ReportResponse]])
async def get_all_reports(_: dict = Depends(admin_only())):
    """Ver reportes de abuso. Solo administradores (role_id=3)."""
    reports = moderation_service.get_all_reports()
    return StandardResponse(data=reports, message="SUCCESS")

@router.put("/reports/{report_id}/resolve", response_model=StandardResponse[ReportResponse])
async def resolve_report(report_id: int, _: dict = Depends(admin_only())):
    """Marcar un reporte como resuelto. Solo administradores (role_id=3)."""
    updated_report = moderation_service.resolve_report(report_id)
    return StandardResponse(data=updated_report, message="SUCCESS")
