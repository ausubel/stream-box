from fastapi import HTTPException
from typing import List
from app.database import execute_procedure
from app.schemas.video import VideoResponse
from app.schemas.response import StandardResponse


def get_all_videos_by_type(type: str):
    try:
        videos = execute_procedure("sp_get_videos_by_type", [type])
        return StandardResponse(data=videos, message="SUCCESS")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener videos: {str(e)}"
        )
    
def search_videos(q: str):
    try:
        videos = execute_procedure("sp_search_videos", [q])
        return StandardResponse(data=videos, message="SUCCESS")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al buscar videos: {str(e)}"
        )
    
def get_video_tags():
    try:
        tags = execute_procedure("sp_get_video_tags")
        return StandardResponse(data=tags, message="SUCCESS")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener etiquetas: {str(e)}"
        )
    
def get_video(video_id: int):
    try:
        video = execute_procedure("sp_get_video_by_id", [video_id])
        if not video:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Video no encontrado"
            )
        return StandardResponse(data=video[0], message="SUCCESS")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener video: {str(e)}"
        )
    
def get_videos_by_user(user_id: int):
    try:
        videos = execute_procedure("sp_get_video_by_user_id", [user_id])
        return StandardResponse(data=videos, message="SUCCESS")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener videos del usuario: {str(e)}"
        )

def update_video(video_id: int, video: VideoUpdate):
    try:
        execute_procedure(
            "sp_update_video",
            [video_id, video.title, video.youtube_link, video.description, video.type, video.status, video.tags, video.thumbnail]
        )
        return StandardResponse(message="SUCCESS")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar video: {str(e)}"
        )

def delete_video(video_id: int):
    try:
        execute_procedure("sp_delete_video", [video_id])
        return StandardResponse(message="SUCCESS")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar video: {str(e)}"
        )
