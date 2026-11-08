from database import Base, engine
import models  # noqa: F401  (supaya semua tabel terdaftar)

Base.metadata.create_all(bind=engine)
print("Tabel berhasil dibuat")