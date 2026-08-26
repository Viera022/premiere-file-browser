import React from 'react';
import { Language } from '../i18n/translations';

interface FlagIconProps {
  code: Language;
  className?: string;
}

export const FlagIcon: React.FC<FlagIconProps> = ({ code, className = 'w-5 h-3.5' }) => {
  switch (code) {
    case 'pt': // Brasil
      return (
        <svg viewBox="0 0 720 504" className={`rounded-[2px] shadow-sm shrink-0 overflow-hidden ${className}`}>
          <rect width="720" height="504" fill="#009c3b" />
          <polygon points="360,40 680,252 360,464 40,252" fill="#ffdf00" />
          <circle cx="360" cy="252" r="120" fill="#002776" />
          <path d="M 240,260 A 130,130 0 0,1 475,225" stroke="#ffffff" strokeWidth="16" fill="none" />
        </svg>
      );

    case 'en': // USA
      return (
        <svg viewBox="0 0 741 390" className={`rounded-[2px] shadow-sm shrink-0 overflow-hidden ${className}`}>
          <rect width="741" height="390" fill="#b22234" />
          <path d="M0,30H741M0,90H741M0,150H741M0,210H741M0,270H741M0,330H741" stroke="#ffffff" strokeWidth="30" />
          <rect width="296" height="210" fill="#3c3b6e" />
          <circle cx="50" cy="40" r="10" fill="#fff" />
          <circle cx="110" cy="40" r="10" fill="#fff" />
          <circle cx="170" cy="40" r="10" fill="#fff" />
          <circle cx="230" cy="40" r="10" fill="#fff" />
          <circle cx="80" cy="80" r="10" fill="#fff" />
          <circle cx="140" cy="80" r="10" fill="#fff" />
          <circle cx="200" cy="80" r="10" fill="#fff" />
          <circle cx="50" cy="120" r="10" fill="#fff" />
          <circle cx="110" cy="120" r="10" fill="#fff" />
          <circle cx="170" cy="120" r="10" fill="#fff" />
          <circle cx="230" cy="120" r="10" fill="#fff" />
          <circle cx="80" cy="160" r="10" fill="#fff" />
          <circle cx="140" cy="160" r="10" fill="#fff" />
          <circle cx="200" cy="160" r="10" fill="#fff" />
        </svg>
      );

    case 'es': // España
      return (
        <svg viewBox="0 0 750 500" className={`rounded-[2px] shadow-sm shrink-0 overflow-hidden ${className}`}>
          <rect width="750" height="500" fill="#c60b1e" />
          <rect y="125" width="750" height="250" fill="#ffc400" />
          <rect x="160" y="200" width="60" height="90" rx="10" fill="#c60b1e" />
          <circle cx="190" cy="185" r="16" fill="#ffc400" />
        </svg>
      );

    case 'zh': // China
      return (
        <svg viewBox="0 0 900 600" className={`rounded-[2px] shadow-sm shrink-0 overflow-hidden ${className}`}>
          <rect width="900" height="600" fill="#de2910" />
          <polygon points="150,50 180,140 270,140 200,195 225,280 150,230 75,280 100,195 30,140 120,140" fill="#ffde00" />
          <circle cx="300" cy="70" r="18" fill="#ffde00" />
          <circle cx="360" cy="130" r="18" fill="#ffde00" />
          <circle cx="360" cy="210" r="18" fill="#ffde00" />
          <circle cx="300" cy="270" r="18" fill="#ffde00" />
        </svg>
      );

    case 'hi': // Índia
      return (
        <svg viewBox="0 0 900 600" className={`rounded-[2px] shadow-sm shrink-0 overflow-hidden ${className}`}>
          <rect width="900" height="200" fill="#ff9933" />
          <rect y="200" width="900" height="200" fill="#ffffff" />
          <rect y="400" width="900" height="200" fill="#138808" />
          <circle cx="450" cy="300" r="70" stroke="#000080" strokeWidth="14" fill="none" />
          <circle cx="450" cy="300" r="16" fill="#000080" />
        </svg>
      );

    default:
      return null;
  }
};
