import resend
from app.core.config import settings

resend.api_key = settings.RESEND_API_KEY


def send_welcome_email(to_email: str, name: str) -> None:
    if not settings.RESEND_API_KEY:
        return
    resend.Emails.send({
        "from": "RentSure <hello@rentsure.ai>",
        "to": [to_email],
        "subject": "Welcome to RentSure!",
        "html": f"""
        <h1>Welcome to RentSure, {name}!</h1>
        <p>Your account is ready. Upload your first lease and let AI protect your rights.</p>
        <p><a href="{settings.FRONTEND_URL}/dashboard">Go to Dashboard →</a></p>
        """,
    })


def send_analysis_complete_email(to_email: str, name: str, analysis_id: str, score: int) -> None:
    if not settings.RESEND_API_KEY:
        return
    resend.Emails.send({
        "from": "RentSure <hello@rentsure.ai>",
        "to": [to_email],
        "subject": f"Your Lease Analysis is Ready — Score: {score}/100",
        "html": f"""
        <h1>Your lease analysis is complete!</h1>
        <p>Overall score: <strong>{score}/100</strong></p>
        <p><a href="{settings.FRONTEND_URL}/dashboard/analyses/{analysis_id}">View Full Report →</a></p>
        """,
    })
