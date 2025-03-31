from fastapi import HTTPException, status
from app.database import execute_procedure
from app.schemas.album import AlbumCreate, AlbumUpdate
from app.schemas.response import StandardResponse

def get_albums_by_user(user_id: int):
    """Obtiene todos los álbumes de un usuario específico."""
    try:
        albums = execute_procedure("sp_get_album_by_user_id", [user_id])
        return albums
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener álbumes: {str(e)}"
        )

def get_album_by_id(album_id: int):
    """Obtiene un álbum por su ID."""
    try:
        album = execute_procedure("sp_get_album_by_id", [album_id])
        if not album:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Álbum no encontrado"
            )
        return album[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener álbum: {str(e)}"
        )

def create_album(user_id: int, album: AlbumCreate):
    """Crea un nuevo álbum."""
    try:
        execute_procedure("sp_create_album", [user_id, album.title])
        
        # Obtener el álbum recién creado (asumimos que es el último creado por el usuario)
        albums = get_albums_by_user(user_id)
        if not albums:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al crear álbum"
            )
        
        # Actualizar descripción y thumbnail si se proporcionaron
        if album.description or album.thumbnail:
            latest_album = albums[-1]  # El último álbum creado
            execute_procedure(
                "sp_update_album",
                [latest_album["id"], album.title, album.description or "", album.thumbnail or ""]
            )
            return get_album_by_id(latest_album["id"])
        
        return albums[-1]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear álbum: {str(e)}"
        )

def update_album(album_id: int, album: AlbumUpdate, user_id: int):
    """Actualiza un álbum existente."""
    try:
        # Verificar si el álbum existe y pertenece al usuario
        current_album = get_album_by_id(album_id)
        if current_album["user_id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para editar este álbum"
            )
        
        # Preparar datos para actualizar
        title = album.title if album.title is not None else current_album["title"]
        description = album.description if album.description is not None else current_album["description"]
        thumbnail = album.thumbnail if album.thumbnail is not None else current_album["thumbnail"]
        
        # Actualizar álbum
        execute_procedure(
            "sp_update_album",
            [album_id, title, description, thumbnail]
        )
        
        # Obtener los detalles actualizados
        return get_album_by_id(album_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar álbum: {str(e)}"
        )

def delete_album(album_id: int, user_id: int):
    """Elimina (marca como suspendido) un álbum."""
    try:
        # Verificar si el álbum existe y pertenece al usuario
        current_album = get_album_by_id(album_id)
        if current_album["user_id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para eliminar este álbum"
            )
        
        # Eliminar álbum
        execute_procedure("sp_delete_album", [album_id])
        return True
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar álbum: {str(e)}"
        )

def add_video_to_album(album_id: int, video_id: int, user_id: int):
    """Agrega un video a un álbum."""
    try:
        # Verificar si el álbum existe y pertenece al usuario
        current_album = get_album_by_id(album_id)
        if current_album["user_id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para modificar este álbum"
            )
        
        # Agregar video al álbum
        execute_procedure("sp_aggregate_video_to_album", [video_id, album_id])
        return True
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al agregar video al álbum: {str(e)}"
        )

def remove_video_from_album(album_id: int, video_id: int, user_id: int):
    """Quita un video de un álbum."""
    try:
        # Verificar si el álbum existe y pertenece al usuario
        current_album = get_album_by_id(album_id)
        if current_album["user_id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para modificar este álbum"
            )
        
        # Quitar video del álbum
        execute_procedure("sp_remove_video_from_album", [video_id, album_id])
        return True
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al quitar video del álbum: {str(e)}"
        )

def get_videos_by_album(album_id: int):
    """Obtiene todos los videos de un álbum."""
    try:
        videos = execute_procedure("sp_get_videos_by_album_id", [album_id])
        return videos
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener videos del álbum: {str(e)}"
        )
