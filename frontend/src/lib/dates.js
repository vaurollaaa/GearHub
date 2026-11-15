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

export function formatShortRange(start, end) {
  const fmt = (iso, withYear) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      ...(withYear ? { year: 'numeric' } : {}),
    })
  return `${fmt(start, false)} - ${fmt(end, true)}`
}

// Batas pengembalian dianggap akhir hari tanggal return.
export function timeLeftText(endISO) {
  const ms = new Date(`${endISO}T23:59:59`) - new Date()
  if (ms <= 0) return 'Sudah melewati batas pengembalian'
  const hours = Math.floor(ms / 3600000)
  return `Kembali dalam ${Math.floor(hours / 24)} hari ${hours % 24} jam`
}