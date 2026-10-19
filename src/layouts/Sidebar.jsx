import { NavLink, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  LayoutDashboard, Package, Tags, QrCode, PackagePlus, PackageMinus,
  History, Truck, BarChart2, Bell, Users, Settings, LogOut, ChevronLeft, ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../hooks/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/categories', icon: Tags, label: 'Categories' },
  { to: '/scanner', icon: QrCode, label: 'Scan QR Code' },
  { to: '/stock-in', icon: PackagePlus, label: 'Stock In' },
  { to: '/stock-out', icon: PackageMinus, label: 'Stock Out' },
  { to: '/history', icon: History, label: 'Stock History' },
  { to: '/suppliers', icon: Truck, label: 'Suppliers' },
  { to: '/reports', icon: BarChart2, label: 'Reports & Analytics' },
  { to: '/alerts', icon: AlertTriangle, label: 'Alerts' },
  { to: '/users', icon: Users, label: 'User Management', adminOnly: true },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch {
      navigate('/login');
    }
  };

  return (
    <aside className={clsx(
      'h-screen flex flex-col bg-slate-900 text-white transition-all duration-300 flex-shrink-0',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-700/50">
        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center flex-shrink-0">
          <QrCode className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <span className="text-base font-bold text-white">StockTrace</span>
            <p className="text-xs text-slate-400">Inventory System</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
        {navItems.map(({ to, icon: Icon, label, adminOnly }) => {
          if (adminOnly && !isAdmin) return null;
          return (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 mx-2 my-0.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
              title={collapsed ? label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User & collapse */}
      <div className="border-t border-slate-700/50 p-3 space-y-0.5">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
            </div>
          </div>
        )}
        <button onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 text-sm transition-colors"
          title={collapsed ? 'Logout' : undefined}>
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
        <button onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition-colors">
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
