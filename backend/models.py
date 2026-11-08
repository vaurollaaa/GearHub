from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    nim: Mapped[str | None] = mapped_column(String(20))
    campus: Mapped[str | None] = mapped_column(String(100))
    phone: Mapped[str | None] = mapped_column(String(20))
    ktm_valid_until: Mapped[date | None] = mapped_column(Date)
    ktm_image_url: Mapped[str | None] = mapped_column(String(500))
    selfie_url: Mapped[str | None] = mapped_column(String(500))
    # "unverified" atau "verified"
    verification_status: Mapped[str] = mapped_column(String(20), default="unverified")
    balance: Mapped[int] = mapped_column(Integer, default=40000)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Gear(Base):
    __tablename__ = "gears"

    id: Mapped[int] = mapped_column(primary_key=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    name: Mapped[str] = mapped_column(String(150))
    category: Mapped[str] = mapped_column(String(30))
    summary: Mapped[str | None] = mapped_column(Text)
    # "sangat_baik" atau "baik"
    condition: Mapped[str] = mapped_column(String(20))
    price_per_day: Mapped[int] = mapped_column(Integer)
    pickup_location: Mapped[str] = mapped_column(String(200))
    available_from: Mapped[date | None] = mapped_column(Date)
    available_until: Mapped[date | None] = mapped_column(Date)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    images: Mapped[list["GearImage"]] = relationship(cascade="all, delete-orphan")
    specs: Mapped[list["GearSpec"]] = relationship(cascade="all, delete-orphan")
    items: Mapped[list["GearItem"]] = relationship(cascade="all, delete-orphan")


class GearImage(Base):
    __tablename__ = "gear_images"

    id: Mapped[int] = mapped_column(primary_key=True)
    gear_id: Mapped[int] = mapped_column(ForeignKey("gears.id"), index=True)
    url: Mapped[str] = mapped_column(String(500))
    position: Mapped[int] = mapped_column(Integer, default=0)


class GearSpec(Base):
    __tablename__ = "gear_specs"

    id: Mapped[int] = mapped_column(primary_key=True)
    gear_id: Mapped[int] = mapped_column(ForeignKey("gears.id"), index=True)
    name: Mapped[str] = mapped_column(String(100))
    value: Mapped[str] = mapped_column(String(200))


class GearItem(Base):
    __tablename__ = "gear_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    gear_id: Mapped[int] = mapped_column(ForeignKey("gears.id"), index=True)
    name: Mapped[str] = mapped_column(String(150))


class Rental(Base):
    __tablename__ = "rentals"

    id: Mapped[int] = mapped_column(primary_key=True)
    gear_id: Mapped[int] = mapped_column(ForeignKey("gears.id"), index=True)
    renter_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    start_date: Mapped[date] = mapped_column(Date)
    end_date: Mapped[date] = mapped_column(Date)
    rental_price: Mapped[int] = mapped_column(Integer)
    service_fee: Mapped[int] = mapped_column(Integer, default=0)
    deposit_amount: Mapped[int] = mapped_column(Integer, default=0)
    total_amount: Mapped[int] = mapped_column(Integer)
    # "wallet", "qris", atau "virtual_account"
    payment_method: Mapped[str | None] = mapped_column(String(20))
    # "pending", "active", "completed", "cancelled"
    status: Mapped[str] = mapped_column(String(20), default="pending")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class ConditionCheck(Base):
    __tablename__ = "condition_checks"

    id: Mapped[int] = mapped_column(primary_key=True)
    rental_id: Mapped[int] = mapped_column(ForeignKey("rentals.id"), index=True)
    # "before" atau "after"
    check_type: Mapped[str] = mapped_column(String(20))
    # "baik" atau "ada_kerusakan"
    condition: Mapped[str] = mapped_column(String(20))
    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    photos: Mapped[list["ConditionCheckPhoto"]] = relationship(cascade="all, delete-orphan")


class ConditionCheckPhoto(Base):
    __tablename__ = "condition_check_photos"

    id: Mapped[int] = mapped_column(primary_key=True)
    check_id: Mapped[int] = mapped_column(ForeignKey("condition_checks.id"), index=True)
    url: Mapped[str] = mapped_column(String(500))