import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AvailabilityCalendar from '../components/AvailabilityCalendar'
import { ArrowLeftIcon, PinIcon } from '../components/icons'
import { useAuth } from '../context/AuthContext'
import { addDays, diffDays, formatDayLong } from '../lib/dates'
import { formatRupiah, todayISO } from '../lib/format'
import { useApi } from '../lib/useApi'

function Row({ label, value }) {
  return (
    <div className="flex justify-between py-1 text-sm">
      <span className="text-neutral-700">{label}</span>
      <span className="text-black">{value}</span>
    </div>
  )
}

export default function RentRequestPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: gear, loading, error } = useApi(`/gears/${id}`)
  const { data: bookings } = useApi(`/gears/${id}/bookings`)
  const [pickup, setPickup] = useState('')
  const [ret, setRet] = useState('')
  const [calendarOpen, setCalendarOpen] = useState(false)

  const datesReady = Boolean(pickup && ret && ret > pickup)
  const {
    data: quote,
    error: quoteError,
    loading: quoteLoading,
  } = useApi(
    datesReady
      ? `/rentals/quote?gear_id=${id}&start_date=${pickup}&end_date=${ret}`
      : null,
  )

  if (loading) return <p className="p-6 text-neutral-600">Memuat...</p>
  if (error) return <p className="p-6 text-red-700">{error}</p>

  const today = todayISO()
  const minPickup = gear.available_from && gear.available_from > today ? gear.available_from : today
  const maxDate = gear.available_until ?? undefined
  const isOwner = gear.owner.id === user.id

  function handlePickup(value) {
    setPickup(value)
    if (ret && ret <= value) setRet('')
  }

  const dateInput =
    'w-full border-b border-neutral-400 bg-transparent py-2 text-sm focus:border-brand-blue focus:outline-none'

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col px-5 pb-8 pt-6">
      <header className="flex items-center gap-3 border-b border-neutral-200 pb-4">
        <Link
          to={`/gear/${id}`}
          aria-label="Kembali"
          className="flex size-10 items-center justify-center rounded-full hover:bg-neutral-100"
        >
          <ArrowLeftIcon />
        </Link>
        <h1 className="text-2xl font-bold">Ajukan sewa</h1>
      </header>

      <div className="mt-5 flex items-center gap-4">
        <span className="flex size-24 shrink-0 items-center justify-center rounded-xl bg-neutral-200">
          <img src={gear.images[0]} alt="" className="size-full object-contain p-2" />
        </span>
        <div>
          <p className="font-semibold">{gear.name}</p>
          <p className="text-sm text-neutral-700">{formatRupiah(gear.price_per_day)}/hari</p>
          <p className="mt-1 flex items-center gap-1 text-sm text-neutral-700">
            <PinIcon className="size-4" />
            {gear.pickup_location}
          </p>
        </div>
      </div>

      {isOwner ? (
        <p className="mt-8 rounded-xl bg-neutral-100 px-4 py-3 text-sm text-neutral-700">
          Ini gear milikmu, jadi tidak bisa kamu sewa sendiri.
        </p>
      ) : (
        <>
          <section className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Pilih tanggal</h2>
              <button
                type="button"
                onClick={() => setCalendarOpen(true)}
                className="text-sm text-neutral-700 underline"
              >
                Cek ketersediaan
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="pickup" className="text-xs text-neutral-500">
                  Pickup
                </label>
                <input
                  id="pickup"
                  type="date"
                  min={minPickup}
                  max={maxDate}
                  value={pickup}
                  onChange={(e) => handlePickup(e.target.value)}
                  className={dateInput}
                />
                {pickup && <p className="mt-1 text-xs text-neutral-600">{formatDayLong(pickup)}</p>}
              </div>
              <div>
                <label htmlFor="return" className="text-xs text-neutral-500">
                  Return
                </label>
                <input
                  id="return"
                  type="date"
                  min={pickup ? addDays(pickup, 1) : minPickup}
                  max={maxDate}
                  value={ret}
                  onChange={(e) => setRet(e.target.value)}
                  className={dateInput}
                />
                {ret && <p className="mt-1 text-xs text-neutral-600">{formatDayLong(ret)}</p>}
              </div>
            </div>
            {datesReady && (
              <p className="mt-2 text-xs text-neutral-600">
                Durasi sewa: {diffDays(pickup, ret)} hari
              </p>
            )}
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-semibold">Ringkasan pembayaran</h2>
            <div className="mt-2">
              <Row label="Harga" value={formatRupiah(gear.price_per_day)} />
              <Row label="Durasi" value={quote ? `${quote.days} hari` : '-'} />
              <Row
                label="Biaya layanan"
                value={quote ? formatRupiah(quote.service_fee) : '-'}
              />
              <Row
                label="Deposit jaminan"
                value={quote ? formatRupiah(quote.deposit_amount) : '-'}
              />
            </div>
            <p className="mt-2 text-xs text-neutral-500">
              Deposit akan dikembalikan ke Saldo GearHub maksimal 1x24 jam setelah checkout, jika
              kondisi gear sesuai saat pengambilan.
            </p>
            {quoteError && (
              <p role="alert" className="mt-3 text-sm font-medium text-red-700">
                {quoteError}
              </p>
            )}
          </section>
        </>
      )}

      <div className="mt-auto pt-8">
        <div className="flex items-center justify-between border-t border-neutral-200 py-4 font-semibold">
          <span>Total</span>
          <span>{quote ? formatRupiah(quote.total_amount) : '-'}</span>
        </div>
        <button
          type="button"
          disabled={isOwner || !quote || quoteLoading}
          onClick={() => navigate(`/gear/${id}/bayar?start=${pickup}&end=${ret}`)}
          className="w-full rounded-2xl bg-brand-yellow py-3.5 text-lg font-semibold text-black disabled:opacity-50"
        >
          Lanjut
        </button>
      </div>

      {calendarOpen && (
        <AvailabilityCalendar
          gear={gear}
          bookings={bookings ?? []}
          onClose={() => setCalendarOpen(false)}
        />
      )}
    </div>
  )
}