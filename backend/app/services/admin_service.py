from fastapi import HTTPException, status
from app.database import execute_procedure
from app.utils.auth import get_password_hash
from typing import Optional

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

def change_user_role(user_id: int, role_id: int):
    """Cambia el rol de un usuario."""
    try:
        # Verificar si el usuario existe
        user_details = execute_procedure("sp_get_user_details_by_id", [user_id])
        if not user_details:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        
        # Cambiar rol
        execute_procedure("sp_change_role", [user_id, role_id])
        
        # Obtener los detalles actualizados
        updated_user = execute_procedure("sp_get_user_details_by_id", [user_id])
        return updated_user[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al cambiar rol del usuario: {str(e)}"
        )

def change_user_status(user_id: int, status_value: str):
    """Cambia el estado de un usuario (activo/suspendido)."""
    try:
        # Verificar si el usuario existe
        user_details = execute_procedure("sp_get_user_details_by_id", [user_id])
        if not user_details:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        
        # Verificar si el usuario es administrador
        if user_details[0]["role_id"] == 3:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No se puede cambiar el estado de un administrador"
            )
        
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

def delete_user(user_id: int):
    """Elimina un usuario del sistema."""
    try:
        # Verificar si el usuario existe
        user_details = execute_procedure("sp_get_user_details_by_id", [user_id])
        if not user_details:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        
        # Verificar si el usuario es administrador
        if user_details[0]["role_id"] == 3:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No se puede eliminar un administrador"
            )
        
        # Eliminar usuario (en este caso, marcar como suspendido)
        execute_procedure("sp_change_status", [user_id, "suspendido"])
        
        return {"message": "Usuario eliminado correctamente"}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar usuario: {str(e)}"
        )

def reset_user_password(user_id: int, new_password: str):
    """Restablece la contraseu00f1a de un usuario."""
    try:
        # Verificar si el usuario existe
        user_details = execute_procedure("sp_get_user_details_by_id", [user_id])
        if not user_details:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        
        # Generar hash de la nueva contraseu00f1a
        new_password_hash = get_password_hash(new_password)
        
        # Actualizar contraseu00f1a
        execute_procedure("sp_update_password_hash", [user_id, new_password_hash])
        
        return {"message": "Contraseu00f1a restablecida correctamente"}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al restablecer contraseu00f1a: {str(e)}"
        )
