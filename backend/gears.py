from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from auth import get_current_user
from database import get_db
from models import Gear, GearImage, GearItem, GearSpec, User
from permissions import require_verified
from verification import CLOUDINARY_PREFIX

router = APIRouter(prefix="/gears", tags=["gears"])

ALLOWED_CATEGORIES = {"Kamera", "Lensa", "Audio", "Lighting"}
ALLOWED_CONDITIONS = {"sangat_baik", "baik"}


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


class SpecIn(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(min_length=1, max_length=100)
    value: str = Field(min_length=1, max_length=200)


class GearCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(min_length=3, max_length=150)
    category: str
    summary: str = Field(min_length=10, max_length=2000)
    condition: str
    price_per_day: int = Field(ge=1000, le=10_000_000)
    pickup_location: str = Field(min_length=3, max_length=200)
    available_from: date
    available_until: date
    image_urls: list[str] = Field(min_length=1, max_length=8)
    specs: list[SpecIn] = Field(default_factory=list, max_length=20)
    items: list[str] = Field(default_factory=list, max_length=20)

    @field_validator("category")
    @classmethod
    def check_category(cls, v: str) -> str:
        if v not in ALLOWED_CATEGORIES:
            raise ValueError("Kategori tidak valid")
        return v

    @field_validator("condition")
    @classmethod
    def check_condition(cls, v: str) -> str:
        if v not in ALLOWED_CONDITIONS:
            raise ValueError("Kondisi tidak valid")
        return v

    @field_validator("image_urls")
    @classmethod
    def check_images(cls, urls: list[str]) -> list[str]:
        for url in urls:
            if not url.startswith(CLOUDINARY_PREFIX) or len(url) > 500:
                raise ValueError("URL foto tidak valid")
        return urls

    @field_validator("items")
    @classmethod
    def clean_items(cls, items: list[str]) -> list[str]:
        cleaned = [i.strip() for i in items if i.strip()]
        if any(len(i) > 150 for i in cleaned):
            raise ValueError("Nama kelengkapan terlalu panjang (maks. 150 karakter)")
        return cleaned

    @model_validator(mode="after")
    def check_dates(self):
        if self.available_from < date.today():
            raise ValueError("Tanggal mulai tidak boleh di masa lalu")
        if self.available_until < self.available_from:
            raise ValueError("Tanggal akhir tidak boleh sebelum tanggal mulai")
        return self


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
    stmt = stmt.order_by(Gear.id.desc()).limit(limit)
    return [to_card(g) for g in db.scalars(stmt).all()]


# Penting: "/mine" harus didefinisikan SEBELUM "/{gear_id}".
@router.get("/mine", response_model=list[GearCard])
def my_gears(
    db: Session = Depends(get_db),
    user: User = Depends(require_verified),
):
    stmt = (
        select(Gear)
        .where(Gear.owner_id == user.id)
        .options(selectinload(Gear.images))
        .order_by(Gear.id.desc())
    )
    return [to_card(g) for g in db.scalars(stmt).all()]


@router.post("", response_model=GearCard, status_code=201)
def create_gear(
    payload: GearCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_verified),
):
    gear = Gear(
        owner_id=user.id,
        name=payload.name,
        category=payload.category,
        summary=payload.summary,
        condition=payload.condition,
        price_per_day=payload.price_per_day,
        pickup_location=payload.pickup_location,
        available_from=payload.available_from,
        available_until=payload.available_until,
    )
    gear.images = [GearImage(url=u, position=i) for i, u in enumerate(payload.image_urls)]
    gear.specs = [GearSpec(name=s.name, value=s.value) for s in payload.specs]
    gear.items = [GearItem(name=n) for n in payload.items]
    db.add(gear)
    db.commit()
    db.refresh(gear)
    return to_card(gear)


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