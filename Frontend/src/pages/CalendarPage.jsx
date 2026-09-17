import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../services/eventService';
import { CalendarGrid } from '../components/CalendarGrid';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Filter, 
  Sparkles,
  Tag
} from 'lucide-react';

export const CalendarPage = ({ onOpenAddModal }) => {
  const [events, setEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getAllEvents();
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const categories = ['ALL', 'HACKATHON', 'WORKSHOP', 'COMPETITION', 'EXAM', 'SEMINAR', 'GENERAL'];

  const filteredEvents = selectedCategory === 'ALL'
    ? events
    : events.filter((e) => e.category?.toUpperCase() === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Top Header & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#504B38] tracking-tight flex items-center gap-2.5">
            <CalendarIcon className="w-6 h-6 text-[#504B38]" />
            <span>Interactive Calendar</span>
          </h1>
          <p className="text-xs text-[#8C8563] mt-1">
            View schedules, detect timeline collisions, and track event deadlines.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="btn-primary text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-[#EBE5C2]" />
          <span>Add Event</span>
        </button>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-[#8C8563] flex items-center gap-1 mr-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter:</span>
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-[#504B38] text-[#F8F3D9] border-[#504B38] shadow-sm'
                : 'bg-[#EBE5C2]/60 hover:bg-[#EBE5C2] text-[#504B38] border-[#B9B28A]/40'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Calendar Component */}
      <CalendarGrid
        events={filteredEvents}
        onSelectEvent={(ev) => navigate(`/events/${ev.id}`)}
      />
    </div>
  );
};
