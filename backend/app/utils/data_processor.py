import json
from typing import List, Dict, Any, Optional

def process_video_data(videos: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Procesa los datos de videos para convertir campos JSON en estructuras de Python.
    
    Args:
        videos: Lista de diccionarios con datos de videos
        
    Returns:
        Lista procesada de diccionarios con datos de videos
    """
    processed_videos = []
    
    for video in videos:
        processed_video = video.copy()
        
        # Procesar tags si existen y son una cadena JSON
        if 'tags' in processed_video and processed_video['tags'] is not None:
            try:
                if isinstance(processed_video['tags'], str):
                    processed_video['tags'] = json.loads(processed_video['tags'])
            except json.JSONDecodeError:
                # Si hay un error al decodificar, dejamos los tags como están
                pass
        
        processed_videos.append(processed_video)
    
    return processed_videos

def process_single_video_data(video: Dict[str, Any]) -> Dict[str, Any]:
    """
    Procesa los datos de un solo video para convertir campos JSON en estructuras de Python.
    
    Args:
        video: Diccionario con datos de un video
        
    Returns:
        Diccionario procesado con datos del video
    """
    if video is None:
        return None
    
    processed_video = video.copy()
    
    # Procesar tags si existen y son una cadena JSON
    if 'tags' in processed_video and processed_video['tags'] is not None:
        try:
            if isinstance(processed_video['tags'], str):
                processed_video['tags'] = json.loads(processed_video['tags'])
        except json.JSONDecodeError:
            # Si hay un error al decodificar, dejamos los tags como están
            pass
    
    return processed_video
