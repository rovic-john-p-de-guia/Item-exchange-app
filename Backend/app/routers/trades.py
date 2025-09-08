from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from uuid import uuid4
from ..database import get_db
from .. import models, schemas


router = APIRouter(prefix="/trades", tags=["trades"])


@router.get("/", response_model=list[schemas.Trade])
def list_trades(user_id: str | None = Query(default=None), db: Session = Depends(get_db)):
	q = db.query(models.Trade)
	if user_id:
		q = q.filter((models.Trade.from_user_id == user_id) | (models.Trade.to_user_id == user_id))
	return q.order_by(models.Trade.created_at.desc()).all()


@router.post("/", response_model=schemas.Trade)
def create_trade(payload: dict, db: Session = Depends(get_db)):
	obj = models.Trade(
		id=str(uuid4()),
		from_user_id=payload["from_user_id"],
		to_user_id=payload["to_user_id"],
		from_item_id=payload["from_item_id"],
		to_item_id=payload["to_item_id"],
		message=payload.get("message"),
		status=payload.get("status", "pending"),
	)
	db.add(obj)
	db.commit()
	db.refresh(obj)
	return obj



