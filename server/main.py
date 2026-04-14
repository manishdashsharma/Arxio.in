import uvicorn
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.core.config import settings
from app.core.response import http_response, http_error, responseMessage
from app.routers import health

app = FastAPI(title=settings.app_name, version=settings.version)

app.include_router(health.router)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return http_error(request, Exception(exc.detail), exc.status_code)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return http_error(request, Exception(responseMessage.ERROR.VALIDATION_ERROR), 422)


@app.get("/")
async def root(request: Request):
    return http_response(
        request,
        200,
        responseMessage.SUCCESS.OK,
        {"app": settings.app_name, "version": settings.version, "docs": "/docs"},
    )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=settings.port, reload=True)
