import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.core.config import settings
from app.core.database import connect_database, disconnect_database
from app.models.plan import seed_plans
from app.models.workspace import ensure_indexes
from app.models.chat_message import ensure_chat_indexes
from app.models.research_job import ensure_research_indexes
from app.core.response import http_response, http_error, responseMessage
from app.routers import health, auth
from app.routers import pdf, export, chat, research, library, subscription


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_database()
    await seed_plans()
    await ensure_indexes()
    await ensure_chat_indexes()
    await ensure_research_indexes()
    yield
    await disconnect_database()


app = FastAPI(title=settings.app_name, version=settings.version, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(pdf.router)
app.include_router(export.router)
app.include_router(chat.router)
app.include_router(research.router)
app.include_router(library.router)
app.include_router(subscription.router)


@app.get("/")
async def root(request: Request):
    return http_response(
        request,
        200,
        responseMessage.SUCCESS.OK,
        {"app": settings.app_name, "version": settings.version, "docs": "/docs"},
    )


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return http_error(request, Exception(exc.detail), exc.status_code)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return http_error(request, Exception(responseMessage.ERROR.VALIDATION_ERROR), 422)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=settings.port, reload=True)
