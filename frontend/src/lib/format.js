export function formatRupiah(value) {
  return `Rp${value.toLocaleString('id-ID')}`
}

export function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}

export function todayISO() {
  // Format YYYY-MM-DD menurut waktu lokal pengguna.
  return new Date().toLocaleDateString('en-CA')
}

export function formatDateRange(from, to) {
  const a = new Date(`${from}T00:00:00`)
  const b = new Date(`${to}T00:00:00`)
  const month = (d) => d.toLocaleDateString('id-ID', { month: 'long' })
  if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()) {
    return `${a.getDate()}-${b.getDate()} ${month(a)} ${b.getFullYear()}`
  }
  return `${a.getDate()} ${month(a)} ${a.getFullYear()} - ${b.getDate()} ${month(b)} ${b.getFullYear()}`
}