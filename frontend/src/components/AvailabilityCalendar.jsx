import { useEffect, useState } from 'react'
import { isDayAvailable, toISO } from '../lib/dates'
import { todayISO } from '../lib/format'
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from './icons'

const WEEKDAYS = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB']

export default function AvailabilityCalendar({ gear, bookings, onClose }) {
  const today = todayISO()
  const [todayYear, todayMonth] = today.split('-').map(Number)
  const [cursor, setCursor] = useState({ year: todayYear, month: todayMonth - 1 })

  const cursorIndex = cursor.year * 12 + cursor.month
  const minIndex = todayYear * 12 + (todayMonth - 1)
  let maxIndex = Infinity
  if (gear.available_until) {
    const [y, m] = gear.available_until.split('-').map(Number)
    maxIndex = y * 12 + (m - 1)
  }

  function shift(delta) {
    setCursor((c) => {
      const i = c.year * 12 + c.month + delta
      return { year: Math.floor(i / 12), month: i % 12 }
    })
  }

  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const firstWeekday = new Date(cursor.year, cursor.month, 1).getDay()
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate()
  const cells = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="calendar-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 id="calendar-title" className="font-semibold">
            Cek ketersediaan
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex size-8 items-center justify-center rounded-full hover:bg-neutral-100"
          >
            <XIcon className="size-5" />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => shift(-1)}
            disabled={cursorIndex <= minIndex}
            aria-label="Bulan sebelumnya"
            className="flex size-8 items-center justify-center rounded-full hover:bg-neutral-100 disabled:opacity-30"
          >
            <ChevronLeftIcon className="size-5" />
          </button>
          <p className="font-medium capitalize">{monthLabel}</p>
          <button
            type="button"
            onClick={() => shift(1)}
            disabled={cursorIndex >= maxIndex}
            aria-label="Bulan berikutnya"
            className="flex size-8 items-center justify-center rounded-full hover:bg-neutral-100 disabled:opacity-30"
          >
            <ChevronRightIcon className="size-5" />
          </button>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-y-2 text-center">
          {WEEKDAYS.map((d) => (
            <span key={d} className="text-[11px] font-medium text-neutral-500">
              {d}
            </span>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <span key={`blank-${i}`} />
            const iso = toISO(cursor.year, cursor.month, day)
            const available = isDayAvailable(iso, gear, bookings, today)
            return (
              <span
                key={iso}
                aria-label={`${day}: ${available ? 'tersedia' : 'tidak tersedia'}`}
                className={`mx-auto flex size-9 items-center justify-center rounded-full text-sm font-medium text-white ${
                  available ? 'bg-green-600' : 'bg-red-900'
                }`}
              >
                {day}
              </span>
            )
          })}
        </div>

        <div className="mt-4 flex gap-4 text-xs text-neutral-600">
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-green-600" /> Tersedia
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-red-900" /> Tidak tersedia
          </span>
        </div>
      </div>
    </div>
  )
}