from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from .config import settings
from .. import crud, schemas
from ..db import SessionLocal
from sqlalchemy.orm import Session

ALGORITHM = "HS256"

# Use an HTTP Bearer scheme so the OpenAPI "Authorize" (bearer) button
# provides the header that protected endpoints expect. This avoids
# mismatches between an OAuth2PasswordBearer-generated scheme in the docs
# and the actual Authorization header sent by the client.
bearer_scheme = HTTPBearer()


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    token: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> schemas.UserOut:
    """Validate the bearer token and return the current user.

    The `HTTPBearer` dependency returns an object with `.credentials` which is
    the raw token string sent in the Authorization header. We decode that JWT
    and lookup the user in the DB.
    """
    token_str = token.credentials if token is not None else None
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token_str:
        raise credentials_exception
    try:
        payload = jwt.decode(token_str, settings.SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = crud.get_user_by_username(db, username)
    if user is None:
        raise credentials_exception
    return user
