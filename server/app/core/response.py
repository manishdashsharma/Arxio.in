from fastapi import Request
from fastapi.responses import JSONResponse
from typing import Any
from app.core.logger import logger
from app.core.config import settings
from app.shared.constant.application import EApplicationEnvironment


class responseMessage:
    class ERROR:
        SOMETHING_WENT_WRONG = "Something went wrong"
        NOT_FOUND = "Route not found"
        UNAUTHORIZED = "Unauthorized access"
        FORBIDDEN = "Access forbidden"
        BAD_REQUEST = "Bad request"
        VALIDATION_ERROR = "Validation failed"
        INTERNAL_SERVER_ERROR = "Internal server error"
        SERVICE_UNAVAILABLE = "Service unavailable"
        TIMEOUT = "Request timeout"
        TOO_MANY_REQUESTS = "Too many requests"

    class SUCCESS:
        DEFAULT = "Success"
        CREATED = "Resource created successfully"
        UPDATED = "Resource updated successfully"
        DELETED = "Resource deleted successfully"
        FETCHED = "Resource fetched successfully"
        HEALTH_CHECK = "Health check passed successfully"
        READY = "Application is ready"
        ALIVE = "Application is alive"
        OK = "OK"

    class DATABASE:
        HEALTH_CHECK = "Database health check completed"
        DETAILED_HEALTH_CHECK = "Detailed health check completed"

    @staticmethod
    def custom(message: str) -> str:
        return message


def _build_request_meta(request: Request) -> dict:
    return {
        "ip": request.client.host if request.client else None,
        "method": request.method,
        "url": str(request.url),
    }


def http_response(
    request: Request,
    response_status_code: int,
    message: str,
    data: Any = None,
) -> JSONResponse:
    request_meta = _build_request_meta(request)

    response = {
        "success": True,
        "statusCode": response_status_code,
        "request": request_meta,
        "message": message,
        "data": data,
    }

    logger.info("CONTROLLER_RESPONSE %s", {"meta": response})

    if settings.environment == EApplicationEnvironment.PRODUCTION:
        response["request"] = {k: v for k, v in request_meta.items() if k != "ip"}

    return JSONResponse(status_code=response_status_code, content=response)


def _build_error_object(err: Exception, request: Request, error_status_code: int) -> dict:
    request_meta = _build_request_meta(request)
    trace = {"error": str(err)} if isinstance(err, Exception) else None

    error_obj = {
        "success": False,
        "statusCode": error_status_code,
        "request": request_meta,
        "message": str(err) if isinstance(err, Exception) else responseMessage.ERROR.SOMETHING_WENT_WRONG,
        "data": None,
        "trace": trace,
    }

    if settings.environment == EApplicationEnvironment.PRODUCTION:
        error_obj.pop("trace", None)
        error_obj["request"] = {k: v for k, v in request_meta.items() if k != "ip"}

    return error_obj


def http_error(
    request: Request,
    err: Exception,
    error_status_code: int = 500,
) -> JSONResponse:
    error_obj = _build_error_object(err, request, error_status_code)

    logger.error("CONTROLLER_ERROR %s", {"meta": error_obj})

    return JSONResponse(status_code=error_status_code, content=error_obj)


def paginated_response(
    request: Request,
    message: str,
    items: list,
    total: int,
    page: int,
    limit: int,
) -> JSONResponse:
    has_next_page = (page - 1) * limit + len(items) < total

    return http_response(
        request,
        200,
        message,
        {
            "items": items,
            "pagination": {
                "total": total,
                "page": page,
                "limit": limit,
                "hasNextPage": has_next_page,
            },
        },
    )
