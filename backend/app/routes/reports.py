from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from app.schemas.response import StandardResponse
from app.schemas.report import ReportCreate, ReportResponse
from app.utils.auth import get_current_user, any_role
from app.database import execute_procedure

router = APIRouter(
    prefix="/reports",
    tags=["reports"],
    responses={404: {"description": "No encontrado"}},
    dependencies=[Depends(any_role())]
)

@router.post("/", response_model=StandardResponse[ReportResponse], status_code=status.HTTP_201_CREATED)
async def create_report(report: ReportCreate, current_user: dict = Depends(get_current_user)):
    """Crear un reporte de abuso para un video."""
    try:
        # Verificar si el video existe
        video = execute_procedure("sp_get_video", [report.video_id])
        if not video:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Video no encontrado"
            )
        
        # Usar el ID del usuario autenticado
        report_id = execute_procedure(
            "sp_create_report",
            [report.video_id, current_user["id"], report.reason, report.description]
        )
        
        # Obtener el reporte creado
        created_report = execute_procedure("sp_get_report", [report_id[0]["id"]])
        
        return StandardResponse(
            data=created_report[0],
            message="SUCCESS"
        )
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear reporte: {str(e)}"
        )

@router.get("/my", response_model=StandardResponse[List[ReportResponse]])
async def get_my_reports(current_user: dict = Depends(get_current_user)):
    """Obtener los reportes creados por el usuario actual."""
    try:
        # Obtener los reportes del usuario
        reports = execute_procedure("sp_get_user_reports", [current_user["id"]])
        
        return StandardResponse(
            data=reports,
            message="SUCCESS"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener reportes: {str(e)}"
        )
