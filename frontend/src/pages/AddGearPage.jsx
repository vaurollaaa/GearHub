import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormField from '../components/FormField'
import { ArrowLeftIcon, PlusIcon, XIcon } from '../components/icons'
import MultiPhotoPicker from '../components/MultiPhotoPicker'
import Stepper from '../components/Stepper'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../lib/api'
import { CATEGORIES } from '../lib/categories'
import { formatDateRange, formatRupiah, todayISO } from '../lib/format'

const STEPS = ['Informasi gear', 'Detail gear', 'Harga', 'Review']
const CONDITIONS = [
  { value: 'sangat_baik', label: 'Sangat baik' },
  { value: 'baik', label: 'Baik' },
]
const PRICE_HINTS = {
  Kamera: 'Rp60rb–200rb',
  Lensa: 'Rp40rb–150rb',
  Audio: 'Rp30rb–100rb',
  Lighting: 'Rp80rb–150rb',
}

const newId = () => crypto.randomUUID()

function updateRow(setRows, id, key, value) {
  setRows((rows) => rows.map((row) => (row.id === id ? { ...row, [key]: value } : row)))
}

function removeRow(setRows, id) {
  setRows((rows) => rows.filter((row) => row.id !== id))
}

const smallInput =
  'min-w-0 flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-black placeholder:text-neutral-400 focus:border-brand-blue focus:outline-none'

function SectionTitle({ children }) {
  return <h2 className="text-lg font-semibold text-black">{children}</h2>
}

function ReviewBox({ children }) {
  return (
    <div className="mt-2 rounded-lg border border-neutral-300 px-3 py-2.5 text-sm">{children}</div>
  )
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-0.5">
      <span className="text-neutral-500">{label}</span>
      <span className="text-right font-medium text-black">{value}</span>
    </div>
  )
}

export default function AddGearPage() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const today = todayISO()

  const [step, setStep] = useState(1)
  const [photos, setPhotos] = useState([])
  const [form, setForm] = useState({
    name: '',
    category: '',
    summary: '',
    condition: 'sangat_baik',
    price: '',
    availableFrom: '',
    availableUntil: '',
    location: '',
  })
  const [specs, setSpecs] = useState(() => [{ id: newId(), name: '', value: '' }])
  const [items, setItems] = useState(() => [{ id: newId(), name: '' }])
  const [showAllSummary, setShowAllSummary] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const setField = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))

  const cleanSpecs = specs
    .map((s) => ({ name: s.name.trim(), value: s.value.trim() }))
    .filter((s) => s.name || s.value)
  const cleanItems = items.map((i) => i.name.trim()).filter(Boolean)
  const summaryLines = form.summary
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  function validateStep(n) {
    if (n === 1) {
      if (photos.length === 0) return 'Tambahkan minimal 1 foto barang.'
      if (photos.some((p) => p.uploading)) return 'Tunggu sampai semua foto selesai diunggah.'
      if (form.name.trim().length < 3) return 'Nama barang minimal 3 karakter.'
      if (!form.category) return 'Pilih kategori.'
      if (form.summary.trim().length < 10) return 'Ringkasan minimal 10 karakter.'
    }
    if (n === 2) {
      if (specs.some((s) => Boolean(s.name.trim()) !== Boolean(s.value.trim()))) {
        return 'Lengkapi nama dan deskripsi pada setiap spesifikasi, atau hapus barisnya.'
      }
    }
    if (n === 3) {
      const price = Number(form.price)
      if (!price || price < 1000) return 'Harga minimal Rp1.000 per hari.'
      if (!form.availableFrom || !form.availableUntil) return 'Isi tanggal mulai dan tanggal akhir.'
      if (form.availableFrom < today) return 'Tanggal mulai tidak boleh di masa lalu.'
      if (form.availableUntil < form.availableFrom) {
        return 'Tanggal akhir tidak boleh sebelum tanggal mulai.'
      }
      if (form.location.trim().length < 3) return 'Isi lokasi pengambilan.'
    }
    return ''
  }

  function goNext() {
    const message = validateStep(step)
    if (message) {
      setError(message)
      return
    }
    setError('')
    setStep(step + 1)
  }

  function goBack() {
    setError('')
    if (step > 1) setStep(step - 1)
    else navigate('/profil')
  }

  async function handleSubmit() {
    for (const n of [1, 2, 3]) {
      const message = validateStep(n)
      if (message) {
        setError(message)
        setStep(n)
        return
      }
    }

    setError('')
    setSubmitting(true)
    try {
      const data = await apiRequest('/gears', {
        method: 'POST',
        token,
        body: {
          name: form.name.trim(),
          category: form.category,
          summary: summaryLines.join('\n'),
          condition: form.condition,
          price_per_day: Number(form.price),
          pickup_location: form.location.trim(),
          available_from: form.availableFrom,
          available_until: form.availableUntil,
          image_urls: photos.map((p) => p.url),
          specs: cleanSpecs,
          items: cleanItems,
        },
      })
      navigate(`/gear/${data.id}`, { replace: true })
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  const buttonClass =
    'w-full rounded-2xl bg-brand-yellow py-3.5 text-lg font-semibold text-black disabled:opacity-50'
  const addRowClass =
    'mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 py-2.5 text-sm text-neutral-500 hover:bg-neutral-50'

  const visibleSummary = showAllSummary ? summaryLines : summaryLines.slice(0, 3)

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col px-5 pb-8 pt-6">
      <header className="flex items-center gap-3 border-b border-neutral-200 pb-4">
        <button
          type="button"
          onClick={goBack}
          aria-label="Kembali"
          className="flex size-10 items-center justify-center rounded-full hover:bg-neutral-100"
        >
          <ArrowLeftIcon />
        </button>
        <h1 className="text-2xl font-bold">Tambah gear</h1>
      </header>

      <div className="mt-6">
        <Stepper steps={STEPS} step={step} />
      </div>

      <div className="mt-6 flex-1">
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <SectionTitle>Foto barang</SectionTitle>
              <p className="mb-3 text-sm text-neutral-600">
                Foto pertama menjadi foto utama. Maksimal 8 foto.
              </p>
              <MultiPhotoPicker photos={photos} setPhotos={setPhotos} />
            </div>
            <FormField
              id="name"
              label="Nama barang"
              placeholder="Nama barang"
              value={form.name}
              onChange={setField('name')}
              maxLength={150}
            />
            <FormField
              id="category"
              label="Kategori"
              value={form.category}
              onChange={setField('category')}
            >
              <option value="">Kategori</option>
              {CATEGORIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </FormField>
            <FormField
              id="summary"
              label="Ringkasan"
              multiline
              placeholder="Jelaskan kondisi dan kegunaan gear..."
              value={form.summary}
              onChange={setField('summary')}
              maxLength={2000}
              hint="Tulis satu poin per baris. Setiap baris tampil sebagai satu butir."
            />
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-7">
            <section>
              <SectionTitle>Spesifikasi</SectionTitle>
              <div className="mt-2 flex gap-2 pr-8 text-sm text-neutral-500">
                <span className="flex-1">Nama spesifikasi</span>
                <span className="flex-1">Deskripsi</span>
              </div>
              <div className="mt-1 flex flex-col gap-2">
                {specs.map((spec) => (
                  <div key={spec.id} className="flex items-center gap-2">
                    <input
                      aria-label="Nama spesifikasi"
                      className={smallInput}
                      placeholder="Wireless Technology"
                      value={spec.name}
                      maxLength={100}
                      onChange={(e) => updateRow(setSpecs, spec.id, 'name', e.target.value)}
                    />
                    <input
                      aria-label="Deskripsi spesifikasi"
                      className={smallInput}
                      placeholder="Bluetooth"
                      value={spec.value}
                      maxLength={200}
                      onChange={(e) => updateRow(setSpecs, spec.id, 'value', e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeRow(setSpecs, spec.id)}
                      aria-label="Hapus spesifikasi"
                      className="flex size-6 shrink-0 items-center justify-center text-neutral-600"
                    >
                      <XIcon className="size-5" />
                    </button>
                  </div>
                ))}
              </div>
              {specs.length < 20 && (
                <button
                  type="button"
                  onClick={() => setSpecs((rows) => [...rows, { id: newId(), name: '', value: '' }])}
                  className={addRowClass}
                >
                  <PlusIcon className="size-4" />
                  Tambah spesifikasi
                </button>
              )}
            </section>

            <section>
              <SectionTitle>Kelengkapan</SectionTitle>
              <div className="mt-2 flex flex-col gap-2">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <input
                      aria-label="Nama kelengkapan"
                      className={smallInput}
                      placeholder="Contoh: Charging case"
                      value={item.name}
                      maxLength={150}
                      onChange={(e) => updateRow(setItems, item.id, 'name', e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeRow(setItems, item.id)}
                      aria-label="Hapus kelengkapan"
                      className="flex size-6 shrink-0 items-center justify-center text-neutral-600"
                    >
                      <XIcon className="size-5" />
                    </button>
                  </div>
                ))}
              </div>
              {items.length < 20 && (
                <button
                  type="button"
                  onClick={() => setItems((rows) => [...rows, { id: newId(), name: '' }])}
                  className={addRowClass}
                >
                  <PlusIcon className="size-4" />
                  Tambah item
                </button>
              )}
            </section>

            <fieldset>
              <legend className="text-lg font-semibold text-black">Kondisi</legend>
              <div className="mt-2 flex flex-col gap-2">
                {CONDITIONS.map((c) => (
                  <label key={c.value} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="condition"
                      value={c.value}
                      checked={form.condition === c.value}
                      onChange={setField('condition')}
                      className="size-4 accent-brand-blue"
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-6">
            <section>
              <label htmlFor="price" className="block text-lg font-semibold text-black">
                Harga
              </label>
              <div className="mt-2 flex items-center rounded-lg border border-neutral-300 bg-white px-4 focus-within:border-brand-blue">
                <span className="text-neutral-500">Rp</span>
                <input
                  id="price"
                  inputMode="numeric"
                  placeholder="Harga"
                  value={form.price}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, price: e.target.value.replace(/\D/g, '') }))
                  }
                  className="min-w-0 flex-1 bg-transparent px-2 py-3 text-base text-black placeholder:text-neutral-400 focus:outline-none"
                />
                <span className="text-neutral-500">/hari</span>
              </div>
              {form.category && PRICE_HINTS[form.category] && (
                <p className="mt-1 text-sm text-neutral-600">
                  Kisaran kategori {form.category}: {PRICE_HINTS[form.category]}/hari
                </p>
              )}
            </section>

            <section>
              <SectionTitle>Ketersediaan</SectionTitle>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="from" className="text-sm text-neutral-600">
                    Tanggal mulai
                  </label>
                  <input
                    id="from"
                    type="date"
                    min={today}
                    value={form.availableFrom}
                    onChange={setField('availableFrom')}
                    className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-3 text-sm focus:border-brand-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="until" className="text-sm text-neutral-600">
                    Tanggal akhir
                  </label>
                  <input
                    id="until"
                    type="date"
                    min={form.availableFrom || today}
                    value={form.availableUntil}
                    onChange={setField('availableUntil')}
                    className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-3 text-sm focus:border-brand-blue focus:outline-none"
                  />
                </div>
              </div>
            </section>

            <FormField
              id="location"
              label="Lokasi pengambilan"
              placeholder="Lokasi pengambilan"
              value={form.location}
              onChange={setField('location')}
              maxLength={200}
            />
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-5">
            <section>
              <SectionTitle>Review</SectionTitle>
              <div className="mt-2 flex gap-3">
                <div className="grid w-24 shrink-0 grid-cols-2 gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className="aspect-square overflow-hidden rounded bg-neutral-100"
                    >
                      {photos[i] && (
                        <img src={photos[i].preview} alt="" className="size-full object-contain" />
                      )}
                    </span>
                  ))}
                </div>
                <div>
                  <p className="font-semibold text-black">{form.name.trim()}</p>
                  <p className="text-sm text-neutral-500">{form.category}</p>
                  <p className="mt-1 font-bold text-black">
                    {formatRupiah(Number(form.price) || 0)}
                    <span className="text-sm font-normal">/hari</span>
                  </p>
                </div>
              </div>
            </section>

            <section>
              <SectionTitle>Ringkasan</SectionTitle>
              <ReviewBox>
                <ul className="list-disc space-y-1 pl-4 text-neutral-700">
                  {visibleSummary.map((line, i) => (
                    <li key={`${i}-${line}`}>{line}</li>
                  ))}
                </ul>
                {summaryLines.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setShowAllSummary((v) => !v)}
                    className="mt-2 font-medium text-brand-blue"
                  >
                    {showAllSummary ? 'Lebih sedikit' : 'Selengkapnya'}
                  </button>
                )}
              </ReviewBox>
            </section>

            <section>
              <SectionTitle>Detail</SectionTitle>
              <ReviewBox>
                <ReviewRow
                  label="Ketersediaan"
                  value={formatDateRange(form.availableFrom, form.availableUntil)}
                />
                <ReviewRow label="Lokasi pengambilan" value={form.location.trim()} />
                <ReviewRow
                  label="Kondisi"
                  value={CONDITIONS.find((c) => c.value === form.condition)?.label}
                />
              </ReviewBox>
            </section>

            {cleanSpecs.length > 0 && (
              <section>
                <SectionTitle>Spesifikasi</SectionTitle>
                <ReviewBox>
                  {cleanSpecs.map((s) => (
                    <ReviewRow key={`${s.name}-${s.value}`} label={s.name} value={s.value} />
                  ))}
                </ReviewBox>
              </section>
            )}

            {cleanItems.length > 0 && (
              <section>
                <SectionTitle>Kelengkapan</SectionTitle>
                <div className="mt-2 flex flex-wrap gap-2">
                  {cleanItems.map((name, i) => (
                    <span
                      key={`${i}-${name}`}
                      className="rounded-full border border-neutral-300 bg-neutral-100 px-3 py-1 text-xs"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <div className="mt-6">
        {step < 4 ? (
          <button type="button" onClick={goNext} className={buttonClass}>
            Lanjut
          </button>
        ) : (
          <button type="button" onClick={handleSubmit} disabled={submitting} className={buttonClass}>
            {submitting ? 'Menyimpan...' : 'Simpan dan tampilkan'}
          </button>
        )}
      </div>
    </div>
  )
}