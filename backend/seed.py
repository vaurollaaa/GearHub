import secrets
from datetime import date, timedelta

from sqlalchemy import select

from database import SessionLocal
from models import Gear, GearImage, GearItem, GearSpec, User
from security import hash_password

SEED_DOMAIN = "@seed.gearhub.ac.id"

OWNERS = {
    "william": ("William Parker", f"william.parker{SEED_DOMAIN}"),
    "emma": ("Emma Collins", f"emma.collins{SEED_DOMAIN}"),
    "olivia": ("Olivia Bennett", f"olivia.bennett{SEED_DOMAIN}"),
    "ethan": ("Ethan Walker", f"ethan.walker{SEED_DOMAIN}"),
}


def photos(name: str, order: list[int]) -> list[str]:
    return [f"/gears/gear_{name}_{n}.webp" for n in order]


GEARS = [
    {
        "owner": "emma", "name": "FUJIFILM XF50mm F2 R WR", "category": "Lensa",
        "price": 120000, "location": "BSD City", "condition": "sangat_baik",
        "rating": (4.8, 12), "images": photos("fujifilm_xf", [1, 2, 3]),
        "highlights": ["APS-C | f/2", "50mm (setara 76mm full-frame)",
                       "Tahan cipratan dan debu (WR)", "Ringkas dan ringan untuk potret"],
        "specs": [("Mount", "Fujifilm X"), ("Panjang fokus", "50 mm (setara 76 mm)"),
                  ("Bukaan maksimum", "f/2"), ("Diameter filter", "46 mm"), ("Berat", "±200 g")],
        "items": ["Lens cap depan", "Lens cap belakang", "Tudung lensa (hood)", "Pouch lensa"],
    },
    {
        "owner": "william", "name": "GoPro Hero 12 Black", "category": "Kamera",
        "price": 170000, "location": "Gading Serpong", "condition": "sangat_baik",
        "rating": (4.9, 5), "images": photos("gopro_hero12", [1, 2, 3, 4]),
        "highlights": ["Video 5.3K60 dan 4K120", "Stabilisasi HyperSmooth 6.0",
                       "Tahan air hingga 10 m tanpa casing", "Layar depan dan belakang"],
        "specs": [("Resolusi video", "5.3K 60 fps"), ("Foto", "27 MP"),
                  ("Tahan air", "10 m"), ("Baterai", "Enduro 1720 mAh")],
        "items": ["Kamera GoPro Hero 12", "Baterai Enduro", "Kabel USB-C", "Mounting clip"],
    },
    {
        "owner": "olivia", "name": "Saramonic Blink 500 T4 Wireless Microphone", "category": "Audio",
        "price": 90000, "location": "Kelapa Dua", "condition": "baik",
        "rating": (4.9, 20), "images": photos("saramonic_blink500", [3, 1, 2, 4]),
        "highlights": ["Mikrofon wireless 2.4 GHz", "Cocok untuk wawancara dan vlog",
                       "Sudah dengan charging case", "Setup cepat, tanpa kabel"],
        "specs": [("Frekuensi", "2.4 GHz"), ("Jangkauan", "Hingga ±100 m (tanpa halangan)"),
                  ("Jumlah transmitter", "4"), ("Daya tahan baterai", "Hingga ±7 jam")],
        "items": ["4 unit transmitter", "1 unit receiver", "Kabel lavalier", "Charging case"],
    },
    {
        "owner": "william", "name": "Godox SZ150R RGB LED Video Light", "category": "Lighting",
        "price": 150000, "location": "Gading Serpong", "condition": "sangat_baik",
        "rating": (4.9, 20), "images": photos("godox_sz150r", [1, 2, 3, 4]),
        "highlights": ["Lampu video LED 150 W", "Mode RGB dan bi-color",
                       "Mount Bowens", "Bisa di-zoom"],
        "specs": [("Daya", "150 W"), ("Mode warna", "RGB dan bi-color"),
                  ("Mount", "Bowens"), ("Zoom", "Ya")],
        "items": ["Unit lampu", "Reflektor", "Adaptor daya", "Tas pelindung"],
    },
    {
        "owner": "ethan", "name": "Godox V1 Pro Round Head Flash", "category": "Lighting",
        "price": 100000, "location": "Kelapa Dua", "condition": "baik",
        "rating": (4.7, 9), "images": photos("godox_v1pro", [1, 2, 3]),
        "highlights": ["Flash speedlight kepala bulat", "TTL dan High-Speed Sync",
                       "Cahaya lembut dan merata", "Cocok untuk potret dan event"],
        "specs": [("Tipe", "Speedlight kepala bulat (TTL)"), ("Daya", "76 Ws"),
                  ("Baterai", "Li-ion 2600 mAh"), ("Sistem wireless", "2.4 GHz")],
        "items": ["Flash V1 Pro", "Baterai Li-ion", "Charger", "Pouch"],
    },
    {
        "owner": "emma", "name": "Insta360 X5", "category": "Kamera",
        "price": 150000, "location": "Gading Serpong", "condition": "sangat_baik",
        "rating": (4.7, 13), "images": photos("insta360_x5", [1, 2, 3, 4]),
        "highlights": ["Kamera 360° hingga 8K", "Tahan air hingga 15 m",
                       "Stabilisasi dan horizon lock", "Cocok untuk vlog dan aktivitas"],
        "specs": [("Video", "8K 30 fps (360°)"), ("Foto", "72 MP"),
                  ("Tahan air", "15 m"), ("Baterai", "2400 mAh")],
        "items": ["Kamera Insta360 X5", "Baterai", "Kabel USB-C", "Pouch"],
    },
    {
        "owner": "ethan", "name": "DJI RS 5 Gimbal", "category": "Kamera",
        "price": 150000, "location": "BSD City", "condition": "baik",
        "rating": (4.8, 7), "images": photos("dji_rs5", [1, 2, 3]),
        "highlights": ["Gimbal 3-axis untuk kamera mirrorless", "Beban hingga 3 kg",
                       "Baterai tahan hingga 13 jam", "Layar OLED untuk kontrol cepat"],
        "specs": [("Stabilisasi", "3-axis"), ("Beban maksimum", "3 kg"),
                  ("Daya tahan baterai", "Hingga 13 jam")],
        "items": ["Gimbal DJI RS 5", "Quick-release plate", "Tripod lipat",
                  "Kabel kontrol kamera", "Tas pelindung"],
    },
    {
        "owner": "olivia", "name": "Nikon Z5 Body", "category": "Kamera",
        "price": 200000, "location": "Gading Serpong", "condition": "sangat_baik",
        "rating": (4.9, 15), "images": photos("nikon_z5", [1, 2, 3]),
        "highlights": ["Mirrorless full-frame 24,3 MP", "Stabilisasi IBIS 5-sumbu",
                       "Video 4K", "Dua slot kartu SD"],
        "specs": [("Sensor", "Full-frame 24,3 MP"), ("Mount", "Nikon Z"),
                  ("Video", "4K 30p"), ("Stabilisasi", "IBIS 5-sumbu")],
        "items": ["Body kamera Nikon Z5", "Baterai EN-EL15c", "Charger", "Strap", "Body cap"],
    },
    {
        "owner": "emma", "name": "Fujifilm Instax Mini 99", "category": "Kamera",
        "price": 60000, "location": "Kelapa Dua", "condition": "baik",
        "rating": (4.6, 18), "images": photos("instax_mini99", [1, 2, 3, 4]),
        "highlights": ["Kamera instan film Instax Mini", "Efek warna 10 pilihan",
                       "Mode makro untuk objek dekat", "Hasil foto langsung jadi"],
        "specs": [("Format film", "Instax Mini"), ("Efek warna", "10 pilihan"),
                  ("Mode", "Makro dan otomatis")],
        "items": ["Kamera Instax Mini 99", "Strap", "Baterai AA"],
    },
    {
        "owner": "ethan", "name": "RODE VideoMic GO II", "category": "Audio",
        "price": 40000, "location": "BSD City", "condition": "sangat_baik",
        "rating": (4.9, 11), "images": photos("rode_videomic_go2", [1, 2, 3]),
        "highlights": ["Mikrofon on-camera yang ringkas", "Koneksi 3,5 mm dan USB",
                       "Suara jernih untuk vlog dan wawancara", "Ringan, hanya sekitar 85 g"],
        "specs": [("Tipe", "Mikrofon directional"), ("Koneksi", "3,5 mm TRS dan USB-C"),
                  ("Berat", "±85 g")],
        "items": ["Mikrofon VideoMic GO II", "Windshield (deadcat)",
                  "Kabel 3,5 mm", "Kabel USB-C"],
    },
]


def main():
    db = SessionLocal()
    try:
        # Hapus semua akun contoh lama (termasuk nama sebelumnya) beserta gear-nya.
        old_owners = db.scalars(select(User).where(User.email.like(f"%{SEED_DOMAIN}"))).all()
        for owner in old_owners:
            for gear in db.scalars(select(Gear).where(Gear.owner_id == owner.id)).all():
                db.delete(gear)
        db.flush()
        for owner in old_owners:
            db.delete(owner)
        db.flush()

        owner_ids = {}
        for key, (full_name, email) in OWNERS.items():
            user = User(
                full_name=full_name,
                email=email,
                password_hash=hash_password(secrets.token_urlsafe(32)),
                campus="Universitas Multimedia Nusantara",
                verification_status="verified",
            )
            db.add(user)
            db.flush()
            owner_ids[key] = user.id

        today = date.today()
        for data in GEARS:
            gear = Gear(
                owner_id=owner_ids[data["owner"]],
                name=data["name"],
                category=data["category"],
                summary="\n".join(data["highlights"]),
                condition=data["condition"],
                price_per_day=data["price"],
                pickup_location=data["location"],
                available_from=today,
                available_until=today + timedelta(days=90),
                rating_avg=data["rating"][0],
                rating_count=data["rating"][1],
            )
            gear.images = [GearImage(url=u, position=i) for i, u in enumerate(data["images"])]
            gear.specs = [GearSpec(name=n, value=v) for n, v in data["specs"]]
            gear.items = [GearItem(name=n) for n in data["items"]]
            db.add(gear)

        db.commit()
        print(f"Seed selesai: {len(GEARS)} gear, {len(OWNERS)} pemilik.")
    finally:
        db.close()


if __name__ == "__main__":
    main()