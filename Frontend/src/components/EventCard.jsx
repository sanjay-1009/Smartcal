import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  ExternalLink, 
  AlertCircle, 
  Trash2, 
  Edit3,
  Flame,
  Tag
} from 'lucide-react';

export const EventCard = ({ event, onDelete, onEdit }) => {
  const getCategoryColor = (cat) => {
    switch (cat?.toUpperCase()) {
      case 'HACKATHON':
        return 'bg-[#504B38] text-[#F8F3D9] border-[#504B38]';
      case 'WORKSHOP':
        return 'bg-[#B9B28A]/40 text-[#504B38] border-[#B9B28A]';
      case 'COMPETITION':
        return 'bg-[#504B38]/80 text-[#F8F3D9] border-[#504B38]';
      case 'EXAM':
        return 'bg-red-900/10 text-red-900 border-red-300';
      case 'SEMINAR':
        return 'bg-[#EBE5C2] text-[#504B38] border-[#B9B28A]';
      default:
        return 'bg-[#EBE5C2]/80 text-[#504B38] border-[#B9B28A]/60';
    }
  };

  const getPriorityBadge = (pri) => {
    switch (pri?.toUpperCase()) {
      case 'URGENT':
        return { text: 'Urgent', style: 'bg-red-100 text-red-800 border-red-300 font-bold' };
      case 'HIGH':
        return { text: 'High Priority', style: 'bg-[#504B38] text-[#F8F3D9] border-[#504B38] font-semibold' };
      case 'LOW':
        return { text: 'Low Priority', style: 'bg-[#EBE5C2] text-[#8C8563] border-[#B9B28A]/40 font-normal' };
      default:
        return { text: 'Normal', style: 'bg-[#EBE5C2] text-[#504B38] border-[#B9B28A]/60 font-medium' };
    }
  };

  const priority = getPriorityBadge(event.priority);

  return (
    <div className="glass-card glass-card-interactive p-4 sm:p-5 flex flex-col justify-between group">
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`badge-category border ${getCategoryColor(event.category)}`}>
              <Tag className="w-3 h-3" />
              {event.category || 'GENERAL'}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${priority.style}`}>
              {priority.text}
            </span>
          </div>

          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                onClick={() => onEdit(event)}
                className="p-1.5 rounded-lg hover:bg-[#EBE5C2] text-[#504B38] transition-colors cursor-pointer"
                title="Edit Event"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(event.id)}
                className="p-1.5 rounded-lg hover:bg-red-100 text-red-700 transition-colors cursor-pointer"
                title="Delete Event"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <Link to={`/events/${event.id}`} className="block group-hover:underline">
          <h4 className="font-bold text-base text-[#504B38] leading-snug line-clamp-2">
            {event.eventName}
          </h4>
        </Link>

        {/* Description */}
        {event.description && (
          <p className="text-xs text-[#8C8563] mt-1.5 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        )}

        {/* Dates & Times */}
        <div className="mt-4 space-y-1.5 pt-3 border-t border-[#B9B28A]/30 text-xs text-[#504B38]/90">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-3.5 h-3.5 text-[#504B38] flex-shrink-0" />
            <span className="font-semibold">{event.startDate}</span>
            {event.endDate && event.endDate !== event.startDate && (
              <span className="text-[#8C8563]">→ {event.endDate}</span>
            )}
          </div>

          {event.startTime && (
            <div className="flex items-center gap-2 text-[#8C8563]">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>
                {event.startTime} {event.endTime ? `– ${event.endTime}` : ''}
              </span>
            </div>
          )}

          {event.location && (
            <div className="flex items-center gap-2 text-[#8C8563] truncate">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}

          {event.coordinatorName && (
            <div className="flex items-center gap-2 text-[#8C8563] truncate">
              <User className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">
                {event.coordinatorName} {event.coordinatorPhone ? `(${event.coordinatorPhone})` : ''}
              </span>
            </div>
          )}
        </div>

        {/* Deadlines Section */}
        {(event.registrationDeadline || event.submissionDeadline) && (
          <div className="mt-3.5 p-2.5 rounded-xl bg-[#EBE5C2]/50 border border-[#B9B28A]/50 space-y-1 text-[11px]">
            {event.registrationDeadline && (
              <div className="flex items-center justify-between text-[#504B38]">
                <span className="font-medium flex items-center gap-1">
                  <Flame className="w-3 h-3 text-[#504B38]" />
                  Registration:
                </span>
                <span className="font-bold">{event.registrationDeadline}</span>
              </div>
            )}
            {event.submissionDeadline && (
              <div className="flex items-center justify-between text-[#504B38]">
                <span className="font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-[#504B38]" />
                  Submission:
                </span>
                <span className="font-bold">{event.submissionDeadline}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Details & Source Link */}
      <div className="mt-4 pt-3 border-t border-[#B9B28A]/30 flex items-center justify-between">
        <Link
          to={`/events/${event.id}`}
          className="text-xs font-bold text-[#504B38] hover:underline"
        >
          View Full Details →
        </Link>

        {event.sourceUrl && (
          <a
            href={event.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8C8563] hover:text-[#504B38] bg-[#EBE5C2]/60 hover:bg-[#EBE5C2] px-2.5 py-1 rounded-lg border border-[#B9B28A]/40 transition-colors"
          >
            <span>Source</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
};
