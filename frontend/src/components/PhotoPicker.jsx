import { useRef, useState } from 'react'
import { uploadImage } from '../lib/upload'

export default function PhotoPicker({ icon: Icon, placeholder, url, onChange }) {
  const inputRef = useRef(null)
  const [preview, setPreview] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (preview) URL.revokeObjectURL(preview)
    setPreview(URL.createObjectURL(file))
    setError('')
    setUploading(true)
    onChange('')
    try {
      onChange(await uploadImage(file))
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const shown = preview || url

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative flex h-52 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-100 text-neutral-400 sm:h-64"
      >
        {shown ? (
          <img src={shown} alt="" className="size-full object-contain" />
        ) : (
          <span className="flex flex-col items-center gap-2 text-lg font-medium">
            <Icon className="size-12" />
            {placeholder}
          </span>
        )}
        {uploading && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm font-semibold text-black">
            Mengunggah...
          </span>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />

      {shown && !uploading && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-2 text-sm font-medium text-brand-blue underline"
        >
          Ganti foto
        </button>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}