import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Mail, FileText, LogOut, Gauge, MapPin, ClipboardList } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/applications', icon: ClipboardList, label: 'Arizalar' },
  { to: '/contacts', icon: Mail, label: 'Xabarlar' },
  { to: '/blog', icon: FileText, label: 'Blog' },
  { to: '/regions', icon: MapPin, label: 'Hududlar' },
];

export default function Layout() {
  const navigate = useNavigate();
  const user = localStorage.getItem('ecm_user') || 'Admin';

  function handleLogout() {
    localStorage.removeItem('ecm_token');
    localStorage.removeItem('ecm_user');
    navigate('/login');
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-[hsl(205,45%,20%)] text-white flex flex-col shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="w-9 h-9 bg-[hsl(25,80%,50%)] rounded-lg flex items-center justify-center shrink-0">
            <Gauge size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">ECM CALIBRATION</p>
            <p className="text-xs text-white/50">Admin Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/50">Kirgan foydalanuvchi</p>
              <p className="text-sm font-medium text-white">{user}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
              title="Chiqish"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
