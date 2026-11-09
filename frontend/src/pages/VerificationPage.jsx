import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormField from '../components/FormField'
import { ArrowLeftIcon, CheckIcon, IdCardIcon, UserIcon } from '../components/icons'
import PhotoPicker from '../components/PhotoPicker'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../lib/api'
import { CAMPUSES } from '../lib/campuses'

const STEPS = ['Foto KTM', 'Selfie', 'Cek data']

function Stepper({ step }) {
  return (
    <ol className="flex items-start" aria-label="Langkah verifikasi">
      {STEPS.map((label, i) => {
        const number = i + 1
        const done = number < step
        const current = number === step
        return (
          <li key={label} className="relative flex flex-1 flex-col items-center gap-1.5">
            {i > 0 && (
              <span
                aria-hidden="true"
                className={`absolute right-1/2 top-3.5 h-0.5 w-full -translate-y-1/2 ${
                  number <= step ? 'bg-brand-blue' : 'bg-neutral-300'
                }`}
              />
            )}
            <span
              aria-current={current ? 'step' : undefined}
              className={`relative flex size-7 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                done
                  ? 'border-brand-blue bg-brand-blue text-white'
                  : current
                    ? 'border-brand-blue bg-white text-brand-blue'
                    : 'border-neutral-300 bg-white text-neutral-400'
              }`}
            >
              {done ? <CheckIcon className="size-4" /> : number}
            </span>
            <span className="text-xs text-neutral-600">{label}</span>
          </li>
        )
      })}
    </ol>
  )
}

function Tips({ items }) {
  return (
    <ul className="mt-4 space-y-1.5">
      {items.map((text) => (
        <li key={text} className="flex items-center gap-2 text-sm text-black">
          <CheckIcon className="size-4 shrink-0" />
          {text}
        </li>
      ))}
    </ul>
  )
}

export default function VerificationPage() {
  const { user, token, updateUser } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [ktmUrl, setKtmUrl] = useState('')
  const [selfieUrl, setSelfieUrl] = useState('')
  const [form, setForm] = useState({
    fullName: user.full_name,
    nim: '',
    campus: '',
    validUntil: '',
    phone: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const currentMonth = new Date().toISOString().slice(0, 7)

  function setField(key) {
    return (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))
  }

  function goBack() {
    setError('')
    if (step > 1) setStep(step - 1)
    else navigate('/profil')
  }

  function validateForm() {
    if (form.fullName.trim().length < 2) return 'Nama lengkap minimal 2 karakter.'
    if (!/^\d{5,20}$/.test(form.nim.trim())) return 'NIM harus berupa angka.'
    if (!form.campus) return 'Pilih kampus kamu.'
    if (!form.validUntil) return 'Isi masa berlaku KTM.'
    if (!/^(\+62|62|0)8\d{8,12}$/.test(form.phone.replace(/[\s-]/g, ''))) {
      return 'Nomor telepon tidak valid (contoh: 081234567891).'
    }
    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const message = validateForm()
    if (message) {
      setError(message)
      return
    }

    setError('')
    setSubmitting(true)
    try {
      const data = await apiRequest('/verification', {
        method: 'POST',
        token,
        body: {
          full_name: form.fullName.trim(),
          nim: form.nim.trim(),
          campus: form.campus,
          ktm_valid_until: form.validUntil,
          phone: form.phone,
          ktm_image_url: ktmUrl,
          selfie_url: selfieUrl,
        },
      })
      updateUser(data)
      navigate('/profil', { replace: true, state: { justVerified: true } })
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  const buttonClass =
    'mt-8 w-full rounded-2xl bg-brand-yellow py-3.5 text-lg font-semibold text-black disabled:opacity-50'

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col px-5 pb-8 pt-6">
      <header className="flex items-center gap-3 border-b border-neutral-200 pb-4">
        <button
          type="button"
          onClick={goBack}
          aria-label="Kembali"
          className="flex size-10 items-center justify-center rounded-full hover:bg-neutral-100"
        >
          <ArrowLeftIcon />
        </button>
        <h1 className="text-2xl font-bold">{step === 3 ? 'Cek data' : 'Verifikasi KTM'}</h1>
      </header>

      <div className="mt-6">
        <Stepper step={step} />
      </div>

      {step === 1 && (
        <section className="mt-8 flex flex-1 flex-col">
          <h2 className="mb-3 text-xl font-semibold">Ambil foto KTM</h2>
          <PhotoPicker
            icon={IdCardIcon}
            placeholder="Ambil foto KTM"
            url={ktmUrl}
            onChange={setKtmUrl}
          />
          <Tips items={['Tulisan jelas, tidak buram', 'Tidak silau atau terpotong', 'Masih berlaku']} />
          <p className="mt-4 text-sm text-neutral-600">
            Ini versi simulasi. Gunakan KTM contoh (dummy), bukan KTM aslimu.
          </p>
          <button
            type="button"
            disabled={!ktmUrl}
            onClick={() => setStep(2)}
            className={`${buttonClass} mt-auto`}
          >
            Lanjut
          </button>
        </section>
      )}

      {step === 2 && (
        <section className="mt-8 flex flex-1 flex-col">
          <h2 className="mb-3 text-xl font-semibold">Selfie dengan KTM</h2>
          <PhotoPicker
            icon={UserIcon}
            placeholder="Ambil foto"
            url={selfieUrl}
            onChange={setSelfieUrl}
          />
          <Tips items={['Cahaya cukup terang', 'Lepas masker dan kacamata hitam']} />
          <button
            type="button"
            disabled={!selfieUrl}
            onClick={() => setStep(3)}
            className={`${buttonClass} mt-auto`}
          >
            Lanjut
          </button>
        </section>
      )}

      {step === 3 && (
        <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-1 flex-col">
          <p className="text-sm text-neutral-600">Isi data sesuai KTM-mu.</p>
          <div className="mt-3 flex flex-col gap-5">
            <FormField
              id="full-name"
              label="Nama lengkap"
              value={form.fullName}
              onChange={setField('fullName')}
              autoComplete="name"
            />
            <FormField
              id="nim"
              label="NIM"
              value={form.nim}
              onChange={setField('nim')}
              inputMode="numeric"
              placeholder="00000123456"
            />
            <FormField id="campus" label="Kampus" value={form.campus} onChange={setField('campus')}>
              <option value="">Pilih kampus</option>
              {CAMPUSES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </FormField>
            <FormField
              id="valid-until"
              label="KTM berlaku sampai"
              type="month"
              min={currentMonth}
              value={form.validUntil}
              onChange={setField('validUntil')}
              hint="Pilih bulan dan tahun."
            />
            <FormField
              id="phone"
              label="Nomor Telepon"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={setField('phone')}
              placeholder="081234567891"
            />
          </div>

          {error && (
            <p role="alert" className="mt-4 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting} className={`${buttonClass} mt-auto`}>
            {submitting ? 'Mengirim...' : 'Kirim verifikasi'}
          </button>
        </form>
      )}
    </div>
  )
}