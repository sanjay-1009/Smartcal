import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { 
  Calendar, 
  Lock, 
  User, 
  Mail, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export const SignupPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Password and confirm password do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await authService.register(formData);
      // Navigate to OTP verification page with user details
      navigate('/verify-otp', {
        state: {
          usernameOrPhone: formData.username,
          mobileNumber: formData.mobileNumber,
          devNotice: res.data || res.message,
        },
      });
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F3D9] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#EBE5C2] rounded-full filter blur-3xl opacity-70 -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#B9B28A]/30 rounded-full filter blur-3xl opacity-70 -z-10" />

      <div className="w-full max-w-md rounded-3xl bg-[#EBE5C2]/70 backdrop-blur-xl border border-[#B9B28A] shadow-2xl p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#504B38] text-[#F8F3D9] flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#504B38]/20">
            <Calendar className="w-6 h-6 text-[#EBE5C2]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#504B38] tracking-tight">Create SmartCal Account</h1>
          <p className="text-xs text-[#8C8563] font-semibold mt-1">
            Join SmartCal to automate event tracking & calendar management
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-100 border border-red-300 text-red-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-700" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#504B38] mb-1">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#8C8563] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="username"
                required
                placeholder="e.g. alexander"
                value={formData.username}
                onChange={handleChange}
                className="glass-input w-full pl-10 text-xs sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#504B38] mb-1">
              Gmail / Email Address (for OTP)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8C8563] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                name="mobileNumber"
                required
                placeholder="you@gmail.com"
                value={formData.mobileNumber}
                onChange={handleChange}
                className="glass-input w-full pl-10 text-xs sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#504B38] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8C8563] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="glass-input w-full pl-10 text-xs sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#504B38] mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8C8563] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                name="confirmPassword"
                required
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
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
                <span>Sign Up & Verify OTP</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#B9B28A]/40 text-center text-xs text-[#8C8563]">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#504B38] hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
