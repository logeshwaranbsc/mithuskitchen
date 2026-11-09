import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Menu, X, ShieldCheck } from 'lucide-react';
import { AdminSidebar } from '../components/AdminSidebar';
import { useAuth } from '../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, isLoading, isAdmin } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7FAF7]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#237A45] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-[#6B756D]">Checking Admin Session...</p>
        </div>
      </div>
    );
  }

  // Protect Admin Portal
  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen flex bg-[#F7FAF7] text-[#202820]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto z-30">
        <AdminSidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl z-50">
            <div className="absolute top-2 right-2 p-1">
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <AdminSidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header Bar */}
        <header className="lg:hidden bg-white border-b border-[#E5EAE5] px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded-xl border border-[#E5EAE5] text-[#202820] hover:bg-[#F7FAF7]"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5 font-bold text-sm text-[#202820]">
            <ShieldCheck className="w-4 h-4 text-[#237A45]" />
            <span>Admin Management</span>
          </div>
          <div className="w-9"></div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
