import { useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeftIcon, CheckIcon, XIcon } from '../components/icons'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../lib/api'
import { formatRupiah } from '../lib/format'
import { uploadPhoto } from '../lib/uploadPhotos'
import { useApi } from '../lib/useApi'

const MAX_PHOTOS = 6

export default function ConditionCheckPage() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const type = params.get('tipe') === 'after' ? 'after' : 'before'
  const navigate = useNavigate()
  const { token, updateUser } = useAuth()
  const { data: rental, loading, error: loadError } = useApi(`/rentals/${id}`)

  const fileRef = useRef(null)
  const [photos, setPhotos] = useState([])
  const [uploading, setUploading] = useState(false)
  const [newMissing, setNewMissing] = useState([])
  const [condition, setCondition] = useState('baik')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(null)

  if (loading) return <p className="p-6 text-neutral-600">Memuat...</p>
  if (loadError) return <p className="p-6 text-red-700">{loadError}</p>

  const expectedStatus = type === 'before' ? 'pending' : 'active'
  if (!done && rental.status !== expectedStatus) {
    return (
      <div className="p-6">
        <p className="text-neutral-700">Cek kondisi ini sudah tidak tersedia untuk sewa tersebut.</p>
        <Link to="/aktivitas" className="mt-3 inline-block underline">
          Kembali ke Aktivitas
        </Link>
      </div>
    )
  }

  // Saat pengembalian, barang yang sudah tidak ada sejak pickup tidak bisa diubah
  // dan tidak dihitung sebagai kelengkapan hilang.
  const alreadyMissing = type === 'after' ? rental.before_missing : []
  const allMissing = [...alreadyMissing, ...newMissing]
  const damaged = condition === 'ada_kerusakan'
  const depositAtRisk = type === 'after' && (damaged || newMissing.length > 0)

  async function handleFiles(event) {
    const files = Array.from(event.target.files ?? []).slice(0, MAX_PHOTOS - photos.length)
    event.target.value = ''
    if (files.length === 0) return
    setError('')
    setUploading(true)
    try {
      const urls = await Promise.all(files.map(uploadPhoto))
      setPhotos((prev) => [...prev, ...urls])
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  function toggleMissing(name) {
    setNewMissing((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    )
  }

  async function handleSubmit() {
    setError('')
    if (photos.length === 0) {
      setError('Unggah minimal 1 foto kondisi gear')
      return
    }
    setSubmitting(true)
    try {
      const data = await apiRequest(`/rentals/${id}/check`, {
        method: 'POST',
        token,
        body: {
          check_type: type,
          condition,
          notes,
          missing_items: allMissing,
          photo_urls: photos,
        },
      })
      updateUser((prev) => ({ ...prev, balance: data.balance }))
      setDone(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    let message = 'Sewa kamu sekarang berstatus Sedang disewa. Jangan lupa kembalikan sesuai jadwal.'
    if (type === 'after') {
      if (done.deposit_refunded) {
        message = `Deposit ${formatRupiah(rental.deposit_amount)} sudah dikembalikan ke Saldo GearHub kamu.`
      } else if (done.newly_missing.length > 0) {
        message = `Deposit ditahan dan diberikan ke pemilik karena kelengkapan tidak lengkap: ${done.newly_missing.join(', ')}.`
      } else {
        message = 'Karena ada kerusakan, deposit ditahan dan diberikan ke pemilik gear.'
      }
    }

    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-5 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-green-600 text-white">
          <CheckIcon className="size-8" />
        </span>
        <h1 className="mt-4 text-2xl font-bold">
          {type === 'before' ? 'Kondisi awal tercatat' : 'Gear sudah dikembalikan'}
        </h1>
        <p className="mt-2 text-neutral-700">{message}</p>
        <p className="mt-2 text-xs text-neutral-500">Semua transaksi ini simulasi.</p>
        <button
          type="button"
          onClick={() => navigate('/aktivitas', { replace: true })}
          className="mt-6 w-full rounded-2xl bg-brand-yellow py-3.5 text-lg font-semibold text-black"
        >
          Kembali ke Aktivitas
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col px-5 pb-8 pt-6">
      <header className="flex items-center gap-3 border-b border-neutral-200 pb-4">
        <Link
          to="/aktivitas"
          aria-label="Kembali"
          className="flex size-10 items-center justify-center rounded-full hover:bg-neutral-100"
        >
          <ArrowLeftIcon />
        </Link>
        <h1 className="text-2xl font-bold">Cek kondisi</h1>
      </header>

      <p className="mt-4 font-semibold">{rental.gear_name}</p>
      <p className="text-sm text-neutral-600">
        {type === 'before'
          ? 'Cek gear saat kamu mengambilnya dari pemilik.'
          : 'Cek gear sebelum kamu mengembalikannya ke pemilik.'}
      </p>

      <section className="mt-6">
        <h2 className="text-lg font-semibold">Foto gear</h2>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {photos.map((url) => (
            <div key={url} className="relative aspect-square overflow-hidden rounded-xl bg-neutral-200">
              <img src={url} alt="" className="absolute inset-0 size-full object-cover" />
              <button
                type="button"
                aria-label="Hapus foto"
                onClick={() => setPhotos((prev) => prev.filter((u) => u !== url))}
                className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white"
              >
                <XIcon className="size-4" />
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-neutral-400 text-sm text-neutral-600 disabled:opacity-50"
            >
              {uploading ? 'Mengunggah...' : '+ Foto'}
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFiles}
          className="hidden"
        />
        <p className="mt-2 text-xs text-neutral-500">Minimal 1 foto, maksimal {MAX_PHOTOS}.</p>
      </section>

      {rental.gear_items.length > 0 && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold">Kelengkapan</h2>
          <p className="text-xs text-neutral-500">Hilangkan centang untuk barang yang tidak ada.</p>
          <ul className="mt-3 flex flex-col gap-2">
            {rental.gear_items.map((name) => {
              const wasMissing = alreadyMissing.includes(name)
              return (
                <li key={name}>
                  <label
                    className={`flex items-center gap-3 ${
                      wasMissing ? 'cursor-not-allowed text-neutral-400' : 'cursor-pointer'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!wasMissing && !newMissing.includes(name)}
                      disabled={wasMissing}
                      onChange={() => toggleMissing(name)}
                      className="size-4 accent-brand-blue"
                    />
                    <span>
                      {name}
                      {wasMissing && <span className="ml-2 text-xs">(tidak ada sejak pickup)</span>}
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <fieldset className="mt-6">
        <legend className="text-lg font-semibold">Kondisi</legend>
        <div className="mt-3 flex gap-6">
          {[
            { value: 'baik', label: 'Baik' },
            { value: 'ada_kerusakan', label: 'Ada kerusakan' },
          ].map((opt) => (
            <label key={opt.value} className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="condition"
                value={opt.value}
                checked={condition === opt.value}
                onChange={() => setCondition(opt.value)}
                className="size-4 accent-brand-blue"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>

      {depositAtRisk && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {damaged && newMissing.length > 0
            ? 'Ada kerusakan dan kelengkapan yang tidak ada. '
            : damaged
              ? 'Ada kerusakan. '
              : 'Ada kelengkapan yang tidak ada. '}
          Deposit {formatRupiah(rental.deposit_amount)} akan ditahan dan diberikan ke pemilik gear.
        </p>
      )}

      <section className="mt-6">
        <label htmlFor="notes" className="text-lg font-semibold">
          Catatan <span className="text-sm font-normal text-neutral-500">(opsional)</span>
        </label>
        <textarea
          id="notes"
          rows={3}
          maxLength={800}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-2 w-full rounded-lg border border-neutral-300 p-3 text-sm focus:border-brand-blue focus:outline-none"
        />
      </section>

      {error && (
        <p role="alert" className="mt-4 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <div className="mt-auto pt-8">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || uploading}
          className="w-full rounded-2xl bg-brand-yellow py-3.5 text-lg font-semibold text-black disabled:opacity-50"
        >
          {submitting ? 'Menyimpan...' : 'Konfirmasi kondisi'}
        </button>
      </div>
    </div>
  )
}