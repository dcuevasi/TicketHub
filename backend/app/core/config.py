from pydantic import BaseSettings

class Settings(BaseSettings):
    # Default to SQLite for quick local dev (overridable via .env)
    DATABASE_URL: str = "sqlite:///./dev.db"
    SECRET_KEY: str = "changeme_supersecret"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    class Config:
        env_file = ".env"

settings = Settings()
