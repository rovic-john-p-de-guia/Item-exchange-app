from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from uuid import uuid4
from ..database import get_db
from .. import models, schemas


router = APIRouter(prefix="/messages", tags=["messages"])


@router.get("/", response_model=list[schemas.Message])
def list_messages(trade_id: str = Query(...), db: Session = Depends(get_db)):
	return db.query(models.Message).where(models.Message.trade_id == trade_id).order_by(models.Message.created_at.asc()).all()


@router.get("/conversations")
def list_conversations(user_id: str = Query(...), db: Session = Depends(get_db)):
	# Find trades where user participates
	trades = db.query(models.Trade).filter((models.Trade.from_user_id == user_id) | (models.Trade.to_user_id == user_id)).order_by(desc(models.Trade.updated_at)).all()
	convs = []
	for t in trades:
		other_id = t.to_user_id if t.from_user_id == user_id else t.from_user_id
		other = db.query(models.User).get(other_id)
		# last message
		last_msg = db.query(models.Message).filter(models.Message.trade_id == t.id).order_by(desc(models.Message.created_at)).first()
		convs.append({
			"tradeId": t.id,
			"otherUser": {"id": other.id, "name": other.name},
			"lastMessage": last_msg.content if last_msg else '',
			"lastMessageTime": last_msg.created_at.isoformat() if last_msg else ''
		})
	return convs


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



