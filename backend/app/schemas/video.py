from pydantic import BaseModel, Field
from typing import List, Optional, Union
from datetime import datetime

class VideoBase(BaseModel):
    title: str
    youtube_link: str
    description: Optional[str] = None
    type: str
    status: str = "activo"
    thumbnail: Optional[str] = None

class VideoCreate(VideoBase):
    user_id: int
    tags: List[Union[int, str]] = []  # Ahora acepta tanto IDs (int) como nombres (str)

class VideoUpdate(BaseModel):
    title: Optional[str] = None
    youtube_link: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None
    thumbnail: Optional[str] = None
    tags: Optional[List[Union[int, str]]] = None  # También actualizado aquí

class VideoInDB(VideoBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class VideoResponse(VideoInDB):
    tags: Optional[List[str]] = None
