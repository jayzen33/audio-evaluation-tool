import React, { useRef } from 'react';

interface AudioPlayerProps {
  src: string;
  className?: string;
  isGt?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, className, isGt }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleClick = () => {
    if (!audioRef.current) return;
    
    if (audioRef.current.paused) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  };

  return (
    <div 
      className={`rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-all ${isGt ? 'bg-white/60' : 'bg-white'} ${className || ''}`}
      onClick={handleClick}
    >
      <audio 
        ref={audioRef}
        controls 
        className="w-full h-10"
        src={src}
        controlsList="nodownload"
        style={{
          filter: isGt ? 'hue-rotate(220deg) saturate(1.2)' : 'none'
        }}
        onClick={(e) => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
      }}
      />
    </div>
  );
};
