'use client';

import React from 'react';
import { X, Heart, AlertTriangle } from 'lucide-react';

interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: 'volunteer' | 'rsvp';
  eventTitle: string;
  loading?: boolean;
}

const CancellationModal: React.FC<CancellationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  type,
  eventTitle,
  loading = false
}) => {
  if (!isOpen) return null;

  const hadithQuotes = {
    volunteer: {
      arabic: "مَنْ كَانَ فِي حَاجَةِ أَخِيهِ كَانَ اللَّهُ فِي حَاجَتِهِ",
      english: "Whoever helps his brother in need, Allah will help him in his need.",
      reference: "Sahih Bukhari"
    },
    rsvp: {
      arabic: "وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ",
      english: "And cooperate in righteousness and piety.",
      reference: "Quran 5:2"
    }
  };

  const quote = hadithQuotes[type];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-bold text-gray-800">
              {type === 'volunteer' ? 'Cancel Volunteer Signup' : 'Cancel RSVP'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="text-center">
            <p className="text-gray-700 mb-4">
              Are you sure you want to cancel your {type === 'volunteer' ? 'volunteer signup' : 'RSVP'} for:
            </p>
            <p className="font-semibold text-gray-800 bg-gray-50 p-3 rounded-lg">
              {eventTitle}
            </p>
          </div>

          {/* Islamic Quote */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <Heart className="w-6 h-6 text-green-600 mx-auto mb-3" />
            <p className="text-lg font-arabic text-green-800 mb-2" dir="rtl">
              {quote.arabic}
            </p>
            <p className="text-sm text-green-700 italic mb-1">
              "{quote.english}"
            </p>
            <p className="text-xs text-green-600 font-semibold">
              {quote.reference}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 text-center">
              {type === 'volunteer' 
                ? 'While we understand circumstances change, remember that volunteering brings great reward. We hope you can still join us!'
                : 'Community events are stronger when we come together. We hope you can still join us!'
              }
            </p>
            {type === 'rsvp' && (
              <p className="text-xs text-blue-700 text-center mt-2 font-medium">
                Note: If you're also volunteering for this event, your volunteer signup will be cancelled too (since you can't volunteer if you're not attending).
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
            disabled={loading}
          >
            Keep My {type === 'volunteer' ? 'Signup' : 'RSVP'}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Cancelling...' : 'Yes, Cancel'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .font-arabic {
          font-family: 'Amiri', 'Times New Roman', serif;
        }
      `}</style>
    </div>
  );
};

export default CancellationModal;