import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { 
  Bell, 
  CheckCheck, 
  Clock, 
  Calendar, 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const NotificationsPage = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotification();
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'UNREAD'
  const navigate = useNavigate();

  const filtered = filter === 'UNREAD'
    ? notifications.filter((n) => n.status === 'UNREAD')
    : notifications;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#504B38] tracking-tight flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-[#504B38]" />
            <span>Notification & Deadline Alerts</span>
          </h1>
          <p className="text-xs text-[#8C8563] mt-1">
            Automated notifications for upcoming registration and submission deadlines.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="btn-secondary text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
            filter === 'ALL'
              ? 'bg-[#504B38] text-[#F8F3D9] border-[#504B38]'
              : 'bg-[#EBE5C2]/60 hover:bg-[#EBE5C2] text-[#504B38] border-[#B9B28A]/40'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
            filter === 'UNREAD'
              ? 'bg-[#504B38] text-[#F8F3D9] border-[#504B38]'
              : 'bg-[#EBE5C2]/60 hover:bg-[#EBE5C2] text-[#504B38] border-[#B9B28A]/40'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notification Items List */}
      <div className="glass-card divide-y divide-[#B9B28A]/30 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-[#8C8563]">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#504B38]" />
            <h3 className="font-extrabold text-base text-[#504B38]">All caught up!</h3>
            <p className="text-xs text-[#8C8563] mt-1">
              You have no {filter === 'UNREAD' ? 'unread' : ''} notifications at this time.
            </p>
          </div>
        ) : (
          filtered.map((notif) => {
            const isUnread = notif.status === 'UNREAD';
            const isUrgent = notif.notificationType?.includes('URGENT');

            return (
              <div
                key={notif.id}
                onClick={() => {
                  if (isUnread) markAsRead(notif.id);
                  if (notif.eventId) navigate(`/events/${notif.eventId}`);
                }}
                className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors cursor-pointer ${
                  isUnread ? 'bg-[#EBE5C2]/60 hover:bg-[#EBE5C2]/80' : 'hover:bg-[#EBE5C2]/30 text-[#8C8563]'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isUrgent
                        ? 'bg-red-100 text-red-800'
                        : isUnread
                        ? 'bg-[#504B38] text-[#F8F3D9]'
                        : 'bg-[#EBE5C2] text-[#8C8563]'
                    }`}
                  >
                    {isUrgent ? (
                      <Flame className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className={`text-xs sm:text-sm leading-relaxed ${isUnread ? 'font-bold text-[#504B38]' : 'text-[#504B38]/80'}`}>
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-[#8C8563]">
                      <span>{new Date(notif.notificationTime).toLocaleString()}</span>
                      {notif.eventName && (
                        <span className="font-semibold text-[#504B38]">
                          • Event: {notif.eventName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {isUnread && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#504B38]" title="Unread" />
                  )}
                  {notif.eventId && (
                    <ArrowRight className="w-4 h-4 text-[#8C8563] hover:text-[#504B38]" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
