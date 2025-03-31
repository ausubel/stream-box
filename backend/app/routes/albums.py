from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from app.schemas.response import StandardResponse
from app.schemas.album import AlbumCreate, AlbumUpdate, AlbumResponse
from app.schemas.video import VideoResponse
from app.utils.auth import get_current_user, creator_only
from app.services import album_service

router = APIRouter(
    prefix="/my/albums",
    tags=["albums"],
    responses={404: {"description": "No encontrado"}},
    dependencies=[Depends(creator_only())]
)

@router.get("/", response_model=StandardResponse[List[AlbumResponse]])
async def get_my_albums(current_user: dict = Depends(get_current_user)):
    """Obtiene la lista de álbumes del creador autenticado."""
    albums = album_service.get_albums_by_user(current_user["id"])
    return StandardResponse(data=albums, message="SUCCESS")

@router.post("/", response_model=StandardResponse[AlbumResponse], status_code=status.HTTP_201_CREATED)
async def create_album(album: AlbumCreate, current_user: dict = Depends(get_current_user)):
    """Crea un nuevo álbum para el creador autenticado."""
    created_album = album_service.create_album(current_user["id"], album)
    return StandardResponse(data=created_album, message="SUCCESS")

@router.put("/{album_id}", response_model=StandardResponse[AlbumResponse])
async def update_album(album_id: int, album: AlbumUpdate, current_user: dict = Depends(get_current_user)):
    """Actualiza un álbum del creador autenticado."""
    updated_album = album_service.update_album(album_id, album, current_user["id"])
    return StandardResponse(data=updated_album, message="SUCCESS")

@router.delete("/{album_id}", response_model=StandardResponse)
async def delete_album(album_id: int, current_user: dict = Depends(get_current_user)):
    """Elimina un álbum del creador autenticado."""
    album_service.delete_album(album_id, current_user["id"])
    return StandardResponse(message="SUCCESS")

@router.post("/{album_id}/videos/{video_id}", response_model=StandardResponse)
async def add_video_to_album(album_id: int, video_id: int, current_user: dict = Depends(get_current_user)):
    """Agrega un video al álbum del creador autenticado."""
    album_service.add_video_to_album(album_id, video_id, current_user["id"])
    return StandardResponse(message="SUCCESS")

@router.delete("/{album_id}/videos/{video_id}", response_model=StandardResponse)
async def remove_video_from_album(album_id: int, video_id: int, current_user: dict = Depends(get_current_user)):
    """Quita un video del álbum del creador autenticado."""
    album_service.remove_video_from_album(album_id, video_id, current_user["id"])
    return StandardResponse(message="SUCCESS")

@router.get("/{album_id}/videos", response_model=StandardResponse[List[VideoResponse]])
async def get_videos_from_album(album_id: int, current_user: dict = Depends(get_current_user)):
    """Obtiene todos los videos de un álbum del creador autenticado."""
    # Verificar que el álbum pertenezca al usuario
    album = album_service.get_album_by_id(album_id)
    if album["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para ver este álbum"
        )
    
    videos = album_service.get_videos_by_album(album_id)
    return StandardResponse(data=videos, message="SUCCESS")
