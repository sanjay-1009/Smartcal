import React, { useState, useEffect } from 'react';
import { eventService } from '../services/eventService';
import { EventCard } from '../components/EventCard';
import { 
  ListOrdered, 
  Search, 
  Filter, 
  Plus, 
  Sparkles, 
  Calendar as CalendarIcon, 
  ArrowUpDown,
  Clock
} from 'lucide-react';

export const EventsListPage = ({ onOpenAddModal }) => {
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [loading, setLoading] = useState(true);

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

  const handleDeleteEvent = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await eventService.deleteEvent(id);
        loadEvents();
      } catch (err) {
        console.error('Failed to delete event', err);
      }
    }
  };

  const categories = ['ALL', 'HACKATHON', 'WORKSHOP', 'COMPETITION', 'EXAM', 'SEMINAR', 'GENERAL'];

  const filteredEvents = events
    .filter((e) => {
      const matchCat = selectedCategory === 'ALL' || e.category?.toUpperCase() === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        e.eventName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.coordinatorName?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#504B38] tracking-tight flex items-center gap-2.5">
            <ListOrdered className="w-6 h-6 text-[#504B38]" />
            <span>All Events Hub</span>
          </h1>
          <p className="text-xs text-[#8C8563] mt-1">
            Search, filter, and manage your captured academic and competition events.
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

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#8C8563] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search events, organizers, venues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input w-full pl-10 text-xs sm:text-sm py-2"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#504B38] text-[#F8F3D9] border-[#504B38]'
                  : 'bg-[#EBE5C2]/60 hover:bg-[#EBE5C2] text-[#504B38] border-[#B9B28A]/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort Toggle */}
        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="btn-secondary text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5 self-end md:self-auto cursor-pointer whitespace-nowrap"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>{sortOrder === 'asc' ? 'Earliest First' : 'Latest First'}</span>
        </button>
      </div>

      {/* Events List Grid */}
      {filteredEvents.length === 0 ? (
        <div className="glass-card p-12 text-center text-[#8C8563]">
          <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#504B38]" />
          <h3 className="font-extrabold text-base text-[#504B38]">No events found</h3>
          <p className="text-xs text-[#8C8563] mt-1 max-w-sm mx-auto">
            {searchQuery || selectedCategory !== 'ALL'
              ? 'Try adjusting your search query or category filter.'
              : 'Add your first event using our multi-modal AI extractor.'}
          </p>
          <button
            onClick={onOpenAddModal}
            className="btn-primary text-xs py-2.5 px-4 rounded-xl mt-4 inline-flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#EBE5C2]" />
            <span>Add Event Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onDelete={handleDeleteEvent}
            />
          ))}
        </div>
      )}
    </div>
  );
};
