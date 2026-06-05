import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/useAuth';
import { API_URL } from '../config/environment';
import { supabase } from '../lib/supabase';

export function useAffiliateStatus() {
  const { user } = useAuth();
  const [isAffiliate, setIsAffiliate] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAffiliate(false);
      setLoading(false);
      return;
    }

    const checkAffiliateStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          setIsAffiliate(false);
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/api/affiliate/dashboard`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        const result = await response.json();
        setIsAffiliate(result.success === true);
      } catch (err) {
        // If there's an error, user is not an affiliate
        setIsAffiliate(false);
      } finally {
        setLoading(false);
      }
    };

    checkAffiliateStatus();
  }, [user]);

  return { isAffiliate, loading };
}

