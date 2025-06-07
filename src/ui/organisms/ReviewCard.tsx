import React from 'react';
import { Star } from 'lucide-react'; // Using lucide-react for icons
import { cn } from '@/lib/utils';

export interface ReviewCardProps {
  title?: string; // Optional title for the review
  authorName: string;
  authorAvatarUrl?: string;
  rating: number; // Expecting a value from 1 to 5
  reviewText: string;
  date: string;
  source?: string; // Optional: e.g., 'Planora App', 'Google Play'
  className?: string;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  title,
  authorName,
  authorAvatarUrl,
  rating,
  reviewText,
  date,
  source,
  className,
}) => {
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-5 h-5 ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300/50 fill-gray-300/20'}`}
        />
      );
    }
    return stars;
  };

  return (
    <div className={cn("bg-gradient-to-br from-black/60 to-planora-purple-dark/40 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg p-6 h-full flex flex-col justify-between min-h-[280px] max-w-sm mx-auto", className)}>
      <div>
        <div className="flex items-center mb-4">
          {authorAvatarUrl ? (
            <img src={authorAvatarUrl} alt={`${authorName}'s avatar`} className="w-12 h-12 rounded-full mr-4 border-2 border-planora-accent-blue/50" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-planora-blue/30 flex items-center justify-center text-white font-bold text-xl mr-4 border-2 border-planora-accent-blue/50">
              {authorName.substring(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-white">{authorName}</h3>
            <div className="flex items-center">
              {renderStars()}
            </div>
          </div>
        </div>
        {title && <h4 className="text-md font-semibold text-white mb-2 truncate">{title}</h4>}
        <p className='text-white/80 text-sm leading-relaxed line-clamp-5 mb-4'>
          {/* Using line-clamp to limit text, ensure tailwind.config.js has line-clamp plugin if not default */}
          {reviewText}
        </p>
      </div>
      <div className="text-xs text-white/50 mt-auto">
        <span>{date}</span>
        {source && <span className='mx-1'>|</span>}
        {source && <span>{source}</span>}
      </div>
    </div>
  );
};
