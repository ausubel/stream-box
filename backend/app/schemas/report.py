from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ReportBase(BaseModel):
    video_id: int
    user_id: int
    reason: str
    description: Optional[str] = None
    status: str = "pendiente"  # pendiente, resuelto

class ReportCreate(ReportBase):
    pass

class ReportUpdate(BaseModel):
    status: str

class ReportInDB(ReportBase):
    id: int
    created_at: datetime
    resolved_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class ReportResponse(ReportInDB):
    video_title: Optional[str] = None
    reporter_username: Optional[str] = None
