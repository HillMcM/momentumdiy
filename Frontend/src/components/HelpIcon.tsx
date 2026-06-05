import { useState } from 'react';

interface HelpIconProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export default function HelpIcon({ content, position = 'top', className = '' }: HelpIconProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-flex items-center" style={{ display: 'inline-flex' }}>
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className={`inline-flex items-center justify-center rounded-full bg-[#EF8E81]/20 text-[#EF8E81] hover:bg-[#EF8E81]/30 transition-colors cursor-help ${className || 'w-5 h-5'}`}
        style={{ minWidth: '20px', minHeight: '20px' }}
        aria-label="Help"
      >
        <svg 
          className="w-3 h-3" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
      </button>
      
      {isVisible && (
        <div 
          className={`absolute z-50 px-3 py-2 text-sm text-[#FFF1E7] bg-[#1B1628] border border-[#EF8E81]/30 rounded-lg shadow-xl ${
            position === 'top' || position === 'bottom' ? 'max-w-md' : 'max-w-xs'
          } ${
            position === 'top' ? 'bottom-full left-1/2 transform -translate-x-1/2 mb-2' :
            position === 'bottom' ? 'top-full left-1/2 transform -translate-x-1/2 mt-2' :
            position === 'left' ? 'right-full top-1/2 transform -translate-y-1/2 mr-2' :
            'left-full top-1/2 transform -translate-y-1/2 ml-2'
          }`}
          role="tooltip"
          style={{
            minWidth: position === 'top' || position === 'bottom' ? '280px' : '200px',
            maxWidth: position === 'top' || position === 'bottom' ? '400px' : '250px'
          }}
        >
          <div className="whitespace-normal" style={{ lineHeight: '1.5' }}>{content}</div>
          {/* Arrow */}
          <div 
            className={`absolute w-0 h-0 ${
              position === 'top' ? 'top-full left-1/2 transform -translate-x-1/2 border-t-[#EF8E81]/30 border-t-8 border-l-8 border-l-transparent border-r-8 border-r-transparent' :
              position === 'bottom' ? 'bottom-full left-1/2 transform -translate-x-1/2 border-b-[#EF8E81]/30 border-b-8 border-l-8 border-l-transparent border-r-8 border-r-transparent' :
              position === 'left' ? 'left-full top-1/2 transform -translate-y-1/2 border-l-[#EF8E81]/30 border-l-8 border-t-8 border-t-transparent border-b-8 border-b-transparent' :
              'right-full top-1/2 transform -translate-y-1/2 border-r-[#EF8E81]/30 border-r-8 border-t-8 border-t-transparent border-b-8 border-b-transparent'
            }`}
          />
        </div>
      )}
    </div>
  );
}
