from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from uuid import uuid4
from ..database import get_db
from .. import models, schemas


router = APIRouter(prefix="/items", tags=["items"])


@router.get("/", response_model=list[schemas.Item])
def list_items(
	user_id: str | None = Query(default=None),
	status: str | None = Query(default=None),
	category: str | None = Query(default=None),
	db: Session = Depends(get_db),
):
	q = db.query(models.Item, models.User.name.label("owner_name"), models.User.id.label("owner_id")).join(models.User, models.Item.user_id == models.User.id)
	if user_id:
		q = q.filter(models.Item.user_id == user_id)
	if status:
		q = q.filter(models.Item.status == status)
	if category and category != 'all':
		q = q.filter(models.Item.category == category)
	rows = q.order_by(models.Item.created_at.desc()).all()
	# Convert to dictionaries so Pydantic can map extra fields gracefully
	items = []
	for item, owner_name, owner_id in rows:
		data = {
			"id": item.id,
			"user_id": item.user_id,
			"title": item.title,
			"description": item.description,
			"category": item.category,
			"condition": item.condition,
			"images": item.images,
			"status": item.status,
			"views": item.views,
			"created_at": item.created_at,
			"updated_at": item.updated_at,
			"owner_name": owner_name,
			"owner_id": owner_id,
		}
		items.append(data)
	return items


@router.post("/", response_model=schemas.Item)
def create_item(payload: dict, db: Session = Depends(get_db)):
	obj = models.Item(
		id=str(uuid4()),
		user_id=payload["user_id"],
		title=payload["title"],
		description=payload.get("description"),
		category=payload.get("category"),
		condition=payload.get("condition"),
		images=payload.get("images"),
		status=payload.get("status", "available"),
	)
	db.add(obj)
	db.commit()
	db.refresh(obj)
	return obj



