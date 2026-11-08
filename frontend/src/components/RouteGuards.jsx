import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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