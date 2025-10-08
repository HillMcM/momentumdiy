import { useEffect, useState } from 'react';
import { API_URL } from '../config/environment';

export default function ReferralTracker() {
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    // Check URL for ref parameter
    const urlParams = new URLSearchParams(window.location.search);
    const refParam = urlParams.get('ref');

    if (refParam) {
      // Track the click
      trackReferral(refParam);
      setReferralCode(refParam);
      
      // Store in localStorage for later use
      localStorage.setItem('referral_code', refParam);
    } else {
      // Check if we have a stored referral code
      const stored = localStorage.getItem('referral_code');
      if (stored) {
        setReferralCode(stored);
      }
    }
  }, []);

  const trackReferral = async (code: string) => {
    try {
      await fetch(`${API_URL}/api/affiliate/track/${code}`, {
        method: 'GET',
        credentials: 'include', // Important for cookie setting
      });
    } catch (err) {
      console.error('Error tracking referral:', err);
    }
  };

  if (!referralCode) return null;

  return (
    <div className="bg-gradient-to-r from-[#EF8E81]/10 to-[#D4AF37]/10 border border-[#EF8E81]/30 rounded-lg p-3 mb-4">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🎉</span>
        <div className="text-sm">
          <div className="text-white font-semibold">Referred by a friend!</div>
          <div className="text-gray-400">You're using a referral link. Start your journey today!</div>
        </div>
      </div>
    </div>
  );
}
