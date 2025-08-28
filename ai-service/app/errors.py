from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR
from app.logger import logger


class AppError(Exception):
    def __init__(self, message: str, status_code: int = HTTP_500_INTERNAL_SERVER_ERROR):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


async def app_error_handler(request: Request, exc: AppError):
    logger.error(f"[AppError] {exc.message}")
    return JSONResponse(status_code=exc.status_code, content={"error": exc.message})


async def unhandled_error_handler(request: Request, exc: Exception):
    logger.exception("[UnhandledError]", exc_info=exc)
    return JSONResponse(status_code=HTTP_500_INTERNAL_SERVER_ERROR, content={"error": "Internal server error"})


