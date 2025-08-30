import React from 'react';

interface PillProps {
  children: React.ReactNode;
  variant: 'success' | 'accent' | 'warning' | 'info' | 'neutral';
  className?: string;
}

export default function Pill({ children, variant, className = '' }: PillProps) {
  const baseClasses = 'rounded-full px-3 py-1 text-sm font-medium inline-flex items-center';

  const variantClasses = {
    success: 'bg-green-500/20 text-green-300 border border-green-500/30',
    accent: 'bg-[#EF8E81]/20 text-[#EF8E81] border border-[#EF8E81]/30',
    warning: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
    info: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    neutral: 'bg-gray-500/20 text-gray-300 border border-gray-500/30',
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}
