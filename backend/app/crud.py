from sqlalchemy.orm import Session
from . import models, schemas
from passlib.context import CryptContext
from datetime import datetime

# Usamos pbkdf2_sha256 para evitar problemas con el backend bcrypt del sistema en entornos CI/Windows
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=get_password_hash(user.password),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_ticket(db: Session, ticket: schemas.TicketCreate):
    db_ticket = models.Ticket(
        title=ticket.title,
        description=ticket.description,
        status=ticket.status or models.TicketStatus.open,
        priority=ticket.priority or models.Priority.medium,
        assignee=ticket.assignee,
        due_date=ticket.due_date,
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

def get_ticket(db: Session, ticket_id: int):
    return db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()

def list_tickets(db: Session, skip: int = 0, limit: int = 20, filters: dict = None):
    q = db.query(models.Ticket)
    if filters:
        if "status" in filters:
            q = q.filter(models.Ticket.status == filters["status"]) 
        if "priority" in filters:
            q = q.filter(models.Ticket.priority == filters["priority"]) 
        if "assignee" in filters:
            q = q.filter(models.Ticket.assignee == filters["assignee"])
        if "search" in filters and filters["search"]:
            search_term = f"%{filters['search']}%"
            q = q.filter(
                (models.Ticket.title.ilike(search_term)) | 
                (models.Ticket.description.ilike(search_term))
            )
    total = q.count()
    items = q.order_by(models.Ticket.created_at.desc()).offset(skip).limit(limit).all()
    return total, items

def update_ticket(db: Session, ticket_id: int, ticket: schemas.TicketUpdate):
    db_ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not db_ticket:
        return None
    
    update_data = ticket.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_ticket, key, value)
    
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

def delete_ticket(db: Session, ticket_id: int):
    db_ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not db_ticket:
        return False
    db.delete(db_ticket)
    db.commit()
    return True
