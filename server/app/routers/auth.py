from fastapi import APIRouter, Request, Depends
from app.core.response import http_response, http_error, responseMessage
from app.middleware.auth import get_current_user
from app.schemas.auth import (
    SignupRequest, LoginRequest, RefreshTokenRequest,
    ForgotPasswordRequest, VerifyOtpRequest, ResetPasswordRequest,
    VerifyEmailRequest, ResendVerificationRequest,
)
from app.services.auth_service import (
    signup_service, login_service, refresh_token_service,
    me_service, logout_service, forgot_password_service,
    verify_otp_service, reset_password_service,
    verify_email_service, resend_verification_service,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup")
async def signup(request: Request, body: SignupRequest):
    try:
        result = await signup_service(body)
        return http_response(request, 201, responseMessage.custom("Account created successfully"), result)
    except Exception as e:
        return http_error(request, e, getattr(e, "status_code", 500))


@router.post("/login")
async def login(request: Request, body: LoginRequest):
    try:
        result = await login_service(body)
        return http_response(request, 200, responseMessage.custom("Login successful"), result)
    except Exception as e:
        return http_error(request, e, getattr(e, "status_code", 500))


@router.post("/refresh")
async def refresh(request: Request, body: RefreshTokenRequest):
    try:
        result = await refresh_token_service(body.refresh_token)
        return http_response(request, 200, responseMessage.custom("Token refreshed"), result)
    except Exception as e:
        return http_error(request, e, getattr(e, "status_code", 500))


@router.get("/me")
async def me(request: Request, current_user: dict = Depends(get_current_user)):
    try:
        result = await me_service(current_user["id"])
        return http_response(request, 200, responseMessage.custom("User fetched"), result)
    except Exception as e:
        return http_error(request, e, getattr(e, "status_code", 500))


@router.post("/logout")
async def logout(request: Request, body: RefreshTokenRequest, current_user: dict = Depends(get_current_user)):
    try:
        await logout_service(body.refresh_token)
        return http_response(request, 200, responseMessage.custom("Logged out successfully"), None)
    except Exception as e:
        return http_error(request, e, getattr(e, "status_code", 500))


@router.post("/forgot-password")
async def forgot_password(request: Request, body: ForgotPasswordRequest):
    try:
        await forgot_password_service(body)
        return http_response(request, 200, responseMessage.custom("If this email exists, an OTP has been sent"), None)
    except Exception as e:
        return http_error(request, e, getattr(e, "status_code", 500))


@router.post("/verify-otp")
async def verify_otp(request: Request, body: VerifyOtpRequest):
    try:
        await verify_otp_service(body)
        return http_response(request, 200, responseMessage.custom("OTP verified"), None)
    except Exception as e:
        return http_error(request, e, getattr(e, "status_code", 500))


@router.post("/reset-password")
async def reset_password(request: Request, body: ResetPasswordRequest):
    try:
        await reset_password_service(body)
        return http_response(request, 200, responseMessage.custom("Password reset successfully"), None)
    except Exception as e:
        return http_error(request, e, getattr(e, "status_code", 500))


@router.post("/verify-email")
async def verify_email(request: Request, body: VerifyEmailRequest):
    try:
        result = await verify_email_service(body)
        return http_response(request, 200, responseMessage.custom("Email verified successfully"), result)
    except Exception as e:
        return http_error(request, e, getattr(e, "status_code", 500))


@router.post("/resend-verification")
async def resend_verification(request: Request, body: ResendVerificationRequest):
    try:
        await resend_verification_service(body)
        return http_response(request, 200, responseMessage.custom("Verification email sent"), None)
    except Exception as e:
        return http_error(request, e, getattr(e, "status_code", 500))
