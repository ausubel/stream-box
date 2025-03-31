from fastapi import HTTPException, status
from app.database import execute_procedure
from app.schemas.user import UserUpdateProfile
from app.utils.auth import get_password_hash, verify_password
from typing import Optional

def get_profile(user_id: int):
    """Obtiene los datos del perfil del usuario."""
    try:
        user_details = execute_procedure("sp_get_user_details_by_id", [user_id])
        if not user_details:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        
        # Eliminar el hash de contraseu00f1a de los datos devueltos
        user_data = user_details[0]
        if "password_hash" in user_data:
            del user_data["password_hash"]
        
        return user_data
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener perfil: {str(e)}"
        )

def update_profile(user_id: int, profile_data: UserUpdateProfile):
    """Actualiza los datos personales del usuario."""
    try:
        # Verificar si el usuario existe
        current_user = get_profile(user_id)
                
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        
        # Actualizar usuario
        result = execute_procedure(
            "sp_update_profile",
            [user_id, profile_data.username, profile_data.email, 
             profile_data.first_name, profile_data.last_name]
        )
        
        if result[0]["message"] != "SUCCESS":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result[0]["message"]
            )
        # Obtener los detalles actualizados
        return get_profile(user_id)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar perfil: {str(e)}"
        )

def update_profile_picture(user_id: int, profile_picture: str):
    """Actualiza la foto de perfil del usuario."""
    try:
        # Verificar si el usuario existe
        get_profile(user_id)
        
        # Actualizar foto de perfil
        execute_procedure("sp_update_profile_picture", [user_id, profile_picture])

        
        # Obtener los detalles actualizados
        return get_profile(user_id)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar foto de perfil: {str(e)}"
        )

def change_password(user_id: int, current_password: str, new_password: str):
    """Cambia la contraseu00f1a del usuario."""
    try:
        # Obtener los detalles del usuario incluyendo el hash de contraseu00f1a
        user_details = execute_procedure("sp_get_user_details_by_id", [user_id])
        if not user_details:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        
        user = user_details[0]
        
        # Verificar la contraseu00f1a actual
        if not verify_password(current_password, user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Contraseu00f1a actual incorrecta"
            )
        
        # Generar hash de la nueva contraseu00f1a
        new_password_hash = get_password_hash(new_password)
        
        # Actualizar contraseu00f1a
        execute_procedure("sp_update_password_hash", [user_id, new_password_hash])
        
        return {"message": "Contraseu00f1a actualizada correctamente"}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al cambiar contraseu00f1a: {str(e)}"
        )
