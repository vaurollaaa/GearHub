const API_URL = import.meta.env.VITE_API_URL

function parseError(data) {
  const detail = data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail.length > 0) {
    return String(detail[0].msg ?? 'Data tidak valid').replace(/^Value error, /, '')
  }
  return 'Terjadi kesalahan. Coba lagi.'
}

export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('Tidak dapat terhubung ke server. Coba lagi.')
  }

  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(parseError(data))
  return data
}