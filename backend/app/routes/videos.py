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
        processed_tags = [str(tag) if isinstance(tag, int) else tag for tag in video.tags]
        tags_json = json.dumps(processed_tags)
        execute_procedure(
            "sp_create_video",
            [video.user_id, video.title, video.youtube_link, video.description, 
             video.type, 'activo', video.thumbnail, tags_json]
        )
        return StandardResponse(
            data={
                "id": 1,
                **video.dict(),
                "created_at": "2025-03-28T00:00:00",
                "tags": processed_tags
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
    """Función auxiliar para obtener videos por tipo."""
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
async def search_videos(q: str = Query(..., description="Término de búsqueda")):
    """Busca videos por título, canal o palabra clave."""
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
    """Obtiene todas las categorías/etiquetas disponibles."""
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
    """Obtiene los detalles de un video específico."""
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
    """Obtiene todos los videos de un usuario específico."""
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
            # Procesar las etiquetas para asegurar que sean del formato correcto
            processed_tags = [str(tag) if isinstance(tag, int) else tag for tag in update_data["tags"]]
            tags_json = json.dumps(processed_tags)
            update_data["tags"] = processed_tags
        
        # Guardar el estado actual para asegurarnos de que podamos recuperar el video despuu00e9s de actualizar
        current_status = video_details[0]["status"]
        new_status = update_data.get("status", current_status)
        
        # Actualizar video
        execute_procedure(
            "sp_update_video",
            [video_id, 
             update_data.get("title", video_details[0]["title"]), 
             update_data.get("youtube_link", video_details[0]["youtube_link"]),
             update_data.get("description", video_details[0]["description"]), 
             update_data.get("type", video_details[0]["type"]),
             new_status,
             tags_json,
             update_data.get("thumbnail", video_details[0]["thumbnail"])]
        )
        
        # Construir manualmente el objeto de respuesta con los datos actualizados
        # ya que sp_get_video solo devuelve videos activos
        response_data = {
            "id": video_id,
            "user_id": video_details[0]["user_id"],
            "title": update_data.get("title", video_details[0]["title"]),
            "youtube_link": update_data.get("youtube_link", video_details[0]["youtube_link"]),
            "description": update_data.get("description", video_details[0]["description"]),
            "type": update_data.get("type", video_details[0]["type"]),
            "status": new_status,
            "thumbnail": update_data.get("thumbnail", video_details[0]["thumbnail"]),
            "created_at": video_details[0]["created_at"],
            "tags": update_data.get("tags", [])
        }
        
        return StandardResponse(data=response_data, message="SUCCESS")
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
