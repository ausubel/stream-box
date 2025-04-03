from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
import json
from app.schemas.video import VideoCreate, VideoResponse, VideoUpdate
from app.schemas.response import StandardResponse
from app.database import execute_procedure
from app.utils.auth import get_current_user, any_role
from app.utils.data_processor import process_video_data, process_single_video_data

router = APIRouter(
    prefix="/videos",
    tags=["videos"],
    responses={404: {"description": "No encontrado"}},
    dependencies=[Depends(any_role)]
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
        # Procesar los datos para convertir campos JSON en estructuras de Python
        processed_videos = process_video_data(videos)
        return StandardResponse(data=processed_videos, message="SUCCESS")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener videos: {str(e)}"
        )

def get_all_videos_by_type(video_type: str):
    """Funciu00f3n auxiliar para obtener videos por tipo."""
    videos = execute_procedure("sp_get_videos_by_type", [video_type])
    return process_video_data(videos)

@router.get("/live", response_model=StandardResponse[List[VideoResponse]])
async def get_live_videos():
    """Obtiene la lista de todos los videos en vivo activos."""
    try:
        videos = get_all_videos_by_type("en_vivo")
        return StandardResponse(data=videos, message="SUCCESS")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener videos en vivo: {str(e)}"
        )

@router.get("/recorded", response_model=StandardResponse[List[VideoResponse]])
async def get_recorded_videos():
    """Obtiene la lista de todos los videos grabados activos."""
    try:
        videos = get_all_videos_by_type("grabado")
        return StandardResponse(data=videos, message="SUCCESS")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener videos grabados: {str(e)}"
        )

@router.get("/search", response_model=StandardResponse[List[VideoResponse]])
async def search_videos(q: str = Query(..., description="Tu00e9rmino de bu00fasqueda")):
    """Busca videos por tu00edtulo, canal o palabra clave."""
    try:
        videos = execute_procedure("sp_search_videos", [q])
        processed_videos = process_video_data(videos)
        return StandardResponse(data=processed_videos, message="SUCCESS")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al buscar videos: {str(e)}"
        )

@router.get("/tags", response_model=StandardResponse[List])
async def get_video_tags():
    """Obtiene todas las categoru00edas/etiquetas disponibles."""
    try:
        tags = execute_procedure("sp_get_video_tags")
        print(tags)
        return StandardResponse(data=tags, message="SUCCESS")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener etiquetas: {str(e)}"
        )

@router.get("/{video_id}", response_model=StandardResponse[VideoResponse])
async def get_video(video_id: int):
    """Obtiene los detalles de un video especifico."""
    try:
        video_details = execute_procedure("sp_get_video", [video_id])
        if not video_details:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Video no encontrado"
            )
        
        # Procesar los datos para convertir campos JSON en estructuras de Python
        processed_video = process_single_video_data(video_details[0])
        return StandardResponse(data=processed_video, message="SUCCESS")
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener video: {str(e)}"
        )

@router.get("/user/{user_id}", response_model=StandardResponse[List[VideoResponse]])
async def get_videos_by_user(user_id: int):
    """Obtiene todos los videos de un usuario especifico."""
    try:
        videos = execute_procedure("sp_get_videos_by_user", [user_id])
        processed_videos = process_video_data(videos)
        return StandardResponse(data=processed_videos, message="SUCCESS")
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
        video_details = execute_procedure("sp_get_video", [video_id])
        if not video_details:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Video no encontrado"
            )
        
        # Verificar que el usuario sea el propietario del video o un administrador
        if video_details[0]["user_id"] != current_user["id"] and current_user["role_id"] != 3:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para actualizar este video"
            )
        
        # Preparar datos para actualizar
        update_data = {}
        for field, value in video.dict(exclude_unset=True).items():
            if value is not None:
                update_data[field] = value
        
        # Convertir tags a JSON si estu00e1n presentes
        tags_json = None
        if "tags" in update_data:
            tags_json = json.dumps(update_data["tags"])
        
        # Actualizar video
        execute_procedure(
            "sp_update_video",
            [video_id, 
             update_data.get("title"), 
             update_data.get("youtube_link"),
             update_data.get("description"), 
             update_data.get("type"),
             update_data.get("status"),
             update_data.get("thumbnail"),
             tags_json]
        )
        
        # Obtener los detalles actualizados
        updated_video = execute_procedure("sp_get_video", [video_id])
        processed_video = process_single_video_data(updated_video[0])
        return StandardResponse(data=processed_video, message="SUCCESS")
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar video: {str(e)}"
        )

@router.delete("/{video_id}", response_model=StandardResponse)
async def delete_video(video_id: int, current_user: dict = Depends(get_current_user)):
    """Elimina (marca como suspendido) un video."""
    try:
        # Verificar si el video existe
        video_details = execute_procedure("sp_get_video", [video_id])
        if not video_details:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Video no encontrado"
            )
        
        # Verificar que el usuario sea el propietario del video o un administrador
        if video_details[0]["user_id"] != current_user["id"] and current_user["role_id"] != 3:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para eliminar este video"
            )
        
        # Eliminar video (marcar como suspendido)
        execute_procedure("sp_delete_video", [video_id])
        
        return StandardResponse(message="SUCCESS")
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar video: {str(e)}"
        )
