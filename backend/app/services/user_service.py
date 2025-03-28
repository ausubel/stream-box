from fastapi import HTTPException, status
from typing import List, Optional
from app.schemas.user import UserUpdate
from app.database import execute_procedure

def get_all_users():
    """Obtiene la lista de todos los usuarios."""
    try:
        users = execute_procedure("sp_get_users")
        return users
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener usuarios: {str(e)}"
        )

def get_user_by_id(user_id: int):
    """Obtiene los detalles de un usuario especu00edfico por su ID."""
    try:
        user_details = execute_procedure("sp_get_user_details_by_id", [user_id])
        if not user_details:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        
        return user_details[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener usuario: {str(e)}"
        )

def update_user(user_id: int, user: UserUpdate):
    """Actualiza los datos de un usuario."""
    try:
        # Verificar si el usuario existe
        user_details = get_user_by_id(user_id)
        
        # Actualizar usuario
        execute_procedure(
            "sp_update_user",
            [user_id, user.username, user.email, user.first_name, user.last_name, user.role_id]
        )
        
        # Obtener los detalles actualizados
        updated_user = execute_procedure("sp_get_user_details_by_id", [user_id])
        return updated_user[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar usuario: {str(e)}"
        )

def update_profile_picture(user_id: int, profile_picture: str):
    """Actualiza la foto de perfil de un usuario."""
    try:
        # Verificar si el usuario existe
        get_user_by_id(user_id)
        
        # Actualizar foto de perfil
        execute_procedure("sp_update_profile_picture", [user_id, profile_picture])
        
        # Obtener los detalles actualizados
        updated_user = execute_procedure("sp_get_user_details_by_id", [user_id])
        return updated_user[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar foto de perfil: {str(e)}"
        )

def change_user_status(user_id: int, status_value: str):
    """Cambia el estado de un usuario (activo/suspendido)."""
    try:
        # Verificar si el usuario existe
        get_user_by_id(user_id)
        
        # Cambiar estado
        execute_procedure("sp_change_status", [user_id, status_value])
        
        # Obtener los detalles actualizados
        updated_user = execute_procedure("sp_get_user_details_by_id", [user_id])
        return updated_user[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al cambiar estado del usuario: {str(e)}"
        )
