import { Link } from 'react-router-dom'
import GearCard from '../components/GearCard'
import { PlusIcon } from '../components/icons'
import { useApi } from '../lib/useApi'

export default function MyGearsPage() {
  const { data: gears, loading, error } = useApi('/gears/mine')

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 lg:px-8 lg:py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Gear saya</h1>
        <Link
          to="/tambah-gear"
          className="flex items-center gap-2 rounded-xl bg-brand-yellow px-4 py-2 font-semibold text-black"
        >
          <PlusIcon className="size-5" />
          Tambah gear
        </Link>
      </div>

      {loading && <p className="mt-6 text-neutral-600">Memuat...</p>}
      {error && <p className="mt-6 text-red-700">{error}</p>}
      {gears && gears.length === 0 && (
        <p className="mt-6 text-neutral-600">
          Kamu belum menyewakan gear apa pun. Tekan Tambah gear untuk memulai.
        </p>
      )}
      {gears && gears.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {gears.map((gear) => (
            <GearCard key={gear.id} gear={gear} />
          ))}
        </div>
      )}
    </div>
  )
}