import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { 
  KeyRound, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  RotateCcw, 
  CheckCircle2,
  Calendar,
  Sparkles
} from 'lucide-react';

export const VerifyOtpPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [usernameOrPhone, setUsernameOrPhone] = useState(
    location.state?.usernameOrPhone || location.state?.mobileNumber || ''
  );
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState(null);
  const [successNotice, setSuccessNotice] = useState(location.state?.devNotice || null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authService.verifyOtp({
        usernameOrPhone: usernameOrPhone.trim(),
        otpCode: otpCode.trim(),
      });

      if (res.data?.token) {
        login(res.data);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err.response?.data?.message || err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!usernameOrPhone) {
      setError('Please enter your username or phone number first');
      return;
    }
    setError(null);
    setResending(true);

    try {
      const res = await authService.resendOtp(usernameOrPhone.trim());
      setSuccessNotice(res.data || res.message || 'New OTP generated successfully.');
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F3D9] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md rounded-3xl bg-[#EBE5C2]/70 backdrop-blur-xl border border-[#B9B28A] shadow-2xl p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#504B38] text-[#F8F3D9] flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#504B38]/20">
            <KeyRound className="w-6 h-6 text-[#EBE5C2]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#504B38] tracking-tight">Verify Mobile OTP</h1>
          <p className="text-xs text-[#8C8563] font-semibold mt-1">
            Enter the 6-digit verification code sent to your registered number
          </p>
        </div>

        {successNotice && (
          <div className="mb-4 p-3 rounded-xl bg-[#B9B28A]/25 border border-[#B9B28A] text-[#504B38] text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 flex-shrink-0 text-[#504B38]" />
            <span>{successNotice}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-100 border border-red-300 text-red-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-700" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#504B38] mb-1.5">
              Username or Mobile Number
            </label>
            <input
              type="text"
              required
              placeholder="Username or Phone"
              value={usernameOrPhone}
              onChange={(e) => setUsernameOrPhone(e.target.value)}
              className="glass-input w-full text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#504B38] mb-1.5">
              6-Digit OTP Code
            </label>
            <input
              type="text"
              maxLength={6}
              required
              autoFocus
              placeholder="123456"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className="glass-input w-full text-center tracking-widest text-lg font-mono font-bold"
            />
          </div>

          <button
            type="submit"
            disabled={loading || otpCode.length < 4}
            className="w-full btn-primary py-3 rounded-xl text-sm font-bold shadow-md cursor-pointer mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Verify & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-[#B9B28A]/40 flex items-center justify-between text-xs">
          <button
            type="button"
            disabled={resending}
            onClick={handleResend}
            className="font-bold text-[#504B38] hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
            <span>Resend OTP</span>
          </button>

          <Link to="/login" className="text-[#8C8563] hover:text-[#504B38]">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};
