import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventService } from '../services/eventService';
import { userService } from '../services/userService';
import { BentoCard } from '../components/BentoCard';
import { EventCard } from '../components/EventCard';
import { 
  Calendar as CalendarIcon, 
  Sparkles, 
  Flame, 
  Clock, 
  ArrowRight, 
  Plus, 
  ListOrdered, 
  AlertCircle, 
  TrendingUp, 
  Zap, 
  CheckCircle2,
  CalendarDays,
  Globe,
  Tag,
  Layers,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';

export const DashboardPage = ({ onOpenAddModal }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [allEvents, upcoming, profile] = await Promise.all([
        eventService.getAllEvents(),
        eventService.getUpcomingEvents(),
        userService.getProfile(),
      ]);
      setEvents(allEvents);
      setUpcomingEvents(upcoming);
      setUserProfile(profile);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const todayEvents = events.filter((e) => {
    if (!e.startDate) return false;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const eStart = String(e.startDate).substring(0, 10);
    const eEnd = e.endDate ? String(e.endDate).substring(0, 10) : eStart;
    return todayStr >= eStart && todayStr <= eEnd;
  });

  const handleDeleteEvent = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await eventService.deleteEvent(id);
        loadDashboardData();
      } catch (err) {
        console.error('Failed to delete event', err);
      }
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Welcome & KPI Summary Bento Row (Full-width grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-5">
        {/* Welcome Card (Stretches on desktop) */}
        <BentoCard 
          className="sm:col-span-2 lg:col-span-2 xl:col-span-3 bg-gradient-to-br from-[#EBE5C2] to-[#EBE5C2]/60 border-[#B9B28A]"
          hover={false}
        >
          <div className="flex flex-col justify-between h-full">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#504B38]/10 text-[#504B38] text-[11px] sm:text-xs font-bold mb-2.5 border border-[#B9B28A]/60">
                <Sparkles className="w-3.5 h-3.5 text-[#504B38]" />
                <span>AI Calendar Workspace</span>
              </div>
              <h2 className="text-xl sm:text-2xl xl:text-3xl font-extrabold text-[#504B38] tracking-tight">
                Welcome back, {user?.username || 'Student'}
              </h2>
              <p className="text-xs sm:text-sm text-[#8C8563] mt-1.5 leading-relaxed max-w-xl">
                SmartCal automatically analyzes your event posters, circulars, and websites to eliminate manual scheduling.
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2.5 sm:gap-3">
              <button
                onClick={onOpenAddModal}
                className="btn-primary text-xs sm:text-sm py-2 sm:py-2.5 px-3.5 sm:px-4 rounded-xl shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#EBE5C2]" />
                <span>Capture Event with AI</span>
              </button>
              <Link
                to="/calendar"
                className="btn-secondary text-xs sm:text-sm py-2 sm:py-2.5 px-3.5 sm:px-4 rounded-xl flex items-center gap-1.5"
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Open Calendar</span>
              </Link>
            </div>
          </div>
        </BentoCard>

        {/* Quick Stat 1: Total Events */}
        <BentoCard
          title="Total Events"
          icon={CalendarDays}
          className="justify-between xl:col-span-1"
        >
          <div className="my-1 sm:my-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#504B38]">
              {events.length}
            </span>
            <p className="text-xs text-[#8C8563] mt-1">Tracked across categories</p>
          </div>
          <Link to="/events" className="text-xs font-bold text-[#504B38] flex items-center gap-1 hover:underline mt-2">
            <span>Manage All</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </BentoCard>

        {/* Quick Stat 2: Active Deadlines */}
        <BentoCard
          title="Upcoming Deadlines"
          icon={Flame}
          className="justify-between xl:col-span-1"
        >
          <div className="my-1 sm:my-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#504B38]">
              {upcomingEvents.filter((e) => e.registrationDeadline || e.submissionDeadline).length}
            </span>
            <p className="text-xs text-[#8C8563] mt-1">Priority queue active</p>
          </div>
          <Link to="/notifications" className="text-xs font-bold text-[#504B38] flex items-center gap-1 hover:underline mt-2">
            <span>View Alerts</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </BentoCard>

        {/* Quick Stat 3: Today's Events Count */}
        <BentoCard
          title="Today's Agenda"
          icon={Clock}
          className="justify-between xl:col-span-1"
        >
          <div className="my-1 sm:my-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#504B38]">
              {todayEvents.length}
            </span>
            <p className="text-xs text-[#8C8563] mt-1">Scheduled for today</p>
          </div>
          <Link to="/calendar" className="text-xs font-bold text-[#504B38] flex items-center gap-1 hover:underline mt-2">
            <span>Day View</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </BentoCard>
      </div>

      {/* Main Bento Grid Row: Priority Queue Deadlines + Today's Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Bento: Deadlines Priority Queue (Span 8 on desktop) */}
        <BentoCard
          title="Nearest Deadlines (DSA Priority Queue)"
          subtitle="Ordered automatically by earliest deadline first"
          icon={Flame}
          action={
            <Link to="/events" className="text-xs font-bold text-[#504B38] hover:underline flex items-center gap-1">
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          }
          className="lg:col-span-7 xl:col-span-8"
        >
          <div className="space-y-3 mt-2 flex-1">
            {upcomingEvents.length === 0 ? (
              <div className="p-8 text-center text-[#8C8563]">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-30 text-[#504B38]" />
                <p className="text-xs sm:text-sm font-bold text-[#504B38]">No upcoming deadlines</p>
                <p className="text-xs mt-0.5">Capture events with AI to track upcoming submission dates.</p>
              </div>
            ) : (
              upcomingEvents.slice(0, 4).map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 sm:p-4 rounded-2xl bg-[#EBE5C2]/60 border border-[#B9B28A]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#504B38] transition-all group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#504B38] text-[#F8F3D9]">
                        {ev.category || 'EVENT'}
                      </span>
                      {ev.priority === 'URGENT' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
                          Urgent
                        </span>
                      )}
                    </div>
                    <Link to={`/events/${ev.id}`} className="font-bold text-sm sm:text-base text-[#504B38] group-hover:underline block">
                      {ev.eventName}
                    </Link>
                    <div className="flex items-center gap-3 text-xs text-[#8C8563]">
                      <span>Event: {ev.startDate}</span>
                      {ev.location && <span className="truncate max-w-xs">• {ev.location}</span>}
                    </div>
                  </div>

                  {/* Deadline Badges */}
                  <div className="flex sm:flex-col items-start sm:items-end gap-1.5 flex-shrink-0">
                    {ev.registrationDeadline && (
                      <div className="text-xs font-semibold bg-[#EBE5C2] px-2.5 py-1 rounded-lg border border-[#B9B28A]/60 text-[#504B38]">
                        <span className="opacity-70 mr-1">Reg:</span>
                        <span className="font-bold">{ev.registrationDeadline}</span>
                      </div>
                    )}
                    {ev.submissionDeadline && (
                      <div className="text-xs font-semibold bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300 text-amber-900">
                        <span className="opacity-70 mr-1">Submit:</span>
                        <span className="font-bold">{ev.submissionDeadline}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </BentoCard>

        {/* Bento: Today's Schedule (Span 4 on desktop) */}
        <BentoCard
          title="Today's Schedule"
          subtitle={format(new Date(), 'EEEE, MMMM d')}
          icon={CalendarIcon}
          className="lg:col-span-5 xl:col-span-4"
        >
          <div className="space-y-3 mt-2 flex-1 overflow-y-auto max-h-80">
            {todayEvents.length === 0 ? (
              <div className="py-10 text-center text-[#8C8563]">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-30 text-[#504B38]" />
                <p className="text-xs sm:text-sm font-bold text-[#504B38]">Your schedule is clear today</p>
                <p className="text-xs mt-0.5">No activities scheduled for today.</p>
              </div>
            ) : (
              todayEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 sm:p-3.5 rounded-2xl bg-[#EBE5C2]/80 border border-[#B9B28A]/60 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold text-[#504B38] truncate">{ev.eventName}</span>
                    <span className="text-xs font-semibold text-[#8C8563] flex-shrink-0">
                      {ev.startTime || 'All Day'}
                    </span>
                  </div>
                  {ev.location && (
                    <span className="text-xs text-[#8C8563] truncate">{ev.location}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </BentoCard>
      </div>

      {/* Bento: Full Width Recent Events Hub & Multi-Modal Quick Dock */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Quick AI Extraction Dock (Span 4) */}
        <BentoCard
          title="AI Quick Capture"
          subtitle="Parse events instantly from any unstructured input"
          icon={Zap}
          className="lg:col-span-4"
        >
          <div className="space-y-4 my-auto">
            <p className="text-xs sm:text-sm text-[#504B38]/80 leading-relaxed">
              Have an event poster, PDF schedule, registration link, or text message? Launch our multi-modal AI parser to extract all dates and deadlines automatically.
            </p>

            <button
              onClick={onOpenAddModal}
              className="w-full btn-primary py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-[#EBE5C2]" />
              <span>Launch Multi-modal AI Extractor</span>
            </button>
          </div>
        </BentoCard>

        {/* Recent Events Grid (Span 8 - Expands fluidly) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base sm:text-lg text-[#504B38]">Recent Calendar Events</h3>
            <Link to="/events" className="text-xs font-bold text-[#504B38] hover:underline flex items-center gap-1">
              <span>View All ({events.length})</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {events.slice(0, 6).map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onDelete={handleDeleteEvent}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
