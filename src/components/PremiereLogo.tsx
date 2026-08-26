import React from 'react';

export const PremiereLogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => {
  return (
    <svg 
      className={`shrink-0 select-none rounded-[5px] shadow-sm ${className}`}
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Official Adobe Premiere Pro Brand Background */}
      <rect width="48" height="48" rx="10" fill="#00005B" />
      
      {/* Official 'Pr' Monogram */}
      <text 
        x="50%" 
        y="54%" 
        dominantBaseline="middle" 
        textAnchor="middle" 
        fill="#9999FF" 
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" 
        fontWeight="900" 
        fontSize="25"
        letterSpacing="-1.5px"
      >
        Pr
      </text>
    </svg>
  );
};
