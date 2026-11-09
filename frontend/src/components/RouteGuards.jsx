import { Link, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ShieldIcon } from './icons'

export function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) return <p className="p-6 text-neutral-600">Memuat...</p>
  return user ? <Outlet /> : <Navigate to="/login" replace />
}

export function GuestRoute() {
  const { user, loading } = useAuth()
  if (loading) return <p className="p-6 text-neutral-600">Memuat...</p>
  return user ? <Navigate to="/beranda" replace /> : <Outlet />
}

export function RequireVerified() {
  const { user } = useAuth()
  if (user.verification_status === 'verified') return <Outlet />

  return (
    <div className="mx-auto max-w-md px-5 py-16 text-center">
      <ShieldIcon className="mx-auto size-12 text-brand-blue" />
      <h1 className="mt-4 text-2xl font-bold">Verifikasi KTM dulu</h1>
      <p className="mt-2 text-neutral-600">
        Fitur ini hanya untuk akun yang sudah terverifikasi.
      </p>
      <Link
        to="/verifikasi"
        className="mt-6 inline-block rounded-2xl bg-brand-yellow px-6 py-3 font-semibold text-black"
      >
        Verifikasi sekarang
      </Link>
    </div>
  )
}