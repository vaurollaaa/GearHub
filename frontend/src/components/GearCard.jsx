import { Link } from 'react-router-dom'
import { formatRupiah } from '../lib/format'
import { PinIcon, StarIcon } from './icons'

export default function GearCard({ gear, className = '' }) {
  return (
    <Link
      to={`/gear/${gear.id}`}
      className={`flex flex-col rounded-2xl border border-neutral-200 bg-white p-2.5 transition hover:shadow-md ${className}`}
    >
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-neutral-200">
        <img
          src={gear.image_url}
          alt=""
          loading="lazy"
          className="absolute inset-0 size-full object-contain p-3"
        />
        <span className="absolute bottom-2 left-2 rounded-full bg-brand-blue px-2.5 py-0.5 text-xs font-semibold text-white">
          {formatRupiah(gear.price_per_day)}
          <span className="font-normal">/hari</span>
        </span>
      </div>
      <div className="mt-2 flex flex-1 flex-col gap-1 px-1 pb-1">
        <p className="flex items-center gap-1 text-xs text-neutral-700">
          <StarIcon className="size-3.5 text-brand-yellow" />
          {gear.rating_avg.toFixed(1)} ({gear.rating_count})
        </p>
        <h3 className="line-clamp-2 text-sm font-semibold text-black">{gear.name}</h3>
        <p className="mt-auto flex items-center gap-1 pt-1 text-xs text-neutral-700">
          <PinIcon className="size-3.5 shrink-0" />
          {gear.pickup_location}
        </p>
      </div>
    </Link>
  )
}