import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { BentoCard } from '../components/BentoCard';
import { 
  User, 
  Phone, 
  ShieldCheck, 
  CalendarDays, 
  Flame, 
  Bell, 
  LogOut, 
  Sparkles,
  Layers,
  Clock,
  CheckCircle2
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await userService.getProfile();
        setProfile(data);
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#504B38] tracking-tight flex items-center gap-2.5">
          <User className="w-6 h-6 text-[#504B38]" />
          <span>User Profile & Workspace</span>
        </h1>
        <p className="text-xs text-[#8C8563] mt-1">
          Account details, automated scheduler settings, and data summary.
        </p>
      </div>

      {/* Main Account Details Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BentoCard className="md:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#504B38] text-[#F8F3D9] flex items-center justify-center font-extrabold text-2xl uppercase shadow-md">
                {user?.username ? user.username.charAt(0) : 'U'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-[#504B38]">{user?.username}</h2>
                  <span className="badge-category bg-[#504B38] text-[#F8F3D9] text-[10px]">
                    {profile?.role || 'ROLE_USER'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#8C8563] mt-1">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {user?.mobileNumber}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-800 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="btn-secondary text-xs py-2 px-3 rounded-xl text-red-700 hover:bg-red-50 flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

          <div className="mt-6 pt-5 border-t border-[#B9B28A]/40 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#504B38]">
            <div>
              <span className="text-[11px] font-bold text-[#8C8563] block uppercase tracking-wider">
                Registration Status
              </span>
              <p className="font-semibold mt-0.5">Mobile OTP Verified</p>
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#8C8563] block uppercase tracking-wider">
                Security Scheme
              </span>
              <p className="font-semibold mt-0.5">Stateless JWT + BCrypt</p>
            </div>
          </div>
        </BentoCard>

        {/* DSA Features Bento Card */}
        <BentoCard title="DSA Modules" icon={Layers}>
          <div className="space-y-3 text-xs text-[#504B38] my-auto">
            <div className="p-2.5 rounded-xl bg-[#EBE5C2]/60 border border-[#B9B28A]/50">
              <p className="font-bold">HashMap Indexing</p>
              <p className="text-[11px] text-[#8C8563] mt-0.5">O(1) calendar date lookup</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#EBE5C2]/60 border border-[#B9B28A]/50">
              <p className="font-bold">PriorityQueue Deadlines</p>
              <p className="text-[11px] text-[#8C8563] mt-0.5">Earliest deadline prioritization</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#EBE5C2]/60 border border-[#B9B28A]/50">
              <p className="font-bold">Interval Math Detection</p>
              <p className="text-[11px] text-[#8C8563] mt-0.5">Collision check: StartA &lt; EndB</p>
            </div>
          </div>
        </BentoCard>
      </div>

      {/* Stats Summary Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <BentoCard title="Total Calendar Events" icon={CalendarDays}>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-[#504B38]">
              {profile?.totalEvents ?? 0}
            </span>
            <p className="text-xs text-[#8C8563] mt-1">Saved in personal calendar</p>
          </div>
        </BentoCard>

        <BentoCard title="Active Deadlines" icon={Flame}>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-[#504B38]">
              {profile?.upcomingEvents ?? 0}
            </span>
            <p className="text-xs text-[#8C8563] mt-1">Approaching submissions</p>
          </div>
        </BentoCard>

        <BentoCard title="Unread Notifications" icon={Bell}>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-[#504B38]">
              {profile?.unreadNotifications ?? 0}
            </span>
            <p className="text-xs text-[#8C8563] mt-1">Alerts requiring attention</p>
          </div>
        </BentoCard>
      </div>
    </div>
  );
};
