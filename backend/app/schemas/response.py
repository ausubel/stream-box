from typing import TypeVar, Generic, Optional, Any
from pydantic import BaseModel

T = TypeVar('T')

class StandardResponse(BaseModel, Generic[T]):
    """Formato estándar de respuesta para todas las APIs."""
    data: Optional[T] = None
    message: str = "SUCCESS"
    
    class Config:
        from_attributes = True
