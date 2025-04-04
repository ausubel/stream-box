import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Cargar variables de entorno desde archivo .env
load_dotenv()

class Settings(BaseSettings):
    # Configuración de la aplicación
    APP_NAME: str = "Stream Box API"
    APP_VERSION: str = "0.1.0"
    APP_DESCRIPTION: str = "API para la aplicación Stream Box"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # Configuración de la base de datos
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: int = int(os.getenv("DB_PORT", "3306"))
    DB_USER: str = os.getenv("DB_USER", "root")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")
    DB_NAME: str = os.getenv("DB_NAME", "stream_box")
    
    # Configuración de seguridad
    SECRET_KEY: str = os.getenv("SECRET_KEY", "tu_clave_secreta_aqui")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 100
    
    # Configuración CORS
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:8080",
        "*",  # Para desarrollo, en producción especificar dominios
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Crear una instancia de configuración
settings = Settings()
