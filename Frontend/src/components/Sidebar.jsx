import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  ListOrdered, 
  Bell, 
  User, 
  Sparkles,
  Layers,
  X
} from 'lucide-react';

export const Sidebar = ({ onOpenAddModal, isMobileOpen, onCloseMobile }) => {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/calendar', label: 'Calendar', icon: CalendarIcon },
    { to: '/events', label: 'All Events', icon: ListOrdered },
    { to: '/notifications', label: 'Alerts', icon: Bell },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full gap-5">
      {/* Mobile Drawer Close Button */}
      <div className="lg:hidden flex items-center justify-between pb-2 border-b border-[#B9B28A]/40">
        <span className="font-extrabold text-sm text-[#504B38]">SmartCal Navigation</span>
        <button
          onClick={onCloseMobile}
          className="p-1.5 rounded-xl hover:bg-[#EBE5C2] text-[#504B38] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick AI Extraction Bento Card in Sidebar */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#EBE5C2] to-[#EBE5C2]/70 border border-[#B9B28A]/60 shadow-sm relative overflow-hidden group">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-[#504B38] text-[#F8F3D9]">
            <Sparkles className="w-3.5 h-3.5 text-[#EBE5C2]" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#504B38]">AI Extractor</span>
        </div>
        <p className="text-xs text-[#504B38]/80 leading-relaxed mb-3">
          Paste a link, upload PDF or poster to parse events automatically.
        </p>
        <button
          onClick={() => {
            if (onCloseMobile) onCloseMobile();
            if (onOpenAddModal) onOpenAddModal();
          }}
          className="w-full btn-primary py-2 text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Quick Capture</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8563] px-3 mb-1">
          Menu
        </span>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => {
                if (onCloseMobile) onCloseMobile();
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-[#504B38] text-[#F8F3D9] shadow-md shadow-[#504B38]/10 font-bold'
                    : 'text-[#504B38]/80 hover:bg-[#EBE5C2]/80 hover:text-[#504B38]'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* System Status Indicators */}
      <div className="mt-auto pt-4 border-t border-[#B9B28A]/30 text-[11px] text-[#8C8563] space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-700 animate-pulse" />
            AI Pipeline
          </span>
          <span className="font-semibold text-[#504B38]">Online</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3 h-3" />
            DSA Matrix
          </span>
          <span className="font-semibold text-[#504B38]">Active</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed width, sticky) */}
      <aside className="w-60 xl:w-64 hidden lg:flex flex-col p-4 xl:p-5 border-r border-[#B9B28A]/40 min-h-[calc(100vh-65px)] bg-[#F8F3D9]/50 backdrop-blur-md flex-shrink-0 sticky top-[65px] self-start h-[calc(100vh-65px)] overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay & Slide-out */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-[#504B38]/50 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#F8F3D9] p-5 shadow-2xl z-50 border-r border-[#B9B28A] overflow-y-auto animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
