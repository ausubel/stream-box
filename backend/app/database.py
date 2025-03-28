import pymysql
from pymysql.cursors import DictCursor
from contextlib import contextmanager
from app.config import settings

@contextmanager
def get_connection():
    """Proporciona una conexión a la base de datos MySQL."""
    connection = None
    try:
        connection = pymysql.connect(
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            db=settings.DB_NAME,
            charset='utf8mb4',
            cursorclass=DictCursor,
            autocommit=True
        )
        yield connection
    except Exception as e:
        print(f"Error al conectar a la base de datos: {e}")
        raise
    finally:
        if connection:
            connection.close()

@contextmanager
def get_cursor():
    """Proporciona un cursor para ejecutar consultas SQL."""
    with get_connection() as connection:
        cursor = connection.cursor()
        try:
            yield cursor
        finally:
            cursor.close()

def execute_query(query, params=None):
    """Ejecuta una consulta SQL y devuelve los resultados."""
    with get_cursor() as cursor:
        cursor.execute(query, params)
        return cursor.fetchall()

def execute_procedure(procedure_name, params=None):
    """Ejecuta un procedimiento almacenado y devuelve los resultados."""
    with get_cursor() as cursor:
        cursor.callproc(procedure_name, params or [])
        return cursor.fetchall()

def execute_update(query, params=None):
    """Ejecuta una consulta de actualización (INSERT, UPDATE, DELETE) y devuelve el número de filas afectadas."""
    with get_connection() as connection:
        with connection.cursor() as cursor:
            rows_affected = cursor.execute(query, params)
            connection.commit()
            return rows_affected

def execute_insert(query, params=None):
    """Ejecuta una consulta de inserción y devuelve el ID de la última fila insertada."""
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query, params)
            connection.commit()
            return cursor.lastrowid