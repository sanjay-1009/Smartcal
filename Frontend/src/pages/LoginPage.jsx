import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { 
  Calendar, 
  Lock, 
  User, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

export const LoginPage = () => {
  const [usernameOrPhone, setUsernameOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authService.login({
        usernameOrPhone: usernameOrPhone.trim(),
        password: password,
      });

      if (res.data?.token) {
        login(res.data);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check credentials.';
      // If user needs OTP verification, navigate to /verify-otp
      if (msg.includes('Account not verified') || msg.includes('OTP')) {
        navigate('/verify-otp', { state: { usernameOrPhone } });
        return;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F3D9] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#EBE5C2] rounded-full filter blur-3xl opacity-70 -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#B9B28A]/30 rounded-full filter blur-3xl opacity-70 -z-10" />

      {/* Main Glassmorphic Login Card */}
      <div className="w-full max-w-md rounded-3xl bg-[#EBE5C2]/70 backdrop-blur-xl border border-[#B9B28A] shadow-2xl p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#504B38] text-[#F8F3D9] flex items-center justify-center mx-auto mb-3.5 shadow-lg shadow-[#504B38]/20">
            <Calendar className="w-7 h-7 text-[#EBE5C2]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#504B38] tracking-tight">SmartCal</h1>
          <p className="text-xs text-[#8C8563] font-semibold mt-1">
            Intelligent Personal Event & Calendar Manager
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-100 border border-red-300 text-red-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-700" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#504B38] mb-1.5">
              Username or Email Address
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#8C8563] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="e.g. alexander or you@gmail.com"
                value={usernameOrPhone}
                onChange={(e) => setUsernameOrPhone(e.target.value)}
                className="glass-input w-full pl-10 text-xs sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#504B38] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8C8563] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input w-full pl-10 text-xs sm:text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 rounded-xl text-sm font-bold shadow-md cursor-pointer mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 pt-5 border-t border-[#B9B28A]/40 text-center text-xs text-[#8C8563]">
          <p>
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-[#504B38] hover:underline">
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
