const pad = (n) => String(n).padStart(2, '0')

// Semua tanggal berbentuk teks "YYYY-MM-DD" supaya bebas masalah zona waktu.
export function toISO(year, monthIndex, day) {
  return `${year}-${pad(monthIndex + 1)}-${pad(day)}`
}

export function addDays(iso, amount) {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + amount)
  return d.toISOString().slice(0, 10)
}

export function diffDays(from, to) {
  return Math.round((new Date(`${to}T00:00:00Z`) - new Date(`${from}T00:00:00Z`)) / 86400000)
}

export function formatDayLong(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

// Hari dianggap tersedia kalau: belum lewat, ada dalam periode gear, dan tidak sedang dipesan.
export function isDayAvailable(iso, gear, bookings, today) {
  if (iso < today) return false
  if (gear.available_from && iso < gear.available_from) return false
  if (gear.available_until && iso > gear.available_until) return false
  return !bookings.some((b) => iso >= b.start_date && iso < b.end_date)
}