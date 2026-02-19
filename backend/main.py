"""
Lumen AI Assistant — FastAPI entry point.
"""
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI(title=os.getenv("APP_NAME", "Lumen"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_methods=["*"],
    allow_headers=["*"],
    # NOTE: allow_credentials must NOT be True when allow_origins is "*"
    # Browsers reject credentials + wildcard per the CORS spec.
)


from routers.chat_router import router as chat_router

app.include_router(chat_router)


@app.get("/health")
async def health() -> dict[str, str]:
    """Liveness check."""
    return {"status": "ok", "app": os.getenv("APP_NAME", "Lumen")}
