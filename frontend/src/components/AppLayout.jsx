import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { HistoryIcon, HomeIcon, LockIcon, PlusIcon, SearchIcon, UserIcon } from './icons'

const NAV_ITEMS = [
  { to: '/beranda', label: 'Beranda', Icon: HomeIcon },
  { to: '/pencarian', label: 'Pencarian', Icon: SearchIcon },
  { to: '/tambah-gear', label: 'Tambah gear', Icon: PlusIcon, requiresVerified: true },
  { to: '/aktivitas', label: 'Aktivitas', Icon: HistoryIcon, requiresVerified: true },
  { to: '/profil', label: 'Profil', Icon: UserIcon },
]

function sidebarClass(isActive, locked) {
  const base = 'flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium'
  if (locked) {
    return `${base} text-neutral-400 hover:bg-neutral-100 ${isActive ? 'bg-neutral-100' : ''}`
  }
  return `${base} ${isActive ? 'bg-brand-blue/10 text-brand-blue' : 'text-neutral-700 hover:bg-neutral-100'}`
}

function bottomClass(isActive, locked) {
  const base = 'flex flex-1 flex-col items-center gap-1 pt-2 text-xs font-medium'
  if (locked) return `${base} text-neutral-300`
  return `${base} ${isActive ? 'text-brand-blue' : 'text-neutral-500'}`
}

export default function AppLayout() {
  const { user } = useAuth()
  const verified = user?.verification_status === 'verified'
  const isLocked = (item) => Boolean(item.requiresVerified) && !verified

  return (
    <div className="min-h-screen bg-white lg:pl-60">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col gap-2 border-r border-neutral-200 bg-white p-4 lg:flex">
        <p className="px-4 py-4 text-2xl font-bold text-brand-blue">GearHub</p>
        {NAV_ITEMS.map((item) => {
          const locked = isLocked(item)
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={locked ? 'Verifikasi KTM dulu' : undefined}
              className={({ isActive }) => sidebarClass(isActive, locked)}
            >
              <item.Icon className="size-5" />
              {item.label}
              {locked && <LockIcon className="ml-auto size-4" />}
            </NavLink>
          )
        })}
      </aside>

      <main className="pb-24 lg:pb-0">
        <Outlet />
      </main>

      <nav
        aria-label="Menu utama"
        className="fixed inset-x-0 bottom-0 z-10 flex border-t border-neutral-200 bg-white px-2 pb-2 lg:hidden"
      >
        {NAV_ITEMS.map((item) => {
          const locked = isLocked(item)
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => bottomClass(isActive, locked)}
            >
              <item.Icon className="size-6" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}