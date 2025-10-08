import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';

interface CompletionConfettiProps {
  isComplete: boolean;
  duration?: number; // milliseconds
}

export default function CompletionConfetti({ 
  isComplete, 
  duration = 5000 
}: CompletionConfettiProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    // Update window size on resize
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isComplete) {
      setShowConfetti(true);
      
      // Auto-hide after duration
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isComplete, duration]);

  if (!showConfetti) return null;

  return (
    <Confetti
      width={windowSize.width}
      height={windowSize.height}
      recycle={false}
      numberOfPieces={300}
      gravity={0.3}
      colors={['#EF8E81', '#D4AF37', '#10B981', '#8B5CF6', '#FFF1E7']}
    />
  );
}

