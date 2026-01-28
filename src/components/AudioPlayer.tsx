import React from 'react';

interface AudioPlayerProps {
  src: string;
  className?: string;
  isGt?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, className, isGt }) => {
  return (
    <div className={`rounded-lg overflow-hidden ${isGt ? 'bg-white/60' : 'bg-white'} ${className || ''}`}>
      <audio 
        controls 
        className="w-full h-10"
        src={src}
        controlsList="nodownload"
        style={{
          filter: isGt ? 'hue-rotate(220deg) saturate(1.2)' : 'none'
        }}
      />
    </div>
  );
};
