/**
 * White-Label Branding Configuration (Frontend)
 * 
 * This module provides centralized branding configuration for enterprise white-labeling.
 * All brand-specific values should be configured via environment variables.
 */

export interface BrandingConfig {
  name: string;
  email: string;
  domain: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  supportEmail: string;
  legalName: string;
}

/**
 * Get branding configuration from environment variables
 * Falls back to default MomentumDIY branding if not configured
 */
function getBrandingConfig(): BrandingConfig {
  const meta = import.meta as { env?: Record<string, string> };
  const env = meta.env || {};
  
  return {
    name: env.VITE_BRAND_NAME || 'MomentumDIY',
    email: env.VITE_BRAND_EMAIL || 'info@hillaryedenmcmullen.com',
    domain: env.VITE_BRAND_DOMAIN || 'momentumdiy.com',
    logoUrl: env.VITE_BRAND_LOGO_URL || 'https://momentumdiy.com/logo.png',
    primaryColor: env.VITE_BRAND_PRIMARY_COLOR || '#EF8E81',
    secondaryColor: env.VITE_BRAND_SECONDARY_COLOR || '#D4AF37',
    supportEmail: env.VITE_BRAND_SUPPORT_EMAIL || 'info@hillaryedenmcmullen.com',
    legalName: env.VITE_BRAND_LEGAL_NAME || 'MomentumDIY'
  };
}

/**
 * AI Assistant Configuration
 * Configurable assistant name and persona for white-labeling
 */
export interface AIAssistantConfig {
  name: string;
  persona: string;
  title: string;
}

function getAIAssistantConfig(): AIAssistantConfig {
  const meta = import.meta as { env?: Record<string, string> };
  const env = meta.env || {};
  
  return {
    name: env.VITE_AI_ASSISTANT_NAME || 'Hillary',
    persona: env.VITE_AI_ASSISTANT_PERSONA || 'marketing-consultant',
    title: env.VITE_AI_ASSISTANT_TITLE || 'Marketing Consultant'
  };
}

// Export singleton instances
export const BRANDING = getBrandingConfig();
export const AI_ASSISTANT = getAIAssistantConfig();

