from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import Base, engine
from .routers import categories, items, trades, messages, auth

app = FastAPI(title="Bayanihan Exchange API")

app.add_middleware(
	CORSMiddleware,
	allow_origins=[origin.strip() for origin in settings.CORS_ORIGINS.split(',')] + ["*"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)


@app.get("/health")
def health():
	return {"status": "ok"}

# Create tables (expects schema already present; harmless if exists)
Base.metadata.create_all(bind=engine)

# Routers
app.include_router(categories.router)
app.include_router(items.router)
app.include_router(trades.router)
app.include_router(messages.router)
app.include_router(auth.router)



