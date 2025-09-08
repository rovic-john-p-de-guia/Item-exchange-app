from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from uuid import uuid4
from ..database import get_db
from .. import models, schemas


router = APIRouter(prefix="/messages", tags=["messages"])


@router.get("/", response_model=list[schemas.Message])
def list_messages(trade_id: str = Query(...), db: Session = Depends(get_db)):
	return db.query(models.Message).where(models.Message.trade_id == trade_id).order_by(models.Message.created_at.asc()).all()


@router.post("/", response_model=schemas.Message)
def create_message(payload: dict, db: Session = Depends(get_db)):
	obj = models.Message(
		id=str(uuid4()),
		trade_id=payload["trade_id"],
		sender_id=payload["sender_id"],
		receiver_id=payload["receiver_id"],
		content=payload["content"],
		is_read=payload.get("is_read", False),
	)
	db.add(obj)
	db.commit()
	db.refresh(obj)
	return obj



