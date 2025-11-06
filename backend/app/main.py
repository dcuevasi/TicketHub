from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import auth, tickets
from .db import engine, Base

def create_app():
    app = FastAPI(title="Ops Dashboard API")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:4200", "http://127.0.0.1:4200"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth.router, prefix="/auth", tags=["auth"])
    app.include_router(tickets.router, prefix="/tickets", tags=["tickets"])

    @app.on_event("startup")
    def on_startup():
        # create tables in dev (Alembic should be used for prod)
        Base.metadata.create_all(bind=engine)

    @app.get("/metrics")
    def simple_metrics():
        from .db import SessionLocal
        from .models import Ticket
        db = SessionLocal()
        try:
            total = db.query(Ticket).count()
            open_tickets = db.query(Ticket).filter(Ticket.status == "open").count()
        finally:
            db.close()
        return {"total_tickets": total, "open_tickets": open_tickets}

    return app


app = create_app()

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    from fastapi.openapi.utils import get_openapi
    openapi_schema = get_openapi(title=app.title, version="1.0.0", routes=app.routes)
    openapi_schema.setdefault("components", {}).setdefault("securitySchemes", {})
    openapi_schema["components"]["securitySchemes"]["bearerAuth"] = {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
    }
    openapi_schema.setdefault("security", []).append({"bearerAuth": []})
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi