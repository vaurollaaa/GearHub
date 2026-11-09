from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from auth import get_current_user
from database import get_db
from models import Gear, User

router = APIRouter(prefix="/gears", tags=["gears"])


class GearCard(BaseModel):
    id: int
    name: str
    category: str
    price_per_day: int
    pickup_location: str
    rating_avg: float
    rating_count: int
    image_url: str | None


class OwnerOut(BaseModel):
    id: int
    full_name: str
    verification_status: str


class SpecOut(BaseModel):
    name: str
    value: str


class GearDetail(GearCard):
    condition: str
    highlights: list[str]
    images: list[str]
    specs: list[SpecOut]
    items: list[str]
    available_from: date | None
    available_until: date | None
    owner: OwnerOut


def sorted_image_urls(gear: Gear) -> list[str]:
    return [img.url for img in sorted(gear.images, key=lambda i: i.position)]


def to_card(gear: Gear) -> GearCard:
    urls = sorted_image_urls(gear)
    return GearCard(
        id=gear.id,
        name=gear.name,
        category=gear.category,
        price_per_day=gear.price_per_day,
        pickup_location=gear.pickup_location,
        rating_avg=gear.rating_avg,
        rating_count=gear.rating_count,
        image_url=urls[0] if urls else None,
    )


@router.get("", response_model=list[GearCard])
def list_gears(
    category: str | None = None,
    q: str | None = Query(default=None, max_length=100),
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    stmt = select(Gear).where(Gear.is_active.is_(True)).options(selectinload(Gear.images))
    if category:
        stmt = stmt.where(Gear.category.ilike(category))
    if q and q.strip():
        stmt = stmt.where(Gear.name.ilike(f"%{q.strip()}%"))
    stmt = stmt.order_by(Gear.id).limit(limit)
    return [to_card(g) for g in db.scalars(stmt).all()]


@router.get("/{gear_id}", response_model=GearDetail)
def get_gear(
    gear_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    stmt = (
        select(Gear)
        .where(Gear.id == gear_id, Gear.is_active.is_(True))
        .options(selectinload(Gear.images), selectinload(Gear.specs), selectinload(Gear.items))
    )
    gear = db.scalars(stmt).first()
    if gear is None:
        raise HTTPException(status_code=404, detail="Gear tidak ditemukan")

    owner = db.get(User, gear.owner_id)
    card = to_card(gear)
    return GearDetail(
        **card.model_dump(),
        condition=gear.condition,
        highlights=[line for line in (gear.summary or "").splitlines() if line.strip()],
        images=sorted_image_urls(gear),
        specs=[SpecOut(name=s.name, value=s.value) for s in gear.specs],
        items=[i.name for i in gear.items],
        available_from=gear.available_from,
        available_until=gear.available_until,
        owner=OwnerOut(
            id=owner.id,
            full_name=owner.full_name,
            verification_status=owner.verification_status,
        ),
    )