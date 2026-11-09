import { useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftIcon, PinIcon, StarIcon } from '../components/icons'
import { formatRupiah, initials } from '../lib/format'
import { useApi } from '../lib/useApi'

const TABS = ['Ringkasan', 'Spesifikasi', 'Kelengkapan']
const CONDITION_LABEL = { sangat_baik: 'Sangat baik', baik: 'Baik' }

export default function DetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { data: gear, loading, error } = useApi(`/gears/${id}`)
  const [tab, setTab] = useState('Ringkasan')
  const [slide, setSlide] = useState(0)
  const sliderRef = useRef(null)

  function goBack() {
    if (location.key === 'default') navigate('/beranda')
    else navigate(-1)
  }

  function handleScroll() {
    const el = sliderRef.current
    if (el) setSlide(Math.round(el.scrollLeft / el.clientWidth))
  }

  if (loading) return <p className="p-6 text-neutral-600">Memuat...</p>
  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-700">{error}</p>
        <button type="button" onClick={goBack} className="mt-4 underline">
          Kembali
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl pb-10 lg:grid lg:grid-cols-2 lg:gap-10 lg:px-8 lg:py-10">
      <div className="relative overflow-hidden rounded-b-3xl bg-neutral-200 lg:rounded-3xl">
        <button
          type="button"
          onClick={goBack}
          aria-label="Kembali"
          className="absolute left-4 top-4 z-10 flex size-11 items-center justify-center rounded-xl bg-white"
        >
          <ArrowLeftIcon />
        </button>

        <div
          ref={sliderRef}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {gear.images.map((url) => (
            <div
              key={url}
              className="relative aspect-[4/3] w-full shrink-0 snap-center lg:aspect-square"
            >
              <img
                src={url}
                alt={gear.name}
                className="absolute inset-0 size-full object-contain p-8"
              />
            </div>
          ))}
        </div>

        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
          {gear.images.map((url, i) => (
            <span
              key={url}
              className={`h-1.5 rounded-full ${
                i === slide ? 'w-7 bg-brand-blue' : 'w-5 bg-neutral-400'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="px-5 pt-5 lg:px-0 lg:pt-0">
        <h1 className="text-xl font-medium sm:text-2xl">{gear.name}</h1>

        <div className="mt-2 flex items-center justify-between">
          <p className="text-3xl font-bold">
            {formatRupiah(gear.price_per_day)}
            <span className="text-base font-normal">/hari</span>
          </p>
          <p className="flex items-center gap-1 text-lg">
            <StarIcon className="size-5 text-brand-yellow" />
            {gear.rating_avg.toFixed(1)} ({gear.rating_count})
          </p>
        </div>

        <div className="mt-5 flex items-center gap-3 border-y border-neutral-200 py-4">
          <span className="flex size-12 items-center justify-center rounded-xl bg-linear-to-b from-brand-yellow to-amber-600 text-lg font-bold text-white">
            {initials(gear.owner.full_name)}
          </span>
          <div>
            <p className="font-semibold">{gear.owner.full_name}</p>
            <p className="flex items-center gap-1 text-sm text-neutral-700">
              <PinIcon className="size-4" />
              {gear.pickup_location}
            </p>
          </div>
        </div>

        <div role="tablist" className="mt-5 flex gap-2 overflow-x-auto">
          {TABS.map((name) => (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={tab === name}
              onClick={() => setTab(name)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-base font-medium ${
                tab === name ? 'bg-neutral-200 text-black' : 'text-neutral-500'
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="mt-4 min-h-36">
          {tab === 'Ringkasan' && (
            <>
              <ul className="list-disc space-y-1 pl-5">
                {gear.highlights.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-neutral-700">
                Kondisi: {CONDITION_LABEL[gear.condition] ?? gear.condition}
              </p>
            </>
          )}
          {tab === 'Spesifikasi' && (
            <dl className="divide-y divide-neutral-200">
              {gear.specs.map((spec) => (
                <div key={spec.name} className="flex justify-between gap-4 py-2">
                  <dt className="text-neutral-700">{spec.name}</dt>
                  <dd className="text-right font-medium">{spec.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {tab === 'Kelengkapan' && (
            <ul className="list-disc space-y-1 pl-5">
              {gear.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="button"
          className="mt-6 w-full rounded-2xl bg-brand-yellow py-4 text-lg font-semibold text-black"
        >
          Ajukan sewa
        </button>
      </div>
    </div>
  )
}