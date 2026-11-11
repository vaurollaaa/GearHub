from datetime import date
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.orm import Session

from database import get_db
from models import Gear, Rental, User
from permissions import require_verified

router = APIRouter(prefix="/rentals", tags=["rentals"])

SERVICE_FEE = 5000
DEPOSIT_AMOUNT = 100000
MAX_RENTAL_DAYS = 30
BLOCKING_STATUSES = ("pending", "active")


class QuoteOut(BaseModel):
    gear_id: int
    start_date: date
    end_date: date
    days: int
    price_per_day: int
    rental_price: int
    service_fee: int
    deposit_amount: int
    total_amount: int


class RentalCreate(BaseModel):
    gear_id: int
    start_date: date
    end_date: date
    payment_method: Literal["wallet", "qris", "virtual_account"]


class RentalOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    gear_id: int
    start_date: date
    end_date: date
    rental_price: int
    service_fee: int
    deposit_amount: int
    total_amount: int
    payment_method: str | None
    status: str


class RentalCreated(BaseModel):
    rental: RentalOut
    balance: int


def get_active_gear(db: Session, gear_id: int, lock: bool = False) -> Gear:
    stmt = select(Gear).where(Gear.id == gear_id, Gear.is_active.is_(True))
    if lock:
        stmt = stmt.with_for_update()
    gear = db.scalars(stmt).first()
    if gear is None:
        raise HTTPException(status_code=404, detail="Gear tidak ditemukan")
    return gear


def validate_dates(gear: Gear, start: date, end: date) -> None:
    if start < date.today():
        raise HTTPException(status_code=400, detail="Tanggal pickup tidak boleh di masa lalu")
    if end <= start:
        raise HTTPException(status_code=400, detail="Tanggal return harus setelah tanggal pickup")
    if (end - start).days > MAX_RENTAL_DAYS:
        raise HTTPException(
            status_code=400, detail=f"Durasi sewa maksimal {MAX_RENTAL_DAYS} hari"
        )
    if (gear.available_from and start < gear.available_from) or (
        gear.available_until and end > gear.available_until
    ):
        raise HTTPException(
            status_code=400, detail="Tanggal di luar periode ketersediaan gear"
        )


def has_conflict(db: Session, gear_id: int, start: date, end: date) -> bool:
    stmt = (
        select(Rental.id)
        .where(
            Rental.gear_id == gear_id,
            Rental.status.in_(BLOCKING_STATUSES),
            Rental.start_date < end,
            Rental.end_date > start,
        )
        .limit(1)
    )
    return db.scalars(stmt).first() is not None


def build_quote(db: Session, gear: Gear, start: date, end: date, user: User) -> QuoteOut:
    if gear.owner_id == user.id:
        raise HTTPException(status_code=400, detail="Kamu tidak bisa menyewa gear milikmu sendiri")
    validate_dates(gear, start, end)
    if has_conflict(db, gear.id, start, end):
        raise HTTPException(
            status_code=409, detail="Tanggal yang dipilih sudah dipesan penyewa lain"
        )

    days = (end - start).days
    rental_price = gear.price_per_day * days
    return QuoteOut(
        gear_id=gear.id,
        start_date=start,
        end_date=end,
        days=days,
        price_per_day=gear.price_per_day,
        rental_price=rental_price,
        service_fee=SERVICE_FEE,
        deposit_amount=DEPOSIT_AMOUNT,
        total_amount=rental_price + SERVICE_FEE + DEPOSIT_AMOUNT,
    )


@router.get("/quote", response_model=QuoteOut)
def get_quote(
    gear_id: int,
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db),
    user: User = Depends(require_verified),
):
    gear = get_active_gear(db, gear_id)
    return build_quote(db, gear, start_date, end_date, user)


@router.post("", response_model=RentalCreated, status_code=201)
def create_rental(
    payload: RentalCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_verified),
):
    # Kunci baris gear supaya dua penyewa tidak bisa memesan tanggal yang sama bersamaan.
    gear = get_active_gear(db, payload.gear_id, lock=True)
    quote = build_quote(db, gear, payload.start_date, payload.end_date, user)

    if payload.payment_method == "wallet":
        db.refresh(user, with_for_update=True)
        if user.balance < quote.total_amount:
            raise HTTPException(status_code=400, detail="Saldo GearHub tidak cukup")
        user.balance -= quote.total_amount

    # SIMULASI: QRIS dan Virtual Account dianggap langsung berhasil.
    rental = Rental(
        gear_id=gear.id,
        renter_id=user.id,
        start_date=quote.start_date,
        end_date=quote.end_date,
        rental_price=quote.rental_price,
        service_fee=quote.service_fee,
        deposit_amount=quote.deposit_amount,
        total_amount=quote.total_amount,
        payment_method=payload.payment_method,
        status="pending",
    )
    db.add(rental)
    db.commit()
    db.refresh(rental)
    db.refresh(user)
    return RentalCreated(rental=RentalOut.model_validate(rental), balance=user.balance)