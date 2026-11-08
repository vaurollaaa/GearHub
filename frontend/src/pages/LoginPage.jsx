
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthField from '../components/AuthField'
import AuthLayout from '../components/AuthLayout'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const justRegistered = location.state?.registered === true

  const [email, setEmail] = useState(location.state?.email ?? '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Email dan password wajib diisi.')
      return
    }

    setSubmitting(true)
    try {
      await login(email.trim(), password)
      navigate('/beranda', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Login">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">

        {justRegistered && (
          <p
            role="status"
            className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-800"
          >
            Akun berhasil dibuat. Silakan login.
          </p>
        )}

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
          autoComplete="current-password"
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
            {submitting ? 'Memproses...' : 'Login'}
          </button>

          <p className="text-sm text-black">
            Belum punya akun?{' '}
            <Link to="/daftar" className="underline">
              Daftar
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  )
}
