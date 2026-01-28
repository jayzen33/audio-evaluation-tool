import React, { useEffect, useState } from 'react';
import { computeDiff } from '../utils/diff';
import type { DiffPart } from '../utils/diff';

interface LyricsDisplayProps {
  text: string;
  originalText?: string;
  className?: string;
  isGt?: boolean;
}

export const LyricsDisplay: React.FC<LyricsDisplayProps> = ({ text, originalText, className, isGt }) => {
  const [parts, setParts] = useState<DiffPart[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadLyrics = async () => {
      setLoading(true);
      setError(null);
      try {
        if (originalText && originalText !== text) {
          if (active) {
            setParts(computeDiff(originalText, text));
          }
        } else {
          if (active) {
            setParts([{ value: text }]);
          }
        }
      } catch (err) {
        if (active) {
          setError('Error loading lyrics');
          console.error(err);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadLyrics();

    return () => {
      active = false;
    };
  }, [text, originalText]);

  if (loading) return <div className="text-slate-400 text-sm animate-pulse">Loading lyrics...</div>;
  if (error) return <div className="text-red-400 text-sm">{error}</div>;

  return (
    <div className={`whitespace-pre-wrap text-xs leading-relaxed p-3 rounded-lg ${
      isGt 
        ? 'bg-white/80 border border-indigo-100 text-slate-700' 
        : 'bg-white border border-slate-100 text-slate-600'
    } ${className || ''}`}>
      {parts.map((part, index) => {
        if (part.removed) return null;
        
        return (
          <span 
            key={index} 
            className={part.added ? 'text-indigo-600 font-semibold bg-indigo-50 px-0.5 rounded' : ''}
          >
            {part.value}
          </span>
        );
      })}
    </div>
  );
};
