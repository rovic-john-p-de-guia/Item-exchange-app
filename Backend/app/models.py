from sqlalchemy import Column, String, Integer, DateTime, Boolean, Enum, ForeignKey, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base


class User(Base):
	__tablename__ = "users"

	id = Column(String(36), primary_key=True)
	name = Column(String(255), nullable=False)
	email = Column(String(255), unique=True, nullable=False)
	password_hash = Column(String(255), nullable=False)
	is_verified = Column(Boolean, default=False)
	role = Column(Enum('user', 'admin', 'moderator', name='user_roles'), default='user')
	created_at = Column(DateTime, server_default=func.now())
	last_login_at = Column(DateTime)


class Category(Base):
	__tablename__ = "categories"

	id = Column(String(36), primary_key=True)
	name = Column(String(100), unique=True, nullable=False)
	description = Column(String(255))
	icon = Column(String(64))
	created_at = Column(DateTime, server_default=func.now())


class Item(Base):
	__tablename__ = "items"

	id = Column(String(36), primary_key=True)
	user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
	title = Column(String(255), nullable=False)
	description = Column(Text)
	category = Column(String(100))
	condition = Column(String(100))
	images = Column(JSON)
	status = Column(Enum('available', 'traded', 'removed', 'draft', 'pending', name='item_status'), default='available')
	views = Column(Integer, default=0)
	created_at = Column(DateTime, server_default=func.now())
	updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Trade(Base):
	__tablename__ = "trades"

	id = Column(String(36), primary_key=True)
	from_user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
	to_user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
	from_item_id = Column(String(36), ForeignKey('items.id', ondelete='CASCADE'), nullable=False)
	to_item_id = Column(String(36), ForeignKey('items.id', ondelete='CASCADE'), nullable=False)
	message = Column(Text)
	status = Column(Enum('pending', 'accepted', 'rejected', 'active', 'completed', 'cancelled', name='trade_status'), default='pending')
	expires_at = Column(DateTime)
	meeting_location = Column(String(255))
	meeting_time = Column(DateTime)
	created_at = Column(DateTime, server_default=func.now())
	updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Message(Base):
	__tablename__ = "messages"

	id = Column(String(36), primary_key=True)
	trade_id = Column(String(36), ForeignKey('trades.id', ondelete='CASCADE'), nullable=False)
	sender_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
	receiver_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
	content = Column(Text, nullable=False)
	is_read = Column(Boolean, default=False)
	created_at = Column(DateTime, server_default=func.now())



