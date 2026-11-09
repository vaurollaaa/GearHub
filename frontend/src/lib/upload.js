// Cloud name dan preset bersifat publik (bukan rahasia). API Secret tidak dipakai di frontend.
const CLOUD_NAME = 'vpifjjs1'
const UPLOAD_PRESET = 'gearhub_unsigned'

async function compressImage(file, maxSize = 1600, quality = 0.85) {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Gagal memproses foto.'))),
      'image/jpeg',
      quality,
    ),
  )
}

export async function uploadImage(file) {
  if (!file.type.startsWith('image/')) {
    throw new Error('File harus berupa gambar.')
  }

  let blob
  try {
    blob = await compressImage(file)
  } catch {
    throw new Error('Foto tidak bisa dibaca. Coba foto lain.')
  }

  const form = new FormData()
  form.append('file', blob)
  form.append('upload_preset', UPLOAD_PRESET)

  let res
  try {
    res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: form,
    })
  } catch {
    throw new Error('Gagal mengunggah foto. Periksa koneksi internet.')
  }

  const data = await res.json().catch(() => null)
  if (!res.ok || !data?.secure_url) {
    throw new Error(data?.error?.message ?? 'Gagal mengunggah foto.')
  }
  return data.secure_url
}