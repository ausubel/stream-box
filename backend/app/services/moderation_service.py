from fastapi import HTTPException, status
from typing import List, Optional
from datetime import datetime
from app.database import execute_procedure

def get_all_videos():
    """Obtiene la lista de todos los videos para moderación."""
    try:
        videos = execute_procedure("sp_get_all_videos_for_moderation")
        return videos
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener videos para moderación: {str(e)}"
        )

def delete_video(video_id: int):
    """Elimina un video por incumplimiento de normas."""
    try:
        # Verificar si el video existe
        video = execute_procedure("sp_get_video", [video_id])
        if not video:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Video no encontrado"
            )
        
        # Marcar el video como eliminado por incumplimiento
        execute_procedure("sp_delete_video_by_admin", [video_id, "eliminado_por_incumplimiento"])
        
        return {"message": "Video eliminado correctamente por incumplimiento"}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar video: {str(e)}"
        )

def get_all_reports():
    """Obtiene la lista de todos los reportes de abuso."""
    try:
        reports = execute_procedure("sp_get_all_reports")
        return reports
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener reportes: {str(e)}"
        )

def resolve_report(report_id: int):
    """Marca un reporte como resuelto."""
    try:
        # Verificar si el reporte existe
        report = execute_procedure("sp_get_report", [report_id])
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reporte no encontrado"
            )
        
        # Marcar el reporte como resuelto
        execute_procedure("sp_resolve_report", [report_id])
        
        # Obtener el reporte actualizado
        updated_report = execute_procedure("sp_get_report", [report_id])
        return updated_report[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al resolver reporte: {str(e)}"
        )
