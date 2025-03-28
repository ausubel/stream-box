from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
import json
from app.schemas.video import VideoCreate, VideoResponse, VideoUpdate
from app.schemas.response import StandardResponse
from app.database import execute_procedure
from app.utils.auth import get_current_user

router = APIRouter(
    prefix="/videos",
    tags=["videos"],
    responses={404: {"description": "No encontrado"}},
)

@router.post("/", response_model=StandardResponse[VideoResponse], status_code=status.HTTP_201_CREATED)
async def create_video(video: VideoCreate, current_user: dict = Depends(get_current_user)):
    """Crea un nuevo video en el sistema."""
    try:
        # Convertir la lista de tags a formato JSON
        tags_json = json.dumps(video.tags)
        
        # Llamar al procedimiento almacenado para crear video
        execute_procedure(
            "sp_create_video",
            [video.user_id, video.title, video.youtube_link, video.description, 
             video.type, video.status, video.thumbnail, tags_json]
        )
        
        # Aquu00ed deberu00edamos obtener el video reciu00e9n creado
        # Por ahora, devolvemos los datos enviados
        return StandardResponse(
            data={
                "id": 1,  # Esto deberu00eda ser el ID real
                **video.dict(),
                "created_at": "2025-03-28T00:00:00",  # Esto deberu00eda ser la fecha real
                "tags": []  # Esto deberu00eda ser la lista real de tags
            },
            message="SUCCESS"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al crear video: {str(e)}"
        )

@router.get("/", response_model=StandardResponse[List[VideoResponse]])
async def get_videos():
    """Obtiene la lista de todos los videos activos."""
    try:
        videos = execute_procedure("sp_get_videos")
        return StandardResponse(data=videos, message="SUCCESS")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener videos: {str(e)}"
        )

@router.get("/{video_id}", response_model=StandardResponse[VideoResponse])
async def get_video(video_id: int):
    """Obtiene los detalles de un video especu00edfico."""
    try:
        video_details = execute_procedure("sp_get_video_by_id", [video_id])
        if not video_details:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Video no encontrado"
            )
        
        return StandardResponse(data=video_details[0], message="SUCCESS")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener video: {str(e)}"
        )

@router.get("/user/{user_id}", response_model=StandardResponse[List[VideoResponse]])
async def get_videos_by_user(user_id: int):
    """Obtiene todos los videos de un usuario especu00edfico."""
    try:
        videos = execute_procedure("sp_get_video_by_user_id", [user_id])
        return StandardResponse(data=videos, message="SUCCESS")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener videos del usuario: {str(e)}"
        )

@router.put("/{video_id}", response_model=StandardResponse[VideoResponse])
async def update_video(video_id: int, video: VideoUpdate, current_user: dict = Depends(get_current_user)):
    """Actualiza los datos de un video."""
    try:
        # Verificar si el video existe
        video_details = execute_procedure("sp_get_video_by_id", [video_id])
        if not video_details:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Video no encontrado"
            )
        
        # Preparar datos para actualizar
        current_video = video_details[0]
        title = video.title if video.title is not None else current_video["title"]
        youtube_link = video.youtube_link if video.youtube_link is not None else current_video["youtube_link"]
        description = video.description if video.description is not None else current_video["description"]
        type_value = video.type if video.type is not None else current_video["type"]
        status = video.status if video.status is not None else current_video["status"]
        thumbnail = video.thumbnail if video.thumbnail is not None else current_video["thumbnail"]
        
        # Convertir tags a JSON si estu00e1n presentes
        tags_json = json.dumps(video.tags) if video.tags is not None else json.dumps([])
        
        # Actualizar video
        execute_procedure(
            "sp_update_video",
            [video_id, title, youtube_link, description, type_value, status, tags_json, thumbnail]
        )
        
        # Obtener los detalles actualizados
        updated_video = execute_procedure("sp_get_video_by_id", [video_id])
        return StandardResponse(data=updated_video[0], message="SUCCESS")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar video: {str(e)}"
        )

@router.delete("/{video_id}", status_code=status.HTTP_200_OK, response_model=StandardResponse)
async def delete_video(video_id: int, current_user: dict = Depends(get_current_user)):
    """Elimina (marca como suspendido) un video."""
    try:
        # Verificar si el video existe
        video_details = execute_procedure("sp_get_video_by_id", [video_id])
        if not video_details:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Video no encontrado"
            )
        
        # Eliminar video
        execute_procedure("sp_delete_video", [video_id])
        
        return StandardResponse(message="SUCCESS")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar video: {str(e)}"
        )
