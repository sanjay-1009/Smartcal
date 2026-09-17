import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AddEventModal } from './components/AddEventModal';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { VerifyOtpPage } from './pages/VerifyOtpPage';
import { DashboardPage } from './pages/DashboardPage';
import { CalendarPage } from './pages/CalendarPage';
import { EventsListPage } from './pages/EventsListPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { 
  Loader2, 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  ListOrdered, 
  Bell, 
  User, 
  Plus 
} from 'lucide-react';

// Protected Route Wrapper
const ProtectedLayout = ({ onOpenAddModal }) => {
  const { isAuthenticated, loading } = useAuth();
  const { unreadCount } = useNotification();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F3D9] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#504B38]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F8F3D9] flex flex-col selection:bg-[#B9B28A] selection:text-[#504B38]">
      {/* Full-width sticky top navbar */}
      <Navbar 
        onOpenAddModal={onOpenAddModal} 
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        isMobileSidebarOpen={isMobileSidebarOpen}
      />

      <div className="flex-1 flex w-full">
        {/* Responsive Desktop Sidebar + Mobile Drawer */}
        <Sidebar 
          onOpenAddModal={onOpenAddModal} 
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Full space utilization main content area */}
        <main className="flex-1 w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-7 overflow-x-hidden pb-20 lg:pb-8">
          <div className="w-full mx-auto">
            <Routes>
              <Route path="/dashboard" element={<DashboardPage onOpenAddModal={onOpenAddModal} />} />
              <Route path="/calendar" element={<CalendarPage onOpenAddModal={onOpenAddModal} />} />
              <Route path="/events" element={<EventsListPage onOpenAddModal={onOpenAddModal} />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F8F3D9]/95 backdrop-blur-xl border-t border-[#B9B28A]/50 px-2 py-2 flex items-center justify-around shadow-lg">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 p-1.5 rounded-xl text-[10px] font-bold transition-all ${
              isActive ? 'text-[#504B38]' : 'text-[#8C8563]'
            }`
          }
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/calendar"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 p-1.5 rounded-xl text-[10px] font-bold transition-all ${
              isActive ? 'text-[#504B38]' : 'text-[#8C8563]'
            }`
          }
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Calendar</span>
        </NavLink>

        {/* Center Quick Add Floating Button */}
        <button
          onClick={onOpenAddModal}
          className="w-10 h-10 -mt-5 rounded-full bg-[#504B38] text-[#F8F3D9] flex items-center justify-center shadow-lg border-2 border-[#F8F3D9] active:scale-95 transition-transform cursor-pointer"
          aria-label="Add Event"
        >
          <Plus className="w-5 h-5 text-[#EBE5C2]" />
        </button>

        <NavLink
          to="/notifications"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 p-1.5 rounded-xl text-[10px] font-bold transition-all relative ${
              isActive ? 'text-[#504B38]' : 'text-[#8C8563]'
            }`
          }
        >
          <Bell className="w-4 h-4" />
          <span>Alerts</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#504B38]" />
          )}
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 p-1.5 rounded-xl text-[10px] font-bold transition-all ${
              isActive ? 'text-[#504B38]' : 'text-[#8C8563]'
            }`
          }
        >
          <User className="w-4 h-4" />
          <span>Profile</span>
        </NavLink>
      </nav>
    </div>
  );
};

export function App() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />

            {/* Protected Application Routes */}
            <Route
              path="/*"
              element={
                <ProtectedLayout onOpenAddModal={() => setIsAddModalOpen(true)} />
              }
            />
          </Routes>

          {/* Global Multi-Modal AI Event Creator */}
          <AddEventModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onEventCreated={() => {
              window.location.reload();
            }}
          />
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
