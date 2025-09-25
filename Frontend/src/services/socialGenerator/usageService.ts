// Usage tracking service for social media generator
export interface UsageData {
  sessionsUsed: number;
  imagesGenerated: number;
  lastResetDate: string; // YYYY-MM format
  monthlyLimit: number;
}

const STORAGE_KEY = 'socialGeneratorUsage';

// Monthly limits based on subscription tier
export const USAGE_LIMITS = {
  free: { sessionsPerMonth: 10, imagesPerSession: 2 },
  basic: { sessionsPerMonth: 100, imagesPerSession: 2 },
  pro: { sessionsPerMonth: 500, imagesPerSession: 4 },
  enterprise: { sessionsPerMonth: -1, imagesPerSession: 8 } // -1 = unlimited
};

export const getCurrentUsage = (): UsageData => {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const stored = localStorage.getItem(STORAGE_KEY);
  
  if (!stored) {
    return {
      sessionsUsed: 0,
      imagesGenerated: 0,
      lastResetDate: currentMonth,
      monthlyLimit: USAGE_LIMITS.basic.sessionsPerMonth
    };
  }
  
  const usage: UsageData = JSON.parse(stored);
  
  // Reset if new month
  if (usage.lastResetDate !== currentMonth) {
    const resetUsage: UsageData = {
      sessionsUsed: 0,
      imagesGenerated: 0,
      lastResetDate: currentMonth,
      monthlyLimit: USAGE_LIMITS.basic.sessionsPerMonth
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resetUsage));
    return resetUsage;
  }
  
  return usage;
};

export const canGenerateImages = (userTier: keyof typeof USAGE_LIMITS = 'basic'): { 
  allowed: boolean; 
  reason?: string; 
  remainingSessions?: number;
  remainingImages?: number;
} => {
  const usage = getCurrentUsage();
  const limits = USAGE_LIMITS[userTier];
  
  // Check if unlimited
  if (limits.sessionsPerMonth === -1) {
    return { allowed: true, remainingSessions: -1, remainingImages: limits.imagesPerSession };
  }
  
  // Check monthly session limit
  if (usage.sessionsUsed >= limits.sessionsPerMonth) {
    return { 
      allowed: false, 
      reason: `Monthly limit reached (${limits.sessionsPerMonth} sessions). Upgrade to Pro for more.`,
      remainingSessions: 0
    };
  }
  
  const remainingSessions = limits.sessionsPerMonth - usage.sessionsUsed;
  return { 
    allowed: true, 
    remainingSessions,
    remainingImages: limits.imagesPerSession
  };
};

export const recordSession = (imagesGenerated: number, userTier: keyof typeof USAGE_LIMITS = 'basic'): void => {
  const usage = getCurrentUsage();
  const limits = USAGE_LIMITS[userTier];
  
  // Update usage
  usage.sessionsUsed += 1;
  usage.imagesGenerated += imagesGenerated;
  
  // Save to localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
};

export const getUsageStats = (userTier: keyof typeof USAGE_LIMITS = 'basic') => {
  const usage = getCurrentUsage();
  const limits = USAGE_LIMITS[userTier];
  
  return {
    sessionsUsed: usage.sessionsUsed,
    sessionsRemaining: limits.sessionsPerMonth === -1 ? -1 : limits.sessionsPerMonth - usage.sessionsUsed,
    imagesGenerated: usage.imagesGenerated,
    imagesPerSession: limits.imagesPerSession,
    monthlyLimit: limits.sessionsPerMonth,
    isUnlimited: limits.sessionsPerMonth === -1
  };
};

export const getUpgradeMessage = (currentTier: keyof typeof USAGE_LIMITS): string => {
  const tiers = Object.keys(USAGE_LIMITS) as Array<keyof typeof USAGE_LIMITS>;
  const currentIndex = tiers.indexOf(currentTier);
  const nextTier = tiers[currentIndex + 1];
  
  if (!nextTier) {
    return "You've reached the maximum tier. Contact support for enterprise options.";
  }
  
  const nextLimits = USAGE_LIMITS[nextTier];
  const nextLimitText = nextLimits.sessionsPerMonth === -1 ? 'unlimited' : `${nextLimits.sessionsPerMonth} sessions`;
  
  return `Upgrade to ${nextTier.charAt(0).toUpperCase() + nextTier.slice(1)} for ${nextLimitText} per month`;
};
