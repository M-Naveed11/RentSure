from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import engine
from app.models import *  # noqa: F401, F403 — register all models
from app.api.v1 import auth, users, analyses, chat, documents, rent, payments


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    title="RentSure API",
    description="AI-powered lease analyzer for UAE tenants",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(analyses.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1")
app.include_router(documents.router, prefix="/api/v1")
app.include_router(rent.router, prefix="/api/v1")
app.include_router(payments.router, prefix="/api/v1")


@app.get("/health")
def health():
    return {"status": "ok", "service": "rentsure-api"}
