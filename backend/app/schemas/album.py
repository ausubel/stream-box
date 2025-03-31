from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class AlbumBase(BaseModel):
    title: str
    description: Optional[str] = None
    thumbnail: Optional[str] = None

class AlbumCreate(AlbumBase):
    pass

class AlbumUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    thumbnail: Optional[str] = None

class AlbumInDB(AlbumBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class AlbumResponse(AlbumInDB):
    pass
