import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Tag, 
  MapPin, 
  Flame,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday, 
  addDays, 
  subDays,
  addWeeks,
  subWeeks
} from 'date-fns';

export const CalendarGrid = ({ events = [], onSelectEvent, onSelectDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [selectedDay, setSelectedDay] = useState(new Date());

  const handlePrev = () => {
    if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const handleNext = () => {
    if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDay(now);
  };

  const getEventsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.filter((e) => {
      if (!e.startDate) return false;
      const eStart = String(e.startDate).substring(0, 10);
      const eEnd = e.endDate ? String(e.endDate).substring(0, 10) : eStart;
      return dateStr >= eStart && dateStr <= eEnd;
    });
  };

  // Find unique months where events exist to offer quick jump pills
  const eventMonths = Array.from(
    new Set(
      events
        .filter((e) => e.startDate)
        .map((e) => String(e.startDate).substring(0, 7)) // 'YYYY-MM'
    )
  ).sort();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const monthDays = eachDayOfInterval({ start: startDate, end: endDate });

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const selectedDayEvents = getEventsForDate(selectedDay);

  const getCategoryColor = (cat) => {
    switch (cat?.toUpperCase()) {
      case 'HACKATHON': return 'bg-[#504B38] text-[#F8F3D9]';
      case 'WORKSHOP': return 'bg-[#B9B28A] text-[#504B38]';
      case 'COMPETITION': return 'bg-[#504B38]/90 text-[#F8F3D9]';
      case 'EXAM': return 'bg-red-800 text-[#F8F3D9]';
      case 'SEMINAR': return 'bg-[#EBE5C2] text-[#504B38] border border-[#B9B28A]';
      default: return 'bg-[#EBE5C2] text-[#504B38] border border-[#B9B28A]/80';
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-5">
      {/* Calendar Header Controls */}
      <div className="glass-card p-3 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={handlePrev}
              className="p-1.5 sm:p-2 rounded-xl bg-[#EBE5C2]/60 hover:bg-[#EBE5C2] border border-[#B9B28A]/40 text-[#504B38] transition-colors cursor-pointer"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="btn-secondary text-xs py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-xl cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 sm:p-2 rounded-xl bg-[#EBE5C2]/60 hover:bg-[#EBE5C2] border border-[#B9B28A]/40 text-[#504B38] transition-colors cursor-pointer"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="font-extrabold text-sm sm:text-lg xl:text-xl text-[#504B38] tracking-tight">
            {viewMode === 'month' && format(currentDate, 'MMMM yyyy')}
            {viewMode === 'week' && `Week of ${format(weekStart, 'MMM d, yyyy')}`}
            {viewMode === 'day' && format(currentDate, 'EEEE, MMMM d, yyyy')}
          </h2>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#EBE5C2]/60 border border-[#B9B28A]/40 text-xs font-bold w-full sm:w-auto justify-center">
          {['month', 'week', 'day'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`py-1.5 px-3 sm:px-4 rounded-lg capitalize transition-all cursor-pointer ${
                viewMode === mode
                  ? 'bg-[#504B38] text-[#F8F3D9] shadow-sm'
                  : 'text-[#504B38]/80 hover:bg-[#EBE5C2]'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Jump to Event Months Pill Bar */}
      {eventMonths.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="font-bold text-[#8C8563] text-[11px] whitespace-nowrap">
            Jump to Event Months:
          </span>
          {eventMonths.map((ym) => {
            const [y, m] = ym.split('-');
            const targetDate = new Date(Number(y), Number(m) - 1, 1);
            const isCurrentViewingMonth = isSameMonth(currentDate, targetDate);
            const count = events.filter((e) => String(e.startDate).startsWith(ym)).length;

            return (
              <button
                key={ym}
                onClick={() => {
                  setCurrentDate(targetDate);
                  setSelectedDay(targetDate);
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                  isCurrentViewingMonth
                    ? 'bg-[#504B38] text-[#F8F3D9] border-[#504B38]'
                    : 'bg-[#EBE5C2]/70 hover:bg-[#EBE5C2] text-[#504B38] border-[#B9B28A]/60'
                }`}
              >
                {format(targetDate, 'MMM yyyy')} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Month View (Full Width 12-Column Responsive Layout) */}
      {viewMode === 'month' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          {/* 7-Day Month Grid (Span 8 or 9 on desktop) */}
          <div className="lg:col-span-8 xl:col-span-9 glass-card p-3 sm:p-5 overflow-hidden">
            {/* Weekday Header */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#8C8563]">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {monthDays.map((day) => {
                const dayEvents = getEventsForDate(day);
                const isSelected = isSameDay(day, selectedDay);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isCurrentDay = isToday(day);

                return (
                  <div
                    key={day.toString()}
                    onClick={() => {
                      setSelectedDay(day);
                      if (onSelectDate) onSelectDate(day);
                    }}
                    className={`min-h-[65px] sm:min-h-[90px] xl:min-h-[105px] p-1 sm:p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#504B38] bg-[#EBE5C2] shadow-md'
                        : isCurrentMonth
                        ? 'border-[#B9B28A]/30 bg-[#F8F3D9]/50 hover:bg-[#EBE5C2]/40'
                        : 'border-transparent bg-transparent opacity-30 hover:opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[11px] sm:text-xs font-bold w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center ${
                          isCurrentDay
                            ? 'bg-[#504B38] text-[#F8F3D9]'
                            : isSelected
                            ? 'text-[#504B38] font-extrabold'
                            : 'text-[#504B38]/80'
                        }`}
                      >
                        {format(day, 'd')}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="text-[9px] sm:text-[10px] font-bold text-[#8C8563] hidden sm:inline">
                          {dayEvents.length}
                        </span>
                      )}
                    </div>

                    {/* Event indicators / chips */}
                    <div className="mt-1 space-y-0.5 sm:space-y-1 overflow-hidden">
                      {dayEvents.slice(0, 2).map((ev) => (
                        <div
                          key={ev.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSelectEvent) onSelectEvent(ev);
                          }}
                          className={`text-[8px] sm:text-[10px] font-semibold px-1 sm:px-1.5 py-0.5 rounded truncate ${getCategoryColor(
                            ev.category
                          )}`}
                          title={ev.eventName}
                        >
                          <span className="hidden sm:inline">
                            {ev.startTime ? `${ev.startTime.substring(0, 5)} ` : ''}
                          </span>
                          {ev.eventName}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[8px] sm:text-[9px] text-[#8C8563] font-bold pl-0.5">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Day Agenda Panel (Span 4 or 3 on desktop) */}
          <div className="lg:col-span-4 xl:col-span-3 glass-card p-4 sm:p-5 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#B9B28A]/40 mb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#504B38]" />
                <h3 className="font-extrabold text-xs sm:text-sm text-[#504B38]">
                  Agenda: {format(selectedDay, 'MMM d')}
                </h3>
              </div>
              <span className="text-xs font-bold text-[#8C8563]">
                {selectedDayEvents.length} scheduled
              </span>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-[480px] flex-1 pr-1">
              {selectedDayEvents.length === 0 ? (
                <div className="py-10 text-center text-[#8C8563]">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-30 text-[#504B38]" />
                  <p className="text-xs font-bold text-[#504B38]">No events on this day</p>
                  <p className="text-[11px] mt-0.5">Click "Add Event" to schedule an activity.</p>
                </div>
              ) : (
                selectedDayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => onSelectEvent && onSelectEvent(ev)}
                    className="p-3 sm:p-3.5 rounded-2xl bg-[#EBE5C2]/70 border border-[#B9B28A]/60 hover:border-[#504B38] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full ${getCategoryColor(ev.category)}`}>
                        {ev.category || 'EVENT'}
                      </span>
                      {ev.priority === 'URGENT' && (
                        <span className="text-[9px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                          Urgent
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#504B38] group-hover:underline line-clamp-2">
                      {ev.eventName}
                    </h4>
                    {ev.startTime && (
                      <div className="flex items-center gap-1.5 text-[11px] text-[#8C8563] mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{ev.startTime} – {ev.endTime || 'End'}</span>
                      </div>
                    )}
                    {ev.location && (
                      <div className="flex items-center gap-1.5 text-[11px] text-[#8C8563] mt-0.5 truncate">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{ev.location}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Week View */}
      {viewMode === 'week' && (
        <div className="glass-card p-4 sm:p-5 overflow-x-auto">
          <div className="grid grid-cols-7 gap-2 sm:gap-3 min-w-[650px]">
            {weekDays.map((day) => {
              const dayEvents = getEventsForDate(day);
              const isCurrentDay = isToday(day);

              return (
                <div
                  key={day.toString()}
                  className={`p-2.5 sm:p-3 rounded-2xl border flex flex-col gap-2 min-h-[360px] ${
                    isCurrentDay
                      ? 'bg-[#EBE5C2] border-[#504B38]'
                      : 'bg-[#F8F3D9]/50 border-[#B9B28A]/40'
                  }`}
                >
                  <div className="text-center pb-2 border-b border-[#B9B28A]/30">
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#8C8563] block">
                      {format(day, 'EEE')}
                    </span>
                    <span className={`text-sm sm:text-base font-extrabold inline-block mt-0.5 ${isCurrentDay ? 'text-[#504B38]' : ''}`}>
                      {format(day, 'd')}
                    </span>
                  </div>

                  <div className="space-y-2 overflow-y-auto flex-1">
                    {dayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => onSelectEvent && onSelectEvent(ev)}
                        className={`p-2 sm:p-2.5 rounded-xl cursor-pointer text-xs transition-transform hover:scale-[1.02] shadow-sm ${getCategoryColor(
                          ev.category
                        )}`}
                      >
                        <p className="font-bold truncate text-[11px] sm:text-xs">{ev.eventName}</p>
                        {ev.startTime && (
                          <p className="text-[9px] sm:text-[10px] opacity-80 mt-0.5">{ev.startTime}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day View */}
      {viewMode === 'day' && (
        <div className="glass-card p-4 sm:p-6">
          <div className="space-y-4">
            <div className="pb-3 border-b border-[#B9B28A]/40 flex items-center justify-between">
              <h3 className="font-extrabold text-base sm:text-lg text-[#504B38]">
                {format(currentDate, 'EEEE, MMMM d, yyyy')}
              </h3>
              <span className="text-xs font-bold text-[#8C8563]">
                {getEventsForDate(currentDate).length} events scheduled
              </span>
            </div>

            <div className="space-y-3">
              {getEventsForDate(currentDate).length === 0 ? (
                <div className="py-16 text-center text-[#8C8563]">
                  <CalendarIcon className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#504B38]" />
                  <p className="text-sm font-bold text-[#504B38]">No events scheduled for this day</p>
                  <p className="text-xs mt-1">Use the quick capture or Add Event button above.</p>
                </div>
              ) : (
                getEventsForDate(currentDate).map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => onSelectEvent && onSelectEvent(ev)}
                    className="p-3.5 sm:p-4 rounded-2xl bg-[#EBE5C2]/60 border border-[#B9B28A]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#504B38] transition-all cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getCategoryColor(ev.category)}`}>
                          {ev.category || 'EVENT'}
                        </span>
                        {ev.startTime && (
                          <span className="text-xs font-bold text-[#504B38]">
                            {ev.startTime} – {ev.endTime || 'End'}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm sm:text-base text-[#504B38]">{ev.eventName}</h4>
                      {ev.description && (
                        <p className="text-xs text-[#8C8563] mt-0.5 line-clamp-1">{ev.description}</p>
                      )}
                    </div>
                    {ev.location && (
                      <span className="text-xs text-[#8C8563] flex items-center gap-1.5 flex-shrink-0">
                        <MapPin className="w-3.5 h-3.5" />
                        {ev.location}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
