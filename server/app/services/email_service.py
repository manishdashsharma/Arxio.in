import resend
from app.core.config import settings
from app.core.logger import logger

resend.api_key = settings.resend_api_key


async def send_otp_email(to: str, name: str, otp: str, subject: str, purpose: str) -> None:
    try:
        resend.Emails.send({
            "from": settings.email_from,
            "to": to,
            "subject": subject,
            "html": f"""
                <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
                    <h2 style="color:#111;margin-bottom:8px">Hi {name},</h2>
                    <p style="color:#444;margin-bottom:24px">{purpose}</p>
                    <div style="background:#f4f4f5;border-radius:8px;padding:24px;text-align:center;margin-bottom:24px">
                        <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#111">{otp}</span>
                    </div>
                    <p style="color:#888;font-size:14px">This code expires in 10 minutes. Do not share it with anyone.</p>
                    <hr style="border:none;border-top:1px solid #e4e4e7;margin:24px 0"/>
                    <p style="color:#aaa;font-size:12px">Arxio — arxio.in</p>
                </div>
            """,
        })
    except Exception as e:
        logger.error("Email send failed to %s — %s", to, str(e))
