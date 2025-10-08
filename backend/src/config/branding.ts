/**
 * White-Label Branding Configuration
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
export function getBrandingConfig(): BrandingConfig {
  return {
    name: process.env['BRAND_NAME'] || 'MomentumDIY',
    email: process.env['BRAND_EMAIL'] || 'info@hillaryedenmcmullen.com',
    domain: process.env['BRAND_DOMAIN'] || 'momentumdiy.com',
    logoUrl: process.env['BRAND_LOGO_URL'] || 'https://momentumdiy.com/logo.png',
    primaryColor: process.env['BRAND_PRIMARY_COLOR'] || '#EF8E81',
    secondaryColor: process.env['BRAND_SECONDARY_COLOR'] || '#D4AF37',
    supportEmail: process.env['BRAND_SUPPORT_EMAIL'] || 'info@hillaryedenmcmullen.com',
    legalName: process.env['BRAND_LEGAL_NAME'] || 'MomentumDIY'
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

export function getAIAssistantConfig(): AIAssistantConfig {
  return {
    name: process.env['AI_ASSISTANT_NAME'] || 'Hillary',
    persona: process.env['AI_ASSISTANT_PERSONA'] || 'marketing-consultant',
    title: process.env['AI_ASSISTANT_TITLE'] || 'Marketing Consultant'
  };
}

// Export singleton instances
export const BRANDING = getBrandingConfig();
export const AI_ASSISTANT = getAIAssistantConfig();

