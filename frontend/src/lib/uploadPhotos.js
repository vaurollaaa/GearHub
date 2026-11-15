const CLOUD_NAME = 'vpifjjs1'
const UPLOAD_PRESET = 'gearhub_unsigned'
const MAX_SIDE = 1600

async function compress(file) {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Gagal memproses foto'))), 'image/jpeg', 0.85),
  )
}

export async function uploadPhoto(file) {
  if (!file.type.startsWith('image/')) throw new Error('File harus berupa gambar')
  const blob = await compress(file)
  const form = new FormData()
  form.append('file', blob)
  form.append('upload_preset', UPLOAD_PRESET)
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: form,
  })
  if (!res.ok) throw new Error('Upload foto gagal, coba lagi')
  const data = await res.json()
  return data.secure_url
}