import React from 'react';
import { isAudioData } from '../types';
import type { AudioItem } from '../types';
import { AudioPlayer } from './AudioPlayer';
import { ContentDisplay } from './ContentDisplay';
import { TagButton, TagBadge, type TagValue } from './TagButton';

interface AudioComparisonRowProps {
  item: AudioItem;
  index: number;
  tags: Record<string, TagValue>;
  onTagChange: (variantKey: string, value: TagValue) => void;
}

export const AudioComparisonRow: React.FC<AudioComparisonRowProps> = ({ item, index, tags, onTagChange }) => {
  const { uuid, ...variants } = item;

  const gtData = variants['melody_GT'];
  const gtContentText = isAudioData(gtData) 
    ? gtData.content
    : undefined;

  const sortedKeys = Object.keys(variants).sort((a, b) => {
    if (a === 'melody_GT') return -1;
    if (b === 'melody_GT') return 1;
    return a.localeCompare(b);
  });

  // Count tags for this row
  const taggedCount = Object.values(tags).filter(v => v !== null).length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
      {/* Header with ID */}
      <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 text-sm font-semibold">
            #{index + 1}
          </span>
          <h3 className="text-base font-semibold text-slate-800 font-mono">{uuid}</h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          {taggedCount > 0 && (
            <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg font-medium">
              {taggedCount}/{sortedKeys.length} tagged
            </span>
          )}
          <span>{sortedKeys.length} variants</span>
        </div>
      </div>

      {/* Variants Grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sortedKeys.map((key) => {
            const data = variants[key];
            if (!isAudioData(data)) return null;

            const audioSrc = data.wav;
            const contentText = data.content;
            const isGt = key === 'melody_GT';
            const currentTag = tags[key] || null;

            return (
              <div 
                key={key} 
                className={`rounded-xl p-4 transition-all duration-200 relative ${
                  isGt 
                    ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 shadow-sm' 
                    : currentTag 
                      ? currentTag === 'good' 
                        ? 'bg-emerald-50/50 border-2 border-emerald-200' 
                        : currentTag === 'bad'
                          ? 'bg-rose-50/50 border-2 border-rose-200'
                          : 'bg-amber-50/50 border-2 border-amber-200'
                      : 'bg-slate-50 border border-slate-100 hover:border-slate-200 hover:bg-slate-100/50'
                }`}
              >
                {/* Variant Label & Tag Button */}
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      isGt 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm' 
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}>
                      {isGt && (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                      {isGt ? 'Ground Truth' : key}
                    </span>
                    {!isGt && <TagBadge value={currentTag} />}
                  </div>
                  
                  {/* Tag Button - only show for non-GT variants */}
                  {!isGt && (
                    <TagButton 
                      value={currentTag} 
                      onChange={(value) => onTagChange(key, value)} 
                    />
                  )}
                </div>
                
                {/* Audio Player */}
                <div className="mb-3">
                  <AudioPlayer src={audioSrc} isGt={isGt} />
                </div>
                
                {/* Content */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h4 className="text-xs text-slate-500 font-medium">Content</h4>
                  </div>
                  <ContentDisplay 
                    text={contentText} 
                    originalText={isGt ? undefined : gtContentText}
                    className="h-48 overflow-y-auto"
                    isGt={isGt}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
