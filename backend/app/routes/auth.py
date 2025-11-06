from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from .. import crud, schemas
from ..db import get_db
from ..core.security import create_access_token, get_current_user
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import status
from sqlalchemy.exc import IntegrityError
import logging

router = APIRouter()


@router.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = crud.get_user_by_username(db, user.username)
    if existing:
        raise HTTPException(status_code=400, detail="Username already registered")
    try:
        u = crud.create_user(db, user)
        return u
    except IntegrityError:
        # likely unique constraint on username/email
        logging.exception("Integrity error creating user")
        raise HTTPException(status_code=400, detail="Username or email already exists")
    except Exception:
        logging.exception("Unexpected error creating user")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, form_data.username)
    if not user or not crud.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
    access_token = create_access_token({"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.UserOut)
def read_me(current_user: schemas.UserOut = Depends(get_current_user)):
    return current_user


@router.get("/debug/headers")
def debug_headers(request: Request):
    return {k: v for k, v in request.headers.items()}
