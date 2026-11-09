import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Phone, KeyRound, ArrowRight, ShieldCheck, Utensils, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const mithusLogo = '/mithus_kitchen_logo.svg';

export const LoginPage: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('+919876543211');
  const [fullName, setFullName] = useState('Ananya Sharma');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { loginWithOtp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  // Request OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await api.post('/auth/send-otp', { phone_number: phoneNumber });
      setOtpSent(true);
      setOtp('123456'); // prefill demo OTP for easiest evaluation
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await loginWithOtp(phoneNumber, otp, fullName);
      navigate(redirect);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="card-white p-8 sm:p-10 rounded-3xl max-w-md w-full border border-[#E5EAE5] bg-white shadow-soft-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-white border border-[#E5EAE5] flex items-center justify-center mx-auto shadow-soft p-1.5">
            <img src={mithusLogo} alt="Mithu's Kitchen" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#202820]">Mithu's Kitchen Login</h1>
          <p className="text-xs text-[#6B756D]">
            Order fresh meals and subscribe using your mobile number.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Demo Helper Banner */}
        <div className="p-3 bg-[#EAF5EC] border border-[#237A45]/20 text-[#185C35] text-xs rounded-xl space-y-1">
          <span className="font-bold flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" /> Quick Test Helper
          </span>
          <p className="text-[11px]">
            Demo Phone: <strong>+919876543211</strong> | Demo OTP: <strong>123456</strong>
          </p>
        </div>

        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#202820] mb-1">Your Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ananya Sharma"
                className="input-field text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#202820] mb-1">Mobile Number</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="input-field text-xs pl-9"
                />
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Sending OTP...' : 'Send Verification OTP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-[#202820]">Enter 6-digit OTP</label>
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="text-[11px] text-[#237A45] hover:underline"
                >
                  Change Number
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="input-field text-xs tracking-widest text-center text-lg font-bold pl-9"
                />
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="btn-primary w-full py-3 text-xs font-bold"
            >
              {loading ? 'Verifying...' : 'Verify OTP & Enter Kitchen'}
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-[#E5EAE5] text-center">
          <Link
            to="/admin/login"
            className="text-xs font-semibold text-[#237A45] hover:underline flex items-center justify-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Kitchen Staff & Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
};
