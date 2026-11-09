import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CategoryCard from '../components/CategoryCard'
import GearCard from '../components/GearCard'
import { ArrowRightIcon, BellIcon, ChevronDownIcon, PinIcon, SearchIcon } from '../components/icons'
import { useAuth } from '../context/AuthContext'
import { CATEGORIES } from '../lib/categories'
import { initials } from '../lib/format'
import { useApi } from '../lib/useApi'

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const { data: gears, loading, error } = useApi('/gears?limit=8')

  function handleSearch(event) {
    event.preventDefault()
    const q = query.trim()
    navigate(q ? `/pencarian?q=${encodeURIComponent(q)}` : '/pencarian')
  }

  return (
    <div>
      <header className="relative overflow-hidden bg-brand-blue pb-14 text-white">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-28 size-80 rounded-full bg-linear-to-b from-brand-yellow/50 to-transparent"
        />
        <div
          aria-hidden="true"
          className="absolute -left-20 top-40 size-64 rounded-full bg-linear-to-b from-brand-yellow/30 to-transparent"
        />

        <div className="relative mx-auto max-w-5xl px-5 pt-6 lg:px-8 lg:pt-10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <PinIcon className="size-6" />
              <div>
                <p className="text-sm">Lokasi kamu</p>
                <p className="flex items-center gap-1 text-lg font-semibold">
                  Gading Serpong <ChevronDownIcon className="size-5" />
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex size-12 items-center justify-center rounded-xl bg-white/25"
              >
                <BellIcon className="size-6" />
              </span>
              <span
                title={user.full_name}
                className="flex size-12 items-center justify-center rounded-xl bg-brand-yellow text-lg font-bold text-black"
              >
                {initials(user.full_name)}
              </span>
            </div>
          </div>

          <form onSubmit={handleSearch} className="mt-5 lg:max-w-xl">
            <label htmlFor="home-search" className="sr-only">
              Cari gear
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-500">
              <SearchIcon className="size-6 shrink-0" />
              <input
                id="home-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari gear..."
                className="w-full bg-transparent text-base text-black placeholder:text-neutral-400 focus:outline-none"
              />
            </div>
          </form>

          <div className="mt-8 flex items-center justify-between gap-4">
            <div className="max-w-sm">
              <h1 className="text-2xl font-semibold leading-tight sm:text-3xl">
                Punya ide, tapi belum punya gear?
              </h1>
              <p className="mt-3 text-sm sm:text-base">
                Temukan perlengkapan yang kamu butuhkan untuk project berikutnya.
              </p>
              <Link
                to="/pencarian"
                className="mt-4 inline-block rounded-full bg-white px-5 py-2 text-sm font-semibold text-brand-blue"
              >
                Telusuri
              </Link>
            </div>
            <img
              src="/gears/cat_kamera.webp"
              alt=""
              className="w-36 shrink-0 sm:w-48 lg:w-64"
            />
          </div>
        </div>
      </header>

      <div className="relative -mt-8 rounded-t-[2rem] bg-white">
        <div className="mx-auto max-w-5xl px-5 py-6 lg:px-8">
          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Kategori</h2>
              <Link to="/pencarian" aria-label="Lihat semua kategori">
                <ArrowRightIcon />
              </Link>
            </div>
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {CATEGORIES.map((c) => (
                <CategoryCard
                  key={c.name}
                  {...c}
                  onClick={() => navigate(`/pencarian?kategori=${c.name}`)}
                />
              ))}
            </div>
          </section>

          <section className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Terdekat untukmu</h2>
              <Link to="/pencarian" aria-label="Lihat semua gear">
                <ArrowRightIcon />
              </Link>
            </div>
            {loading && <p className="mt-4 text-neutral-600">Memuat...</p>}
            {error && <p className="mt-4 text-red-700">{error}</p>}
            {gears && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-4 lg:overflow-visible">
                {gears.map((gear) => (
                  <GearCard key={gear.id} gear={gear} className="w-44 shrink-0 lg:w-auto" />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}