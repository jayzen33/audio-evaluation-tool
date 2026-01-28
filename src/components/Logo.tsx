import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 40 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
        <linearGradient id="logoWave" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      
      {/* Background */}
      <rect x="16" y="16" width="224" height="224" rx="48" fill="url(#logoBg)" />
      
      {/* Waveform Bars */}
      <g transform="translate(128, 128)">
        <rect x="-60" y="-30" width="12" height="60" rx="6" fill="url(#logoWave)" />
        <rect x="-40" y="-45" width="12" height="90" rx="6" fill="url(#logoWave)" />
        <rect x="-20" y="-20" width="12" height="40" rx="6" fill="url(#logoWave)" opacity="0.9" />
        <rect x="0" y="-55" width="12" height="110" rx="6" fill="url(#logoWave)" />
        <rect x="20" y="-20" width="12" height="40" rx="6" fill="url(#logoWave)" opacity="0.9" />
        <rect x="40" y="-45" width="12" height="90" rx="6" fill="url(#logoWave)" />
        <rect x="60" y="-30" width="12" height="60" rx="6" fill="url(#logoWave)" />
      </g>
      
      {/* Checkmark Badge */}
      <circle cx="200" cy="200" r="28" fill="#10b981" />
      <path
        d="M 185 200 L 195 210 L 215 190"
        stroke="white"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Logo;
