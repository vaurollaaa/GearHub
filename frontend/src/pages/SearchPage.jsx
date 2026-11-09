import { useSearchParams } from 'react-router-dom'
import GearCard from '../components/GearCard'
import { ChevronDownIcon, SearchIcon } from '../components/icons'
import { useApi } from '../lib/useApi'
import { useDebounced } from '../lib/useDebounced'

const FILTERS = ['Semua', 'Kamera', 'Lensa', 'Audio', 'Lighting']

export default function SearchPage() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const kategori = params.get('kategori') ?? 'Semua'
  const debouncedQ = useDebounced(q, 300)

  const apiParams = new URLSearchParams()
  if (debouncedQ.trim()) apiParams.set('q', debouncedQ.trim())
  if (kategori !== 'Semua') apiParams.set('category', kategori)
  const { data: gears, loading, error } = useApi(`/gears?${apiParams}`)

  function update(key, value) {
    const next = new URLSearchParams(params)
    if (value && value !== 'Semua') next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 lg:px-8 lg:py-10">
      <h1 className="text-2xl font-bold">Pencarian</h1>
      <p className="mt-1 flex items-center gap-1 text-sm">
        Gading Serpong <ChevronDownIcon className="size-4" />
      </p>

      <div className="mt-5 flex items-center gap-3 rounded-xl border border-neutral-500 px-4 py-3 text-neutral-500 lg:max-w-xl">
        <SearchIcon className="size-6 shrink-0" />
        <label htmlFor="search" className="sr-only">
          Cari gear
        </label>
        <input
          id="search"
          type="search"
          value={q}
          onChange={(e) => update('q', e.target.value)}
          placeholder="Cari gear..."
          className="w-full bg-transparent text-base text-black placeholder:text-neutral-400 focus:outline-none"
        />
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => update('kategori', name)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium ${
              kategori === name
                ? 'border-black bg-black text-white'
                : 'border-neutral-300 text-neutral-500'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {loading && <p className="mt-6 text-neutral-600">Memuat...</p>}
      {error && <p className="mt-6 text-red-700">{error}</p>}
      {gears && gears.length === 0 && (
        <p className="mt-6 text-neutral-600">Gear tidak ditemukan.</p>
      )}
      {gears && gears.length > 0 && (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {gears.map((gear) => (
            <GearCard key={gear.id} gear={gear} />
          ))}
        </div>
      )}
    </div>
  )
}