import { useAuth } from '../context/AuthContext'
import { formatRupiah } from '../lib/format'

export default function ProfilePage() {
  const { user, logout } = useAuth()

  return (
    <div className="mx-auto flex max-w-md flex-col gap-3 px-5 py-12">
      <h1 className="text-2xl font-bold text-brand-blue">{user.full_name}</h1>
      <p>{user.email}</p>
      <p>
        Status akun:{' '}
        {user.verification_status === 'verified' ? 'Terverifikasi' : 'Belum terverifikasi'}
      </p>
      <p>Saldo: {formatRupiah(user.balance)}</p>
      <button
        type="button"
        onClick={logout}
        className="mt-4 rounded-2xl bg-brand-yellow py-3 font-semibold text-black"
      >
        Keluar
      </button>
    </div>
  )
}