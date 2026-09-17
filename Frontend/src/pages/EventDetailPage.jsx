import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { eventService } from '../services/eventService';
import { BentoCard } from '../components/BentoCard';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  ExternalLink, 
  Flame, 
  AlertCircle, 
  Trash2, 
  ArrowLeft, 
  Sparkles,
  Tag,
  ShieldCheck,
  Share2
} from 'lucide-react';

export const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const data = await eventService.getEventById(id);
        setEvent(data);
      } catch (err) {
        console.error('Failed to load event details', err);
        setError('Event not found or access denied.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await eventService.deleteEvent(id);
        navigate('/events');
      } catch (err) {
        console.error('Failed to delete event', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-[#8C8563]">
        <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30 animate-pulse text-[#504B38]" />
        <p className="text-xs font-bold text-[#504B38]">Loading event details...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="glass-card p-12 text-center text-[#8C8563]">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-700 opacity-80" />
        <h3 className="font-extrabold text-base text-[#504B38]">{error || 'Event Not Found'}</h3>
        <Link to="/events" className="btn-primary text-xs py-2 px-4 rounded-xl mt-4 inline-flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Events</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Back Button & Action Controls */}
      <div className="flex items-center justify-between">
        <Link
          to="/events"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#504B38] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Events</span>
        </Link>

        <button
          onClick={handleDelete}
          className="btn-secondary text-xs py-2 px-3.5 rounded-xl text-red-700 hover:bg-red-100 hover:border-red-300 flex items-center gap-1.5 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Event</span>
        </button>
      </div>

      {/* Main Event Bento */}
      <div className="glass-card p-6 sm:p-8 space-y-6">
        {/* Title and Badges */}
        <div>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="badge-category bg-[#504B38] text-[#F8F3D9] text-xs px-3 py-1">
              <Tag className="w-3.5 h-3.5" />
              {event.category || 'GENERAL'}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#EBE5C2] border border-[#B9B28A] font-bold text-[#504B38]">
              {event.priority || 'MEDIUM'} Priority
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#504B38] tracking-tight leading-tight">
            {event.eventName}
          </h1>

          {event.description && (
            <p className="text-sm text-[#504B38]/90 mt-3 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          )}
        </div>

        {/* Schedule Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#B9B28A]/40">
          <div className="p-4 rounded-2xl bg-[#EBE5C2]/60 border border-[#B9B28A]/60 flex items-start gap-3">
            <Calendar className="w-5 h-5 text-[#504B38] flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8563] block">
                Event Date & Duration
              </span>
              <p className="font-bold text-sm text-[#504B38] mt-0.5">
                {event.startDate}
                {event.endDate && event.endDate !== event.startDate && ` → ${event.endDate}`}
              </p>
              {event.startTime && (
                <p className="text-xs text-[#8C8563] mt-0.5">
                  {event.startTime} {event.endTime ? `– ${event.endTime}` : ''}
                </p>
              )}
            </div>
          </div>

          {event.location && (
            <div className="p-4 rounded-2xl bg-[#EBE5C2]/60 border border-[#B9B28A]/60 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#504B38] flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8563] block">
                  Venue / Location
                </span>
                <p className="font-bold text-sm text-[#504B38] mt-0.5">
                  {event.location}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Deadlines Bento Highlight */}
        {(event.registrationDeadline || event.submissionDeadline) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {event.registrationDeadline && (
              <div className="p-4 rounded-2xl bg-[#EBE5C2]/80 border border-[#B9B28A] flex items-start gap-3">
                <Flame className="w-5 h-5 text-[#504B38] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#504B38] block">
                    Registration Deadline
                  </span>
                  <p className="font-extrabold text-base text-[#504B38] mt-0.5">
                    {event.registrationDeadline}
                  </p>
                </div>
              </div>
            )}

            {event.submissionDeadline && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-900 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block">
                    Submission Deadline
                  </span>
                  <p className="font-extrabold text-base text-amber-900 mt-0.5">
                    {event.submissionDeadline}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Coordinator Info & Source Link */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#B9B28A]/40">
          {(event.coordinatorName || event.coordinatorPhone) && (
            <div className="space-y-1.5 text-xs text-[#504B38]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8563] block mb-1">
                Contact & Organizer
              </span>
              {event.coordinatorName && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#8C8563]" />
                  <span className="font-semibold">{event.coordinatorName}</span>
                </div>
              )}
              {event.coordinatorPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#8C8563]" />
                  <span className="font-semibold">{event.coordinatorPhone}</span>
                </div>
              )}
            </div>
          )}

          {event.sourceUrl && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8563] block mb-1">
                Original Event Source (FR-11)
              </span>
              <a
                href={event.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-xs py-2.5 px-4 rounded-xl inline-flex items-center gap-2"
              >
                <span>Visit Source Webpage</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
