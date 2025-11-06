from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from .. import crud, schemas
from ..db import get_db
from ..core.security import get_current_user

router = APIRouter()


@router.post("/", response_model=schemas.TicketOut)
def create_ticket(ticket: schemas.TicketCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    t = crud.create_ticket(db, ticket)
    return t


@router.get("/", response_model=schemas.PaginatedTickets)
def list_tickets(
    page: int = Query(1, ge=1), 
    per_page: int = Query(20, le=10000), 
    status: Optional[str] = None, 
    priority: Optional[str] = None, 
    assignee: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db), 
    current_user=Depends(get_current_user)
):
    skip = (page - 1) * per_page
    filters = {}
    if status:
        filters["status"] = status
    if priority:
        filters["priority"] = priority
    if assignee:
        filters["assignee"] = assignee
    if search:
        filters["search"] = search
    total, items = crud.list_tickets(db, skip=skip, limit=per_page, filters=filters)
    return {"total": total, "items": items, "page": page, "per_page": per_page}


@router.get("/{ticket_id}", response_model=schemas.TicketOut)
def get_ticket(ticket_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    ticket = crud.get_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket


@router.put("/{ticket_id}", response_model=schemas.TicketOut)
def update_ticket(ticket_id: int, ticket: schemas.TicketUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    db_ticket = crud.update_ticket(db, ticket_id, ticket)
    if not db_ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return db_ticket


@router.delete("/{ticket_id}")
def delete_ticket(ticket_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    success = crud.delete_ticket(db, ticket_id)
    if not success:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return {"message": "Ticket deleted successfully"}



