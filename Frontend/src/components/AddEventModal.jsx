import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  Globe, 
  FileText, 
  Image as ImageIcon, 
  AlignLeft, 
  PenTool, 
  Check, 
  Loader2, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Link as LinkIcon, 
  AlertCircle,
  UploadCloud,
  CheckSquare,
  Square
} from 'lucide-react';
import { extractService } from '../services/extractService';
import { eventService } from '../services/eventService';
import { ConflictModal } from './ConflictModal';

export const AddEventModal = ({ isOpen, onClose, onEventCreated }) => {
  const [activeTab, setActiveTab] = useState('url'); // 'url', 'pdf', 'image', 'text', 'manual'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Input states for extraction
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // Extracted review stage
  const [extractedData, setExtractedData] = useState(null);
  const [isReviewStage, setIsReviewStage] = useState(false);

  // Selected fields toggles for user confirmation
  const [selectedFields, setSelectedFields] = useState({
    eventName: true,
    description: true,
    startDate: true,
    startTime: true,
    endDate: true,
    endTime: true,
    registrationDeadline: true,
    submissionDeadline: true,
    location: true,
    coordinatorName: true,
    coordinatorPhone: true,
    category: true,
    priority: true,
    sourceUrl: true,
  });

  // Editable form values
  const [formData, setFormData] = useState({
    eventName: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endDate: new Date().toISOString().split('T')[0],
    endTime: '12:00',
    registrationDeadline: '',
    submissionDeadline: '',
    location: '',
    coordinatorName: '',
    coordinatorPhone: '',
    sourceUrl: '',
    category: 'GENERAL',
    priority: 'MEDIUM',
    reminderMinutesBefore: 60,
    sourceType: 'MANUAL',
    originalContent: '',
  });

  // Conflict state
  const [conflictResult, setConflictResult] = useState(null);
  const [showConflictModal, setShowConflictModal] = useState(false);

  if (!isOpen) return null;

  const resetModal = () => {
    setIsReviewStage(false);
    setExtractedData(null);
    setError(null);
    setLoading(false);
    setUrlInput('');
    setTextInput('');
    setPdfFile(null);
    setImageFile(null);
    setConflictResult(null);
    setShowConflictModal(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  // Perform AI Extraction based on active tab
  const handleExtract = async () => {
    setError(null);
    setLoading(true);

    try {
      let result = null;
      if (activeTab === 'url') {
        if (!urlInput.trim()) {
          throw new Error('Please enter a valid event webpage URL');
        }
        result = await extractService.extractFromUrl(urlInput);
      } else if (activeTab === 'pdf') {
        if (!pdfFile) {
          throw new Error('Please select a PDF document to upload');
        }
        result = await extractService.extractFromPdf(pdfFile);
      } else if (activeTab === 'image') {
        if (!imageFile) {
          throw new Error('Please select an event poster image');
        }
        result = await extractService.extractFromImage(imageFile);
      } else if (activeTab === 'text') {
        if (!textInput.trim()) {
          throw new Error('Please paste or type event text');
        }
        result = await extractService.extractFromText(textInput);
      }

      if (result) {
        setExtractedData(result);
        setFormData({
          eventName: result.eventName || 'Untitled Event',
          description: result.description || '',
          startDate: result.startDate || new Date().toISOString().split('T')[0],
          startTime: result.startTime ? result.startTime.substring(0, 5) : '10:00',
          endDate: result.endDate || result.startDate || new Date().toISOString().split('T')[0],
          endTime: result.endTime ? result.endTime.substring(0, 5) : '12:00',
          registrationDeadline: result.registrationDeadline || '',
          submissionDeadline: result.submissionDeadline || '',
          location: result.location || '',
          coordinatorName: result.coordinatorName || '',
          coordinatorPhone: result.coordinatorPhone || '',
          sourceUrl: result.sourceUrl || (activeTab === 'url' ? urlInput : ''),
          category: result.category || 'GENERAL',
          priority: result.priority || 'MEDIUM',
          reminderMinutesBefore: 60,
          sourceType: result.sourceType || activeTab.toUpperCase(),
          originalContent: result.rawExtractedText || '',
        });

        // Initialize checkboxes based on confidence
        if (result.fieldConfidence) {
          setSelectedFields({
            eventName: true,
            description: result.fieldConfidence.description ?? true,
            startDate: true,
            startTime: result.fieldConfidence.startTime ?? true,
            endDate: result.fieldConfidence.endDate ?? true,
            endTime: result.fieldConfidence.endTime ?? true,
            registrationDeadline: !!result.registrationDeadline,
            submissionDeadline: !!result.submissionDeadline,
            location: result.fieldConfidence.location ?? true,
            coordinatorName: result.fieldConfidence.coordinatorName ?? true,
            coordinatorPhone: result.fieldConfidence.coordinatorPhone ?? true,
            category: true,
            priority: true,
            sourceUrl: !!result.sourceUrl,
          });
        }

        setIsReviewStage(true);
      }
    } catch (err) {
      console.error('Extraction error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to extract event data.');
    } finally {
      setLoading(false);
    }
  };

  const toggleField = (field) => {
    setSelectedFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Check for conflicts and save
  const handlePreSave = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Conflict check
      const conflictCheckDto = {
        startDate: formData.startDate,
        startTime: selectedFields.startTime && formData.startTime ? formData.startTime + ':00' : null,
        endDate: selectedFields.endDate ? formData.endDate : formData.startDate,
        endTime: selectedFields.endTime && formData.endTime ? formData.endTime + ':00' : null,
      };

      const conflict = await eventService.checkConflicts(conflictCheckDto);
      if (conflict && conflict.hasConflict) {
        setConflictResult(conflict);
        setShowConflictModal(true);
        setLoading(false);
        return;
      }

      // No conflict -> execute save directly
      await executeSave();
    } catch (err) {
      console.error('Save validation error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to validate schedule.');
      setLoading(false);
    }
  };

  const executeSave = async () => {
    setLoading(true);
    try {
      // Construct final payload only with selected fields
      const payload = {
        eventName: formData.eventName,
        description: selectedFields.description ? formData.description : '',
        startDate: formData.startDate,
        startTime: selectedFields.startTime && formData.startTime ? formData.startTime + ':00' : null,
        endDate: selectedFields.endDate ? formData.endDate : formData.startDate,
        endTime: selectedFields.endTime && formData.endTime ? formData.endTime + ':00' : null,
        registrationDeadline: selectedFields.registrationDeadline && formData.registrationDeadline ? formData.registrationDeadline : null,
        submissionDeadline: selectedFields.submissionDeadline && formData.submissionDeadline ? formData.submissionDeadline : null,
        location: selectedFields.location ? formData.location : '',
        coordinatorName: selectedFields.coordinatorName ? formData.coordinatorName : '',
        coordinatorPhone: selectedFields.coordinatorPhone ? formData.coordinatorPhone : '',
        sourceUrl: selectedFields.sourceUrl ? formData.sourceUrl : '',
        category: formData.category,
        priority: formData.priority,
        reminderMinutesBefore: Number(formData.reminderMinutesBefore) || 60,
        sourceType: formData.sourceType,
        originalContent: formData.originalContent,
      };

      const created = await eventService.createEvent(payload);
      if (onEventCreated) {
        onEventCreated(created);
      }
      handleClose();
    } catch (err) {
      console.error('Error saving event:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#504B38]/50 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="w-full max-w-2xl rounded-3xl bg-[#F8F3D9] border-2 border-[#B9B28A] shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        >
          {/* Modal Header */}
          <div className="p-4 sm:p-6 bg-[#EBE5C2]/80 border-b border-[#B9B28A]/40 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#504B38] text-[#F8F3D9] flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-[#EBE5C2]" />
              </div>
              <div>
                <h2 className="font-extrabold text-lg sm:text-xl text-[#504B38] tracking-tight">
                  {isReviewStage ? 'Confirm Extracted Event' : 'Add New Event'}
                </h2>
                <p className="text-xs text-[#8C8563] font-medium">
                  {isReviewStage 
                    ? 'Review and select which AI-extracted fields to store in your calendar.' 
                    : 'Choose an input method to automatically parse details using AI.'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-xl hover:bg-[#EBE5C2] text-[#504B38] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-100 border border-red-300 text-red-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-700" />
                <span>{error}</span>
              </div>
            )}

            {!isReviewStage ? (
              <>
                {/* Input Mode Selector Tabs */}
                <div className="grid grid-cols-5 gap-1.5 p-1 rounded-2xl bg-[#EBE5C2]/60 border border-[#B9B28A]/40 text-xs font-bold">
                  {[
                    { id: 'url', label: 'Web URL', icon: Globe },
                    { id: 'pdf', label: 'PDF Doc', icon: FileText },
                    { id: 'image', label: 'Poster OCR', icon: ImageIcon },
                    { id: 'text', label: 'Raw Text', icon: AlignLeft },
                    { id: 'manual', label: 'Manual', icon: PenTool },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setError(null);
                        }}
                        className={`py-2 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          activeTab === tab.id
                            ? 'bg-[#504B38] text-[#F8F3D9] shadow-sm'
                            : 'text-[#504B38]/80 hover:bg-[#EBE5C2]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="text-[11px] sm:text-xs">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab 1: URL Input */}
                {activeTab === 'url' && (
                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#504B38]">
                      Event Webpage or Registration URL
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-[#8C8563] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        placeholder="https://devfolio.co/hackathons/example or https://unstop.com/..."
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        className="glass-input w-full pl-10 text-xs sm:text-sm"
                      />
                    </div>
                    <p className="text-[11px] text-[#8C8563]">
                      SmartCal will scrape the webpage, extract dates, registration deadlines, organizers, and generate a structured calendar event.
                    </p>
                  </div>
                )}

                {/* Tab 2: PDF Upload */}
                {activeTab === 'pdf' && (
                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#504B38]">
                      Upload Event Brochure / Circular PDF
                    </label>
                    <div className="border-2 border-dashed border-[#B9B28A] rounded-2xl p-6 text-center hover:bg-[#EBE5C2]/30 transition-colors relative">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setPdfFile(e.target.files[0])}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <UploadCloud className="w-10 h-10 text-[#504B38] mx-auto mb-2 opacity-70" />
                      <p className="text-xs font-bold text-[#504B38]">
                        {pdfFile ? pdfFile.name : 'Drag & drop or click to select a PDF'}
                      </p>
                      <p className="text-[11px] text-[#8C8563] mt-1">
                        Apache PDFBox will extract document text and send it to the AI parser.
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab 3: Image OCR */}
                {activeTab === 'image' && (
                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#504B38]">
                      Upload Event Poster / Screenshot
                    </label>
                    <div className="border-2 border-dashed border-[#B9B28A] rounded-2xl p-6 text-center hover:bg-[#EBE5C2]/30 transition-colors relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files[0])}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <ImageIcon className="w-10 h-10 text-[#504B38] mx-auto mb-2 opacity-70" />
                      <p className="text-xs font-bold text-[#504B38]">
                        {imageFile ? imageFile.name : 'Drag & drop or click to select a poster image (PNG, JPG)'}
                      </p>
                      <p className="text-[11px] text-[#8C8563] mt-1">
                        OCR text recognition parses poster dates, deadlines, venue, and coordinators.
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab 4: Plain Text */}
                {activeTab === 'text' && (
                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#504B38]">
                      Paste Event Text / Announcement
                    </label>
                    <textarea
                      rows={6}
                      placeholder="Paste WhatsApp event broadcast, email announcement, or hackathon timeline here..."
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      className="glass-input w-full text-xs sm:text-sm font-sans"
                    />
                    <p className="text-[11px] text-[#8C8563]">
                      Our AI will automatically recognize dates, times, submission rules, and categories.
                    </p>
                  </div>
                )}

                {/* Tab 5: Manual Entry Form */}
                {activeTab === 'manual' && (
                  <div className="space-y-4 pt-1">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#504B38] mb-1">
                        Event Title *
                      </label>
                      <input
                        type="text"
                        name="eventName"
                        required
                        placeholder="e.g. Smart India Hackathon 2026"
                        value={formData.eventName}
                        onChange={handleInputChange}
                        className="glass-input w-full text-xs sm:text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#504B38] mb-1">Category</label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className="glass-input w-full text-xs sm:text-sm"
                        >
                          <option value="HACKATHON">Hackathon</option>
                          <option value="WORKSHOP">Workshop</option>
                          <option value="COMPETITION">Competition</option>
                          <option value="EXAM">Examination</option>
                          <option value="SEMINAR">Seminar / Webinar</option>
                          <option value="GENERAL">General Event</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#504B38] mb-1">Priority</label>
                        <select
                          name="priority"
                          value={formData.priority}
                          onChange={handleInputChange}
                          className="glass-input w-full text-xs sm:text-sm"
                        >
                          <option value="LOW">Low Priority</option>
                          <option value="MEDIUM">Medium Priority</option>
                          <option value="HIGH">High Priority</option>
                          <option value="URGENT">Urgent</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-[#504B38] mb-1">Start Date *</label>
                        <input
                          type="date"
                          name="startDate"
                          required
                          value={formData.startDate}
                          onChange={handleInputChange}
                          className="glass-input w-full text-xs p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#504B38] mb-1">Start Time</label>
                        <input
                          type="time"
                          name="startTime"
                          value={formData.startTime}
                          onChange={handleInputChange}
                          className="glass-input w-full text-xs p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#504B38] mb-1">End Date</label>
                        <input
                          type="date"
                          name="endDate"
                          value={formData.endDate}
                          onChange={handleInputChange}
                          className="glass-input w-full text-xs p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#504B38] mb-1">End Time</label>
                        <input
                          type="time"
                          name="endTime"
                          value={formData.endTime}
                          onChange={handleInputChange}
                          className="glass-input w-full text-xs p-2"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#504B38] mb-1">Registration Deadline</label>
                        <input
                          type="date"
                          name="registrationDeadline"
                          value={formData.registrationDeadline}
                          onChange={handleInputChange}
                          className="glass-input w-full text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#504B38] mb-1">Submission Deadline</label>
                        <input
                          type="date"
                          name="submissionDeadline"
                          value={formData.submissionDeadline}
                          onChange={handleInputChange}
                          className="glass-input w-full text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#504B38] mb-1">Venue / Mode</label>
                      <input
                        type="text"
                        name="location"
                        placeholder="Auditorium, Online / Zoom"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="glass-input w-full text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#504B38] mb-1">Coordinator Name</label>
                        <input
                          type="text"
                          name="coordinatorName"
                          placeholder="Dr. Smith"
                          value={formData.coordinatorName}
                          onChange={handleInputChange}
                          className="glass-input w-full text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#504B38] mb-1">Coordinator Phone</label>
                        <input
                          type="text"
                          name="coordinatorPhone"
                          placeholder="+91 9876543210"
                          value={formData.coordinatorPhone}
                          onChange={handleInputChange}
                          className="glass-input w-full text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#504B38] mb-1">Source Link (Optional)</label>
                      <input
                        type="url"
                        name="sourceUrl"
                        placeholder="https://..."
                        value={formData.sourceUrl}
                        onChange={handleInputChange}
                        className="glass-input w-full text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#504B38] mb-1">Description</label>
                      <textarea
                        rows={2}
                        name="description"
                        placeholder="Additional notes..."
                        value={formData.description}
                        onChange={handleInputChange}
                        className="glass-input w-full text-xs"
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Confirmation & Interactive Field Selection Review Stage */
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-[#B9B28A]/20 border border-[#B9B28A]/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#504B38]" />
                    <span className="font-bold text-[#504B38]">
                      AI Extracted ({formData.sourceType})
                    </span>
                  </div>
                  <span className="text-[11px] text-[#8C8563]">
                    Select checkbox for fields you want to save
                  </span>
                </div>

                {/* Event Name */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#504B38]">Event Name *</label>
                  </div>
                  <input
                    type="text"
                    name="eventName"
                    value={formData.eventName}
                    onChange={handleInputChange}
                    className="glass-input w-full text-xs sm:text-sm font-bold"
                  />
                </div>

                {/* Category & Priority */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#504B38] mb-1">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="glass-input w-full text-xs"
                    >
                      <option value="HACKATHON">Hackathon</option>
                      <option value="WORKSHOP">Workshop</option>
                      <option value="COMPETITION">Competition</option>
                      <option value="EXAM">Examination</option>
                      <option value="SEMINAR">Seminar</option>
                      <option value="GENERAL">General</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#504B38] mb-1">Priority</label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="glass-input w-full text-xs"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Dates & Times with checkboxes */}
                <div className="p-3.5 rounded-2xl bg-[#EBE5C2]/40 border border-[#B9B28A]/40 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <span className="text-[11px] font-bold text-[#504B38] block mb-1">Start Date</span>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        className="glass-input w-full text-xs p-1.5"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#504B38] mb-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedFields.startTime}
                          onChange={() => toggleField('startTime')}
                          className="rounded text-[#504B38]"
                        />
                        <span>Start Time</span>
                      </label>
                      <input
                        type="time"
                        name="startTime"
                        disabled={!selectedFields.startTime}
                        value={formData.startTime}
                        onChange={handleInputChange}
                        className={`glass-input w-full text-xs p-1.5 ${!selectedFields.startTime ? 'opacity-40' : ''}`}
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#504B38] mb-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedFields.endDate}
                          onChange={() => toggleField('endDate')}
                          className="rounded text-[#504B38]"
                        />
                        <span>End Date</span>
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        disabled={!selectedFields.endDate}
                        value={formData.endDate}
                        onChange={handleInputChange}
                        className={`glass-input w-full text-xs p-1.5 ${!selectedFields.endDate ? 'opacity-40' : ''}`}
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#504B38] mb-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedFields.endTime}
                          onChange={() => toggleField('endTime')}
                          className="rounded text-[#504B38]"
                        />
                        <span>End Time</span>
                      </label>
                      <input
                        type="time"
                        name="endTime"
                        disabled={!selectedFields.endTime}
                        value={formData.endTime}
                        onChange={handleInputChange}
                        className={`glass-input w-full text-xs p-1.5 ${!selectedFields.endTime ? 'opacity-40' : ''}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Deadlines with selection toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-[#EBE5C2]/40 border border-[#B9B28A]/40">
                    <label className="flex items-center gap-2 text-xs font-bold text-[#504B38] mb-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFields.registrationDeadline}
                        onChange={() => toggleField('registrationDeadline')}
                      />
                      <span>Registration Deadline</span>
                    </label>
                    <input
                      type="date"
                      name="registrationDeadline"
                      disabled={!selectedFields.registrationDeadline}
                      value={formData.registrationDeadline}
                      onChange={handleInputChange}
                      className={`glass-input w-full text-xs ${!selectedFields.registrationDeadline ? 'opacity-40' : ''}`}
                    />
                  </div>

                  <div className="p-3 rounded-2xl bg-[#EBE5C2]/40 border border-[#B9B28A]/40">
                    <label className="flex items-center gap-2 text-xs font-bold text-[#504B38] mb-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFields.submissionDeadline}
                        onChange={() => toggleField('submissionDeadline')}
                      />
                      <span>Submission Deadline</span>
                    </label>
                    <input
                      type="date"
                      name="submissionDeadline"
                      disabled={!selectedFields.submissionDeadline}
                      value={formData.submissionDeadline}
                      onChange={handleInputChange}
                      className={`glass-input w-full text-xs ${!selectedFields.submissionDeadline ? 'opacity-40' : ''}`}
                    />
                  </div>
                </div>

                {/* Location & Coordinator */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-[#504B38] mb-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFields.location}
                        onChange={() => toggleField('location')}
                      />
                      <span>Venue / Location</span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      disabled={!selectedFields.location}
                      value={formData.location}
                      onChange={handleInputChange}
                      className={`glass-input w-full text-xs ${!selectedFields.location ? 'opacity-40' : ''}`}
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-[#504B38] mb-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFields.coordinatorName}
                        onChange={() => toggleField('coordinatorName')}
                      />
                      <span>Coordinator</span>
                    </label>
                    <input
                      type="text"
                      name="coordinatorName"
                      disabled={!selectedFields.coordinatorName}
                      value={formData.coordinatorName}
                      onChange={handleInputChange}
                      className={`glass-input w-full text-xs ${!selectedFields.coordinatorName ? 'opacity-40' : ''}`}
                    />
                  </div>
                </div>

                {/* Source URL & Description */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-[#504B38] mb-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFields.sourceUrl}
                      onChange={() => toggleField('sourceUrl')}
                    />
                    <span>Original Source URL</span>
                  </label>
                  <input
                    type="url"
                    name="sourceUrl"
                    disabled={!selectedFields.sourceUrl}
                    value={formData.sourceUrl}
                    onChange={handleInputChange}
                    className={`glass-input w-full text-xs ${!selectedFields.sourceUrl ? 'opacity-40' : ''}`}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-[#504B38] mb-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFields.description}
                      onChange={() => toggleField('description')}
                    />
                    <span>Description Summary</span>
                  </label>
                  <textarea
                    rows={2}
                    name="description"
                    disabled={!selectedFields.description}
                    value={formData.description}
                    onChange={handleInputChange}
                    className={`glass-input w-full text-xs ${!selectedFields.description ? 'opacity-40' : ''}`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 sm:p-5 bg-[#EBE5C2]/60 border-t border-[#B9B28A]/40 flex items-center justify-between flex-shrink-0">
            {isReviewStage ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsReviewStage(false)}
                  className="btn-secondary text-xs py-2 px-3.5 cursor-pointer"
                >
                  ← Back to Input
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handlePreSave}
                  className="btn-primary text-xs py-2 px-5 cursor-pointer flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save to Calendar</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-secondary text-xs py-2 px-3.5 cursor-pointer"
                >
                  Cancel
                </button>
                {activeTab === 'manual' ? (
                  <button
                    type="button"
                    disabled={loading || !formData.eventName}
                    onClick={handlePreSave}
                    className="btn-primary text-xs py-2 px-5 cursor-pointer flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Save Event</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleExtract}
                    className="btn-primary text-xs py-2 px-5 cursor-pointer flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Extracting with AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-[#EBE5C2]" />
                        <span>Run AI Extraction</span>
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Collision Confirmation Modal */}
      <ConflictModal
        isOpen={showConflictModal}
        conflictResult={conflictResult}
        onConfirm={() => {
          setShowConflictModal(false);
          executeSave();
        }}
        onCancel={() => setShowConflictModal(false)}
      />
    </>
  );
};
