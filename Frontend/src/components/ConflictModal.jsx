import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, Calendar, X, ArrowRight, ShieldAlert } from 'lucide-react';

export const ConflictModal = ({ isOpen, conflictResult, onConfirm, onCancel }) => {
  if (!isOpen || !conflictResult?.hasConflict) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#504B38]/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg rounded-2xl bg-[#F8F3D9] border-2 border-[#B9B28A] shadow-2xl p-6 relative overflow-hidden"
        >
          {/* Header Warning */}
          <div className="flex items-start gap-3.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-[#504B38]">
                {conflictResult.isTimeConflict ? 'Scheduling Conflict Detected' : 'Schedule Warning'}
              </h3>
              <p className="text-xs text-[#8C8563] mt-0.5">
                {conflictResult.message}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="ml-auto p-1.5 rounded-lg hover:bg-[#EBE5C2] text-[#504B38] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Conflicting Events List */}
          <div className="my-4 space-y-2.5 max-h-56 overflow-y-auto pr-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8563]">
              Colliding Schedule(s):
            </span>
            {conflictResult.conflictingEvents?.map((ev) => (
              <div
                key={ev.id}
                className="p-3 rounded-xl bg-[#EBE5C2]/60 border border-[#B9B28A]/60 flex flex-col gap-1 text-xs"
              >
                <div className="flex items-center justify-between font-bold text-[#504B38]">
                  <span className="truncate">{ev.eventName}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#504B38] text-[#F8F3D9]">
                    {ev.category || 'EVENT'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-[#8C8563]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#504B38]" />
                    {ev.startDate}
                  </span>
                  {ev.startTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#504B38]" />
                      {ev.startTime} – {ev.endTime || 'End'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-4 border-t border-[#B9B28A]/30 flex flex-col sm:flex-row items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto btn-secondary text-xs py-2.5 px-4 cursor-pointer"
            >
              Adjust Event Timing
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="w-full sm:w-auto btn-primary text-xs py-2.5 px-4 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Save Anyway</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
