import { NavLink, Outlet } from 'react-router-dom';
import clsx from 'clsx';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/new-company', label: 'Nova empresa' },
  { to: '/leads', label: 'Leads' },
  { to: '/settings', label: 'Configurações' },
];

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-ink-950">
      <aside className="w-60 shrink-0 border-r border-ink-800 bg-ink-900 px-4 py-6">
        <div className="mb-8 px-2">
          <span className="text-lg font-semibold tracking-tight text-white">LeadForge</span>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent-500/15 text-accent-400'
                    : 'text-ink-500 hover:bg-ink-800 hover:text-white',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
