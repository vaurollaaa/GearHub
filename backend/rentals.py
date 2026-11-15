from datetime import date
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy import select
from sqlalchemy.orm import Session

from database import get_db
from models import (
    ConditionCheck,
    ConditionCheckPhoto,
    Gear,
    GearImage,
    GearItem,
    Rental,
    User,
)
from permissions import require_verified
from verification import CLOUDINARY_PREFIX

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


class RentalItem(BaseModel):
    id: int
    status: str
    gear_id: int
    gear_name: str
    gear_image: str | None
    owner_name: str
    start_date: date
    end_date: date
    rental_price: int
    service_fee: int
    deposit_amount: int
    total_amount: int
    payment_method: str | None
    has_before: bool
    has_after: bool
    after_condition: str | None


class RentalDetail(RentalItem):
    gear_items: list[str]
    before_missing: list[str]


class CheckCreate(BaseModel):
    check_type: Literal["before", "after"]
    condition: Literal["baik", "ada_kerusakan"]
    notes: str = Field(default="", max_length=800)
    missing_items: list[str] = Field(default_factory=list, max_length=20)
    photo_urls: list[str] = Field(min_length=1, max_length=6)

    @field_validator("photo_urls")
    @classmethod
    def check_photos(cls, urls: list[str]) -> list[str]:
        for url in urls:
            if not url.startswith(CLOUDINARY_PREFIX) or len(url) > 500:
                raise ValueError("URL foto tidak valid")
        return urls

    @field_validator("missing_items")
    @classmethod
    def clean_missing(cls, items: list[str]) -> list[str]:
        return [i.strip()[:150] for i in items if i.strip()]


class CheckResult(BaseModel):
    status: str
    balance: int
    deposit_refunded: bool | None
    newly_missing: list[str]


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


def split_missing(value: str) -> list[str]:
    return [line for line in value.split("\n") if line]


def rental_rows(db: Session, *conditions):
    stmt = (
        select(Rental, Gear, User)
        .join(Gear, Gear.id == Rental.gear_id)
        .join(User, User.id == Gear.owner_id)
        .where(*conditions)
        .order_by(Rental.id.desc())
    )
    return db.execute(stmt).all()


def build_items(db: Session, rows) -> list[RentalItem]:
    if not rows:
        return []

    gear_ids = {gear.id for _, gear, _ in rows}
    first_image: dict[int, str] = {}
    images = db.scalars(
        select(GearImage).where(GearImage.gear_id.in_(gear_ids)).order_by(GearImage.position)
    ).all()
    for img in images:
        first_image.setdefault(img.gear_id, img.url)

    checks: dict[tuple[int, str], ConditionCheck] = {}
    rental_ids = [rental.id for rental, _, _ in rows]
    for check in db.scalars(
        select(ConditionCheck).where(ConditionCheck.rental_id.in_(rental_ids))
    ).all():
        checks[(check.rental_id, check.check_type)] = check

    items = []
    for rental, gear, owner in rows:
        after = checks.get((rental.id, "after"))
        items.append(
            RentalItem(
                id=rental.id,
                status=rental.status,
                gear_id=gear.id,
                gear_name=gear.name,
                gear_image=first_image.get(gear.id),
                owner_name=owner.full_name,
                start_date=rental.start_date,
                end_date=rental.end_date,
                rental_price=rental.rental_price,
                service_fee=rental.service_fee,
                deposit_amount=rental.deposit_amount,
                total_amount=rental.total_amount,
                payment_method=rental.payment_method,
                has_before=(rental.id, "before") in checks,
                has_after=after is not None,
                after_condition=after.condition if after else None,
            )
        )
    return items


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


@router.get("/mine", response_model=list[RentalItem])
def my_rentals(
    db: Session = Depends(get_db),
    user: User = Depends(require_verified),
):
    return build_items(db, rental_rows(db, Rental.renter_id == user.id))


@router.get("/{rental_id}", response_model=RentalDetail)
def get_rental(
    rental_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_verified),
):
    rows = rental_rows(db, Rental.id == rental_id, Rental.renter_id == user.id)
    if not rows:
        raise HTTPException(status_code=404, detail="Sewa tidak ditemukan")
    item = build_items(db, rows)[0]
    gear_items = db.scalars(select(GearItem.name).where(GearItem.gear_id == item.gear_id)).all()
    before = db.scalars(
        select(ConditionCheck).where(
            ConditionCheck.rental_id == rental_id, ConditionCheck.check_type == "before"
        )
    ).first()
    return RentalDetail(
        **item.model_dump(),
        gear_items=list(gear_items),
        before_missing=split_missing(before.missing_items) if before else [],
    )


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


@router.post("/{rental_id}/check", response_model=CheckResult, status_code=201)
def submit_condition_check(
    rental_id: int,
    payload: CheckCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_verified),
):
    rental = db.scalars(
        select(Rental).where(Rental.id == rental_id).with_for_update()
    ).first()
    if rental is None or rental.renter_id != user.id:
        raise HTTPException(status_code=404, detail="Sewa tidak ditemukan")

    if payload.check_type == "before" and rental.status != "pending":
        raise HTTPException(
            status_code=400, detail="Cek kondisi awal hanya bisa saat sewa menunggu pengambilan"
        )
    if payload.check_type == "after" and rental.status != "active":
        raise HTTPException(
            status_code=400, detail="Pengembalian hanya bisa setelah cek kondisi awal selesai"
        )

    check = ConditionCheck(
        rental_id=rental.id,
        check_type=payload.check_type,
        condition=payload.condition,
        notes=payload.notes.strip(),
        missing_items="\n".join(payload.missing_items),
        photos=[ConditionCheckPhoto(url=u, position=i) for i, u in enumerate(payload.photo_urls)],
    )
    db.add(check)

    deposit_refunded: bool | None = None
    newly_missing: list[str] = []
    if payload.check_type == "before":
        rental.status = "active"
    else:
        before = db.scalars(
            select(ConditionCheck).where(
                ConditionCheck.rental_id == rental.id, ConditionCheck.check_type == "before"
            )
        ).first()
        already_missing = set(split_missing(before.missing_items)) if before else set()
        newly_missing = [i for i in payload.missing_items if i not in already_missing]

        # SIMULASI penyelesaian: uang sewa ke pemilik. Deposit kembali ke penyewa hanya
        # bila kondisi baik DAN tidak ada kelengkapan baru yang hilang; selain itu ditahan
        # penuh dan diberikan ke pemilik.
        gear = db.get(Gear, rental.gear_id)
        owner = db.scalars(select(User).where(User.id == gear.owner_id).with_for_update()).first()
        db.refresh(user, with_for_update=True)
        owner.balance += rental.rental_price
        if payload.condition == "baik" and not newly_missing:
            user.balance += rental.deposit_amount
            deposit_refunded = True
        else:
            owner.balance += rental.deposit_amount
            deposit_refunded = False
        rental.status = "completed"

    db.commit()
    db.refresh(user)
    return CheckResult(
        status=rental.status,
        balance=user.balance,
        deposit_refunded=deposit_refunded,
        newly_missing=newly_missing,
    )