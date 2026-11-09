import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  BookOpen,
  Clock,
  ShoppingBag,
  CalendarCheck,
  Users,
  Truck,
  BarChart3,
  MessageSquare,
  Settings,
  Eye,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminSidebar: React.FC<{ onCloseMobile?: () => void }> = ({ onCloseMobile }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Food Management', path: '/admin/foods', icon: UtensilsCrossed },
    { name: 'Menu Management', path: '/admin/menus', icon: BookOpen },
    { name: 'Meal Timings & Cutoff', path: '/admin/timings', icon: Clock },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Subscriptions', path: '/admin/subscriptions', icon: CalendarCheck },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Delivery Management', path: '/admin/delivery', icon: Truck },
    { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { name: 'WhatsApp Notifications', path: '/admin/whatsapp', icon: MessageSquare },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-white border-r border-[#E5EAE5] flex flex-col justify-between h-full min-h-screen">
      <div>
        {/* Admin Header */}
        <div className="p-5 border-b border-[#E5EAE5] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#EAF5EC] border border-[#237A45]/30 flex items-center justify-center text-[#237A45] shadow-soft">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-[#202820]">
                HOME <span className="text-[#237A45]">KITCHEN</span>
              </span>
              <p className="text-[11px] font-semibold text-[#237A45] uppercase tracking-wider">
                Admin Console
              </p>
            </div>
          </div>
        </div>

        {/* Current Admin user pill */}
        <div className="px-5 py-3 bg-[#F7FAF7] border-b border-[#E5EAE5] flex items-center justify-between text-xs">
          <div>
            <p className="font-bold text-[#202820] truncate max-w-[140px]">{user?.full_name || 'Chef Admin'}</p>
            <p className="text-[#6B756D] text-[10px]">{user?.role === 'kitchen_staff' ? 'Kitchen Staff' : 'Head Admin'}</p>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#EAF5EC] text-[#237A45] font-bold shadow-xs'
                      : 'text-[#202820] hover:bg-[#F7FAF7] hover:text-[#237A45]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#237A45]' : 'text-[#6B756D]'}`} />
                      <span>{item.name}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#237A45]" />}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions: View Store & Logout */}
      <div className="p-4 border-t border-[#E5EAE5] space-y-2 bg-[#F7FAF7]">
        <NavLink
          to="/"
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-[#E5EAE5] bg-white text-xs font-semibold text-[#202820] hover:bg-gray-50 transition-colors shadow-2xs"
        >
          <Eye className="w-4 h-4 text-[#237A45]" />
          <span>Customer View</span>
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout Admin</span>
        </button>
      </div>
    </aside>
  );
};
