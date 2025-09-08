from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from uuid import uuid4
from ..database import get_db
from .. import models
from ..security import hash_password, verify_password, create_access_token, decode_token


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup")
def signup(payload: dict, db: Session = Depends(get_db)):
	# email uniqueness check
	existing = db.query(models.User).filter(models.User.email == payload["email"]).first()
	if existing:
		raise HTTPException(status_code=400, detail="Email already registered")
	user = models.User(
		id=str(uuid4()),
		name=payload["name"],
		email=payload["email"],
		password_hash=hash_password(payload["password"]),
		role='user'
	)
	db.add(user)
	db.commit()
	db.refresh(user)
	token = create_access_token(user.id)
	return {"user": {"id": user.id, "name": user.name, "email": user.email}, "token": token}


@router.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
	user = db.query(models.User).filter(models.User.email == form.username).first()
	if not user or not verify_password(form.password, user.password_hash):
		raise HTTPException(status_code=400, detail="Invalid credentials")
	token = create_access_token(user.id)
	return {"user": {"id": user.id, "name": user.name, "email": user.email}, "token": token}


@router.get("/me")
def me(authorization: str | None = Header(default=None), db: Session = Depends(get_db)):
	if not authorization or not authorization.lower().startswith("bearer "):
		raise HTTPException(status_code=401, detail="Missing token")
	token = authorization.split(" ", 1)[1]
	user_id = decode_token(token)
	if not user_id:
		raise HTTPException(status_code=401, detail="Invalid token")
	user = db.query(models.User).get(user_id)
	if not user:
		raise HTTPException(status_code=404, detail="User not found")
	return {"id": user.id, "name": user.name, "email": user.email}


