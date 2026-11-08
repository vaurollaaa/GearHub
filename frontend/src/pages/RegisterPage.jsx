import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthField from '../components/AuthField'
import AuthLayout from '../components/AuthLayout'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function validate() {
    if (fullName.trim().length < 2) return 'Nama lengkap minimal 2 karakter.'
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return 'Format email tidak valid.'
    if (!email.trim().toLowerCase().endsWith('.ac.id')) {
      return 'Gunakan email kampus (berakhiran .ac.id).'
    }
    if (password.length < 8) return 'Password minimal 8 karakter.'
    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const message = validate()
    if (message) {
      setError(message)
      return
    }

    setError('')
    setSubmitting(true)
    try {
      await register(fullName.trim(), email.trim(), password)
            navigate('/login', {
        replace: true,
        state: { registered: true, email: email.trim() },
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Daftar" backTo="/login">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
        <AuthField
          id="full-name"
          label="Nama lengkap"
          type="text"
          autoComplete="name"
          placeholder="Sesuai KTM"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <AuthField
          id="email"
          label="Email kampus"
          type="email"
          autoComplete="email"
          placeholder="nama@kampus.ac.id"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <AuthField
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="Minimal 8 karakter"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p role="alert" className="text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        <div className="mt-8 flex flex-col items-center gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-brand-yellow py-3 text-lg font-semibold text-black disabled:opacity-60"
          >
            {submitting ? 'Memproses...' : 'Daftar'}
          </button>
          <p className="text-sm text-black">
            Sudah punya akun?{' '}
            <Link to="/login" className="underline">
              Login
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  )
}