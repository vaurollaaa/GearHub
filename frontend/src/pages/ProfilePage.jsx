import { Link, useLocation } from 'react-router-dom'
import {
  BoxIcon,
  ChevronRightIcon,
  GlobeIcon,
  HelpIcon,
  HistoryIcon,
  LockIcon,
  PlusIcon,
  SettingsIcon,
  ShieldIcon,
  UserEditIcon,
} from '../components/icons'
import { useAuth } from '../context/AuthContext'
import { formatRupiah, initials } from '../lib/format'

function MenuGroup({ title, children }) {
  return (
    <section className="mt-6">
      <h2 className="mb-2 text-lg font-semibold">{title}</h2>
      <div className="divide-y divide-neutral-200 rounded-2xl bg-neutral-100 px-4">{children}</div>
    </section>
  )
}

function MenuLink({ to, icon: Icon, label, locked }) {
  const content = (
    <>
      <Icon className="size-5" />
      <span className="flex-1">{label}</span>
      {locked ? <LockIcon className="size-4" /> : <ChevronRightIcon className="size-5" />}
    </>
  )

  if (locked) {
    return (
      <div aria-disabled="true" className="flex items-center gap-3 py-3.5 text-neutral-400">
        {content}
      </div>
    )
  }
  return (
    <Link to={to} className="flex items-center gap-3 py-3.5">
      {content}
    </Link>
  )
}

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const verified = user.verification_status === 'verified'
  const justVerified = location.state?.justVerified === true

  return (
    <div className="mx-auto max-w-xl px-5 py-8">
      <h1 className="border-b border-neutral-200 pb-4 text-2xl font-bold">Profil</h1>

      <div className="mt-6 flex flex-col items-center">
        <span className="flex size-28 items-center justify-center rounded-3xl bg-linear-to-b from-brand-yellow to-amber-700 text-4xl font-bold text-white">
          {initials(user.full_name)}
        </span>
        <p className="mt-3 text-2xl font-bold">{user.full_name}</p>
        <p className="text-sm text-neutral-600">{user.email}</p>
        <p className="mt-1 text-sm text-neutral-600">
          Saldo GearHub: <span className="font-semibold text-black">{formatRupiah(user.balance)}</span>
        </p>
      </div>

      {justVerified && (
        <p
          role="status"
          className="mt-6 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-800"
        >
          Verifikasi berhasil. Gear saya, Tambah gear, dan Aktivitas sewa sudah terbuka.
        </p>
      )}

      {!verified && (
        <div className="mt-6 flex gap-3 rounded-2xl border border-neutral-300 p-4">
          <ShieldIcon className="mt-0.5 size-6 shrink-0" />
          <div>
            <p className="font-semibold">Akun belum terverifikasi</p>
            <p className="mt-1 text-sm">
              Verifikasi KTM dulu supaya bisa ajukan sewa atau menyewakan gear.
            </p>
            <Link
              to="/verifikasi"
              className="mt-3 inline-block rounded-lg bg-brand-blue/10 px-4 py-2 text-sm font-semibold text-brand-blue"
            >
              Verifikasi sekarang
            </Link>
          </div>
        </div>
      )}

      <MenuGroup title="Akun">
        <MenuLink to="/profil/edit" icon={UserEditIcon} label="Edit profil" />
        <MenuLink to="/pengaturan" icon={SettingsIcon} label="Pengaturan" />
        <MenuLink to="/bahasa" icon={GlobeIcon} label="Pilihan bahasa" />
      </MenuGroup>

      <MenuGroup title="Gear saya">
        <MenuLink to="/gear-saya" icon={BoxIcon} label="Gear saya" locked={!verified} />
        <MenuLink to="/tambah-gear" icon={PlusIcon} label="Tambah gear" locked={!verified} />
      </MenuGroup>

      <MenuGroup title="Aktivitas">
        <MenuLink to="/aktivitas" icon={HistoryIcon} label="Aktivitas sewa" locked={!verified} />
      </MenuGroup>

      <MenuGroup title="Bantuan">
        <MenuLink to="/bantuan" icon={HelpIcon} label="Bantuan & FAQ" />
      </MenuGroup>

      <button
        type="button"
        onClick={logout}
        className="mt-8 w-full rounded-2xl border border-neutral-300 py-3 font-semibold text-red-700 hover:bg-red-50"
      >
        Keluar
      </button>
    </div>
  )
}