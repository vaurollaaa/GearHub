import { useRef, useState } from 'react'
import { uploadImage } from '../lib/upload'
import { PlusIcon, XIcon } from './icons'

export default function MultiPhotoPicker({ photos, setPhotos, max = 8 }) {
  const inputRef = useRef(null)
  const [error, setError] = useState('')

  async function handleFiles(event) {
    const files = Array.from(event.target.files ?? []).slice(0, max - photos.length)
    event.target.value = ''
    if (files.length === 0) return

    setError('')
    const entries = files.map((file) => ({
      file,
      photo: {
        id: crypto.randomUUID(),
        preview: URL.createObjectURL(file),
        url: '',
        uploading: true,
      },
    }))
    setPhotos((prev) => [...prev, ...entries.map((e) => e.photo)])

    await Promise.all(
      entries.map(async ({ file, photo }) => {
        try {
          const url = await uploadImage(file)
          setPhotos((prev) =>
            prev.map((p) => (p.id === photo.id ? { ...p, url, uploading: false } : p)),
          )
        } catch (err) {
          setError(err.message)
          setPhotos((prev) => prev.filter((p) => p.id !== photo.id))
        }
      }),
    )
  }

  function removePhoto(photo) {
    URL.revokeObjectURL(photo.preview)
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id))
  }

  return (
    <div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="relative size-24 shrink-0 overflow-hidden rounded-xl border border-neutral-300 bg-neutral-100"
          >
            <img src={photo.preview} alt="" className="size-full object-contain" />
            {index === 0 && (
              <span className="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 text-center text-[10px] font-medium text-white">
                Foto utama
              </span>
            )}
            {photo.uploading && (
              <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-xs font-semibold">
                Mengunggah...
              </span>
            )}
            <button
              type="button"
              onClick={() => removePhoto(photo)}
              aria-label="Hapus foto"
              className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-white/90 text-black shadow"
            >
              <XIcon className="size-4" />
            </button>
          </div>
        ))}

        {photos.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex size-24 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-neutral-300 text-sm text-neutral-400"
          >
            <PlusIcon className="size-6" />
            Tambah
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        className="hidden"
      />

      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}