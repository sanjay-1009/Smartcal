import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  Calendar, 
  Bell, 
  Plus, 
  LogOut, 
  User as UserIcon, 
  Sparkles, 
  CheckCheck, 
  Clock, 
  ExternalLink,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

export const Navbar = ({ onOpenAddModal, onToggleMobileSidebar, isMobileSidebarOpen }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full px-3 sm:px-6 lg:px-8 py-3 backdrop-blur-xl bg-[#F8F3D9]/85 border-b border-[#B9B28A]/40 transition-all">
      <div className="w-full flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile Menu Toggle & Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl bg-[#EBE5C2]/70 hover:bg-[#EBE5C2] border border-[#B9B28A]/40 text-[#504B38] transition-colors cursor-pointer"
            aria-label="Toggle navigation"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#504B38] text-[#F8F3D9] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#EBE5C2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#504B38]">SmartCal</span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#B9B28A]/30 text-[#504B38] border border-[#B9B28A]/50 hidden xs:inline">
                  AI Hub
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#8C8563] font-medium hidden md:block">
                Intelligent Event Manager
              </p>
            </div>
          </Link>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick AI Add Event Button */}
          <button
            onClick={() => onOpenAddModal && onOpenAddModal()}
            className="btn-primary py-2 px-3 sm:px-4 text-xs sm:text-sm rounded-xl flex items-center gap-1.5 sm:gap-2 shadow-sm group cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#B9B28A] group-hover:rotate-12 transition-transform" />
            <span className="font-semibold hidden sm:inline">Add Event</span>
            <span className="font-semibold sm:hidden text-xs">Add</span>
          </button>

          {/* Notifications Dropdown Trigger */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 sm:p-2.5 rounded-xl bg-[#EBE5C2]/60 hover:bg-[#EBE5C2] border border-[#B9B28A]/40 text-[#504B38] transition-all cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#504B38] text-[#F8F3D9] text-[9px] sm:text-[10px] font-bold flex items-center justify-center shadow-md border-2 border-[#F8F3D9] animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Popover Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-2.5 w-72 sm:w-96 rounded-2xl bg-[#F8F3D9] border border-[#B9B28A] shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-3 sm:p-3.5 bg-[#EBE5C2]/70 border-b border-[#B9B28A]/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#504B38]" />
                    <span className="font-bold text-xs sm:text-sm text-[#504B38]">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] sm:text-xs bg-[#504B38] text-[#F8F3D9] px-2 py-0.5 rounded-full font-semibold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllAsRead()}
                      className="text-[11px] text-[#504B38] hover:text-[#3B3728] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-[#B9B28A]/20">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-[#8C8563]">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#504B38]" />
                      <p className="text-xs sm:text-sm font-medium">No notifications yet</p>
                      <p className="text-[11px] mt-0.5">Deadline alerts and reminders will appear here.</p>
                    </div>
                  ) : (
                    notifications.slice(0, 8).map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          if (notif.status === 'UNREAD') markAsRead(notif.id);
                          if (notif.eventId) {
                            setShowNotifications(false);
                            navigate(`/events/${notif.eventId}`);
                          }
                        }}
                        className={`p-3 sm:p-3.5 transition-colors cursor-pointer text-left ${
                          notif.status === 'UNREAD'
                            ? 'bg-[#EBE5C2]/40 hover:bg-[#EBE5C2]/70 font-medium'
                            : 'hover:bg-[#EBE5C2]/20 text-[#8C8563]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs text-[#504B38] leading-relaxed">
                            {notif.message}
                          </p>
                          {notif.status === 'UNREAD' && (
                            <span className="w-2 h-2 rounded-full bg-[#504B38] flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[#8C8563]">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(notif.notificationTime).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <Link
                  to="/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="block text-center py-2.5 bg-[#EBE5C2]/50 hover:bg-[#EBE5C2] text-xs font-bold text-[#504B38] border-t border-[#B9B28A]/30 transition-colors"
                >
                  View All Notifications
                </Link>
              </div>
            )}
          </div>

          {/* User Profile Avatar Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 sm:pr-2.5 rounded-xl bg-[#EBE5C2]/50 hover:bg-[#EBE5C2] border border-[#B9B28A]/40 transition-all cursor-pointer"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#504B38] text-[#F8F3D9] flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                {user?.username ? user.username.charAt(0) : 'U'}
              </div>
              <span className="text-xs font-bold text-[#504B38] hidden sm:inline max-w-[100px] truncate">
                {user?.username || 'User'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#504B38]/60 hidden sm:inline" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2.5 w-48 rounded-xl bg-[#F8F3D9] border border-[#B9B28A] shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 py-1">
                <div className="px-3.5 py-2.5 border-b border-[#B9B28A]/30">
                  <p className="text-xs font-bold text-[#504B38] truncate">{user?.username}</p>
                  <p className="text-[11px] text-[#8C8563] truncate">{user?.mobileNumber}</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-[#504B38] hover:bg-[#EBE5C2] transition-colors"
                >
                  <UserIcon className="w-4 h-4" />
                  Profile & Stats
                </Link>
                <button
                  onClick={() => logout()}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors text-left cursor-pointer border-t border-[#B9B28A]/20"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
