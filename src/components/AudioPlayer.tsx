import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface AudioPlayerProps {
  src: string;
  className?: string;
  isGt?: boolean;
  height?: number;
}

export interface AudioPlayerRef {
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seekTo: (progress: number) => void;
}

export const AudioPlayer = forwardRef<AudioPlayerRef, AudioPlayerProps>(({ 
  src, 
  className, 
  isGt, 
  height = 64 
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const isPlayingRef = useRef(false);

  const initWavesurfer = useCallback(() => {
    if (!containerRef.current) return;

    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }

    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: isGt ? '#a5b4fc' : '#94a3b8',
      progressColor: isGt ? '#818cf8' : '#475569',
      cursorColor: isGt ? '#6366f1' : '#334155',
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: height,
      normalize: true,
      backend: 'WebAudio',
    });

    wavesurfer.load(src);

    wavesurfer.on('play', () => {
      isPlayingRef.current = true;
    });

    wavesurfer.on('pause', () => {
      isPlayingRef.current = false;
    });

    wavesurfer.on('finish', () => {
      isPlayingRef.current = false;
    });

    wavesurferRef.current = wavesurfer;
  }, [src, isGt, height]);

  useEffect(() => {
    initWavesurfer();

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
    };
  }, [initWavesurfer]);

  useImperativeHandle(ref, () => ({
    play: () => wavesurferRef.current?.play(),
    pause: () => wavesurferRef.current?.pause(),
    toggle: () => wavesurferRef.current?.playPause(),
    seekTo: (progress: number) => wavesurferRef.current?.seekTo(progress),
  }));

  const handleClick = () => {
    wavesurferRef.current?.playPause();
  };

  return (
    <div 
      className={`rounded-lg overflow-hidden cursor-pointer transition-all ${isGt ? 'bg-white/60' : 'bg-white'} ${className || ''}`}
      onClick={handleClick}
    >
      <div ref={containerRef} className="w-full" />
    </div>
  );
});
