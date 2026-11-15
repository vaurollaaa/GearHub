import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatShortRange, timeLeftText } from '../lib/dates'
import { formatRupiah } from '../lib/format'
import { useApi } from '../lib/useApi'

const TABS = [
  { key: 'all', label: 'Semua' },
  { key: 'active', label: 'Aktif' },
  { key: 'pending', label: 'Menunggu' },
]

const STATUS = {
  pending: { label: 'Menunggu pengambilan', tone: 'bg-amber-100 text-amber-800' },
  active: { label: 'Sedang disewa', tone: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Selesai', tone: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Dibatalkan', tone: 'bg-neutral-200 text-neutral-700' },
}

function subtext(r) {
  if (r.status === 'active') return timeLeftText(r.end_date)
  if (r.status === 'pending') return 'Ambil gear lalu lakukan cek kondisi'
  if (r.status === 'completed') return 'Sudah dikembalikan'
  return ''
}

function RentalCard({ rental: r }) {
  const status = STATUS[r.status] ?? STATUS.cancelled
  const buttonClass = 'rounded-xl px-5 py-2 text-sm font-semibold'

  return (
    <article className="rounded-2xl border border-neutral-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold">{r.owner_name}</p>
          <p className="text-xs text-neutral-600">{formatShortRange(r.start_date, r.end_date)}</p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${status.tone}`}>
          {status.label}
        </span>
      </div>

      <Link to={`/gear/${r.gear_id}`} className="mt-3 flex items-center gap-4">
        <span className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-neutral-200">
          {r.gear_image && <img src={r.gear_image} alt="" className="size-full object-contain p-2" />}
        </span>
        <div className="min-w-0">
          <p className="font-medium">{r.gear_name}</p>
          <p className="mt-1 text-sm text-neutral-600">{subtext(r)}</p>
        </div>
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm">
          Total <span className="font-semibold">{formatRupiah(r.total_amount)}</span>
        </p>
        {r.status === 'pending' && (
          <Link
            to={`/aktivitas/${r.id}/cek?tipe=before`}
            className={`${buttonClass} bg-brand-yellow text-black`}
          >
            Cek kondisi
          </Link>
        )}
        {r.status === 'active' && (
          <Link
            to={`/aktivitas/${r.id}/cek?tipe=after`}
            className={`${buttonClass} bg-brand-yellow text-black`}
          >
            Kembalikan
          </Link>
        )}
        {r.status === 'completed' && (
          <Link to={`/gear/${r.gear_id}`} className={`${buttonClass} bg-brand-blue text-white`}>
            Sewa lagi
          </Link>
        )}
      </div>
    </article>
  )
}

export default function ActivityPage() {
  const { data, loading, error } = useApi('/rentals/mine')
  const [tab, setTab] = useState('all')

  const rentals = (data ?? []).filter((r) => tab === 'all' || r.status === tab)

  return (
    <div className="mx-auto max-w-3xl px-5 pb-10 pt-6">
      <h1 className="text-2xl font-bold">Aktivitas</h1>

      <div role="tablist" className="mt-4 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-1.5 text-base font-medium ${
              tab === t.key ? 'bg-neutral-200 text-black' : 'text-neutral-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && <p className="mt-6 text-neutral-600">Memuat...</p>}
      {error && <p className="mt-6 text-red-700">{error}</p>}
      {!loading && !error && rentals.length === 0 && (
        <p className="mt-10 text-center text-neutral-600">
          Belum ada sewa di sini.{' '}
          <Link to="/beranda" className="underline">
            Cari gear
          </Link>
        </p>
      )}

      <div className="mt-5 flex flex-col gap-4">
        {rentals.map((r) => (
          <RentalCard key={r.id} rental={r} />
        ))}
      </div>
    </div>
  )
}