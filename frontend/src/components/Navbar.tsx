import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, User as UserIcon, Calendar, Utensils, Home, Clock, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalCount, setIsCartOpen } = useCart();
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Menu', path: '/menu', icon: Utensils },
    { name: 'Weekly Subscription', path: '/subscriptions', icon: Calendar },
    ...(isAuthenticated
      ? [
          { name: 'My Orders', path: '/orders', icon: Clock },
          { name: 'My Subscriptions', path: '/my-subscriptions', icon: Calendar },
        ]
      : []),
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5EAE5] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Kitchen Tagline */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#EAF5EC] border border-[#237A45]/20 flex items-center justify-center text-[#237A45] shadow-soft group-hover:scale-105 transition-all">
              <Utensils className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#202820] flex items-center gap-1.5">
                HOME <span className="text-[#237A45]">KITCHEN</span>
              </span>
              <p className="text-[11px] text-[#6B756D] font-medium leading-none hidden sm:block">
                Pure Home-Cooked Goodness
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-[#EAF5EC] text-[#237A45]'
                      : 'text-[#202820] hover:text-[#237A45] hover:bg-[#F7FAF7]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons: Admin Pill, Cart, User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#237A45] text-white text-xs font-semibold rounded-lg hover:bg-[#185C35] transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Portal
              </Link>
            )}

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl border border-[#E5EAE5] bg-white hover:bg-[#F7FAF7] text-[#202820] transition-all"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-[#237A45]" />
              {totalCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#237A45] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm animate-pulse">
                  {totalCount}
                </span>
              )}
            </button>

            {/* Profile or Login */}
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#E5EAE5] bg-[#F7FAF7] hover:bg-white text-sm font-semibold text-[#202820] transition-all"
                >
                  <UserIcon className="w-4 h-4 text-[#237A45]" />
                  <span className="max-w-[120px] truncate">{user?.full_name?.split(' ')[0] || 'Profile'}</span>
                </Link>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold bg-[#237A45] text-white hover:bg-[#185C35] transition-all"
              >
                Login
              </Link>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl border border-[#E5EAE5] text-[#202820] hover:bg-[#F7FAF7] transition-all"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-down Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5EAE5] bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg animate-fadeIn">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? 'bg-[#EAF5EC] text-[#237A45]'
                    : 'text-[#202820] hover:bg-[#F7FAF7]'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-[#237A45]' : 'text-[#6B756D]'}`} />
                {link.name}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-[#E5EAE5] space-y-2">
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold bg-[#237A45] text-white"
              >
                <ShieldCheck className="w-5 h-5" />
                Admin Portal
              </Link>
            )}

            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-[#202820] hover:bg-[#F7FAF7]"
                >
                  <UserIcon className="w-5 h-5 text-[#237A45]" />
                  My Profile ({user?.phone_number})
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center py-3 rounded-xl text-sm font-semibold bg-[#237A45] text-white"
              >
                Login / Register with OTP
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
