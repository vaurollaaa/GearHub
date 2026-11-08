import { useAuth } from '../context/AuthContext'

export default function HomePage() {
  const { user, logout } = useAuth()

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 p-6">
      <h1 className="text-3xl font-bold text-brand-blue">Halo, {user.full_name}</h1>
      <p>
        Status akun:{' '}
        {user.verification_status === 'verified' ? 'Terverifikasi' : 'Belum terverifikasi'}
      </p>
      <p>Saldo: Rp{user.balance.toLocaleString('id-ID')}</p>
      <button
        type="button"
        onClick={logout}
        className="mt-4 rounded-2xl bg-brand-yellow py-3 font-semibold text-black"
      >
        Keluar
      </button>
    </main>
  )
}