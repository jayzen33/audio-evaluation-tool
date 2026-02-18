import { useRef, useImperativeHandle, forwardRef } from 'react';

interface AudioPlayerProps {
  src: string;
  className?: string;
  isGt?: boolean;
}

export interface AudioPlayerRef {
  play: () => void;
  pause: () => void;
  toggle: () => void;
}

export const AudioPlayer = forwardRef<AudioPlayerRef, AudioPlayerProps>(({ src, className, isGt }, ref) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useImperativeHandle(ref, () => ({
    play: () => audioRef.current?.play(),
    pause: () => audioRef.current?.pause(),
    toggle: () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (audio.paused) {
        audio.play();
      } else {
        audio.pause();
      }
    }
  }));

  const handleClick = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  };

  return (
    <div 
      className={`rounded-lg overflow-hidden cursor-pointer transition-all ${isGt ? 'bg-white/60' : 'bg-white'} ${className || ''}`}
      onClick={handleClick}
    >
      <audio 
        ref={audioRef}
        controls 
        className="w-full h-10"
        src={src}
        controlsList="nodownload"
        title=""
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
});
