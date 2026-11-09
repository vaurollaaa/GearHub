import { NavLink, Outlet } from 'react-router-dom'
import { HistoryIcon, HomeIcon, PlusIcon, SearchIcon, UserIcon } from './icons'

const NAV_ITEMS = [
  { to: '/beranda', label: 'Beranda', Icon: HomeIcon },
  { to: '/pencarian', label: 'Pencarian', Icon: SearchIcon },
  { to: '/tambah-gear', label: 'Tambah gear', Icon: PlusIcon },
  { to: '/aktivitas', label: 'Aktivitas', Icon: HistoryIcon },
  { to: '/profil', label: 'Profil', Icon: UserIcon },
]

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-white lg:pl-60">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col gap-2 border-r border-neutral-200 bg-white p-4 lg:flex">
        <p className="px-4 py-4 text-2xl font-bold text-brand-blue">GearHub</p>
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium ${
                isActive ? 'bg-brand-blue/10 text-brand-blue' : 'text-neutral-700 hover:bg-neutral-100'
              }`
            }
          >
            <Icon className="size-5" />
            {label}
          </NavLink>
        ))}
      </aside>

      <main className="pb-24 lg:pb-0">
        <Outlet />
      </main>

      <nav
        aria-label="Menu utama"
        className="fixed inset-x-0 bottom-0 z-10 flex border-t border-neutral-200 bg-white px-2 pb-2 lg:hidden"
      >
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 pt-2 text-xs font-medium ${
                isActive ? 'text-brand-blue' : 'text-neutral-500'
              }`
            }
          >
            <Icon className="size-6" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}