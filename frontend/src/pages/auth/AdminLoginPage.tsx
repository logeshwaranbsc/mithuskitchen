import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Phone, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const mithusLogo = '/mithus_kitchen_logo.svg';

export const AdminLoginPage: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('+919876543210');
  const [password, setPassword] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { loginAsAdmin } = useAuth();
  const navigate = useNavigate();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await loginAsAdmin(phoneNumber, password);
      navigate('/admin');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoAdmin = () => {
    setPhoneNumber('+919876543210');
    setPassword('admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7FAF7] px-4 py-12">
      <div className="card-white p-8 sm:p-10 rounded-3xl max-w-md w-full border border-[#E5EAE5] bg-white shadow-soft-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-white border border-[#E5EAE5] flex items-center justify-center mx-auto shadow-soft p-1.5">
            <img src={mithusLogo} alt="Mithu's Kitchen" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#202820]">Admin & Kitchen Login</h1>
          <p className="text-xs text-[#6B756D]">
            Manage daily orders, cooking capacity, menus, and WhatsApp dispatch.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Demo Helper Box */}
        <div className="p-3.5 bg-[#EAF5EC] border border-[#237A45]/20 text-[#185C35] text-xs rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Demo Admin Access
            </span>
            <button
              type="button"
              onClick={handleFillDemoAdmin}
              className="text-[11px] font-bold underline hover:text-[#185C35]"
            >
              Auto-Fill
            </button>
          </div>
          <p className="text-[11px] text-[#202820]">
            Phone: <strong>+919876543210</strong> (or <strong>admin@homekitchen.com</strong>)<br />
            Password: <strong>admin</strong>
          </p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#202820] mb-1">Admin Mobile / Email</label>
            <div className="relative">
              <input
                type="text"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+919876543210 or admin@homekitchen.com"
                className="input-field text-xs pl-9"
              />
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#202820] mb-1">Admin Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="input-field text-xs pl-9"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
          >
            <span>{loading ? 'Authenticating Admin...' : 'Access Admin Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-[#E5EAE5] text-center">
          <Link to="/" className="text-xs font-semibold text-[#6B756D] hover:text-[#237A45]">
            ← Return to Customer Portal
          </Link>
        </div>
      </div>
    </div>
  );
};
