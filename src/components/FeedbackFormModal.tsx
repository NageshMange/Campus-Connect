import React, { useState } from 'react';
import { CollegeEvent } from '../types';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import { X, Star, MessageSquare } from 'lucide-react';

interface FeedbackFormModalProps {
  event: CollegeEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

export const FeedbackFormModal: React.FC<FeedbackFormModalProps> = ({
  event,
  isOpen,
  onClose,
  onSubmitted,
}) => {
  const [overallImpression, setOverallImpression] = useState(5);
  const [wellOrganized, setWellOrganized] = useState(5);
  const [speakerClarity, setSpeakerClarity] = useState(5);
  const [preparedness, setPreparedness] = useState(4);
  const [understandingImprovement, setUnderstandingImprovement] = useState(5);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !event) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.submitFeedback(
        event._id,
        {
          overallImpression,
          wellOrganized,
          speakerClarity,
          preparedness,
          understandingImprovement,
        },
        comments
      );

      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      });

      onSubmitted();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  const renderStarSelector = (
    label: string,
    value: number,
    setValue: (val: number) => void
  ) => {
    return (
      <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-800">{label}</label>
          <span className="text-xs font-mono font-bold text-amber-700">
            {value} / 5 Stars
          </span>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setValue(star)}
              className={`p-2 rounded-lg transition-all ${
                star <= value
                  ? 'text-amber-500 bg-amber-50 hover:bg-amber-100 scale-105'
                  : 'text-slate-300 hover:text-slate-400 bg-white'
              }`}
            >
              <Star className="w-5 h-5 fill-current" />
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-xl">
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Institutional Feedback Format (ACA/R/008A)
            </div>
            <h2 className="text-base font-bold text-slate-900 leading-snug">
              Student Event Feedback
            </h2>
            <p className="text-xs text-slate-500 truncate max-w-md mt-0.5">
              {event.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Survey Questions */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
              {error}
            </div>
          )}

          {renderStarSelector(
            '1. Overall impression of the Session',
            overallImpression,
            setOverallImpression
          )}

          {renderStarSelector(
            '2. The session was well-organized',
            wellOrganized,
            setWellOrganized
          )}

          {renderStarSelector(
            '3. The speaker explained the concepts clearly',
            speakerClarity,
            setSpeakerClarity
          )}

          {renderStarSelector(
            '4. Do you feel more prepared to apply concepts learned?',
            preparedness,
            setPreparedness
          )}

          {renderStarSelector(
            '5. How much did this session improve your understanding of the subject?',
            understandingImprovement,
            setUnderstandingImprovement
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              Additional Comments / Suggestions
            </label>
            <textarea
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Share specific topics that helped you most, or recommendations for future workshops..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Institutional Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
