import React, { useMemo } from 'react';
import { useIsMobile } from '../hooks/useMediaQuery';

interface ProfileField {
  key: string;
  required: boolean;
  filled: boolean;
  label: string;
}

interface ProfileCompletionIndicatorProps {
  profile: {
    business_name?: string | null;
    business_category?: string | null;
    location?: string | null;
    contact_email?: string | null;
    primary_marketing_goal?: string | null;
    marketing_channels?: string[] | null;
    brand_primary_color?: string | null;
    brand_logo?: string | null;
  };
}

export default function ProfileCompletionIndicator({ profile }: ProfileCompletionIndicatorProps) {
  const isMobile = useIsMobile();
  
  const fields: ProfileField[] = useMemo(() => [
    { key: 'business_name', required: true, filled: Boolean(profile.business_name), label: 'Business Name' },
    { key: 'business_category', required: true, filled: Boolean(profile.business_category), label: 'Business Category' },
    { key: 'location', required: true, filled: Boolean(profile.location), label: 'Location' },
    { key: 'contact_email', required: false, filled: Boolean(profile.contact_email), label: 'Contact Email' },
    { key: 'primary_marketing_goal', required: true, filled: Boolean(profile.primary_marketing_goal), label: 'Marketing Goal' },
    { key: 'marketing_channels', required: false, filled: Boolean(profile.marketing_channels && profile.marketing_channels.length > 0), label: 'Marketing Channels' },
    { key: 'brand_primary_color', required: false, filled: Boolean(profile.brand_primary_color), label: 'Brand Colors' },
    { key: 'brand_logo', required: false, filled: Boolean(profile.brand_logo), label: 'Brand Logo' },
  ], [profile]);

  const completion = useMemo(() => {
    const required = fields.filter(f => f.required);
    const filledRequired = required.filter(f => f.filled).length;
    const requiredCompletion = required.length > 0 ? (filledRequired / required.length) * 100 : 0;
    
    const optional = fields.filter(f => !f.required);
    const filledOptional = optional.filter(f => f.filled).length;
    const optionalCompletion = optional.length > 0 ? (filledOptional / optional.length) * 100 : 0;
    
    const totalFilled = fields.filter(f => f.filled).length;
    const totalCompletion = (totalFilled / fields.length) * 100;
    
    return {
      required: requiredCompletion,
      optional: optionalCompletion,
      total: totalCompletion,
      requiredFields: required.length - filledRequired,
      missingRequired: required.filter(f => !f.filled).map(f => f.label)
    };
  }, [fields]);

  if (completion.required === 100 && completion.total === 100) {
    return null; // Don't show if everything is complete
  }

  return (
    <div style={{
      background: completion.required < 100 
        ? 'rgba(239, 68, 68, 0.1)' 
        : 'rgba(245, 158, 11, 0.1)',
      border: `1px solid ${completion.required < 100 
        ? 'rgba(239, 68, 68, 0.3)' 
        : 'rgba(245, 158, 11, 0.3)'}`,
      borderRadius: '12px',
      padding: isMobile ? '1rem' : '1.5rem',
      marginBottom: '1.5rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: isMobile ? '40px' : '48px',
            height: isMobile ? '40px' : '48px',
            borderRadius: '50%',
            background: completion.required < 100 
              ? 'rgba(239, 68, 68, 0.2)' 
              : 'rgba(245, 158, 11, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isMobile ? '1.2rem' : '1.5rem'
          }}>
            {completion.required < 100 ? '⚠️' : '📋'}
          </div>
          <div>
            <h3 style={{ 
              margin: 0, 
              fontSize: isMobile ? '1rem' : '1.1rem', 
              fontWeight: 600,
              color: completion.required < 100 ? '#EF4444' : '#F59E0B'
            }}>
              Profile {completion.required < 100 ? 'Incomplete' : 'Almost Complete'}
            </h3>
            <p style={{ 
              margin: '0.25rem 0 0 0', 
              fontSize: '0.85rem', 
              opacity: 0.8,
              color: '#FFF1E7'
            }}>
              {completion.required < 100 
                ? `${completion.requiredFields} required field${completion.requiredFields !== 1 ? 's' : ''} missing`
                : `${Math.round(completion.total)}% complete - add optional details to enhance your profile`}
            </p>
          </div>
        </div>
        <div style={{
          fontSize: isMobile ? '1.5rem' : '2rem',
          fontWeight: 700,
          color: completion.required < 100 ? '#EF4444' : '#F59E0B'
        }}>
          {Math.round(completion.required)}%
        </div>
      </div>
      
      {/* Progress Bar */}
      <div style={{
        width: '100%',
        height: '8px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '4px',
        overflow: 'hidden',
        marginBottom: '1rem'
      }}>
        <div style={{
          width: `${completion.required}%`,
          height: '100%',
          background: completion.required < 100 
            ? 'linear-gradient(90deg, #EF4444 0%, #F87171 100%)'
            : 'linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)',
          transition: 'width 0.3s ease',
          position: 'relative'
        }}>
          <div style={{
            width: `${completion.total}%`,
            height: '100%',
            background: 'rgba(255, 255, 255, 0.2)',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>
      
      {/* Missing Required Fields */}
      {completion.missingRequired.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <p style={{ 
            fontSize: '0.85rem', 
            fontWeight: 600, 
            marginBottom: '0.5rem',
            color: '#EF4444'
          }}>
            Required fields to complete:
          </p>
          <ul style={{ 
            margin: 0, 
            paddingLeft: '1.25rem',
            fontSize: '0.85rem',
            opacity: 0.9,
            listStyle: 'none'
          }}>
            {completion.missingRequired.map((label, idx) => (
              <li key={idx} style={{ 
                marginBottom: '0.25rem',
                position: 'relative',
                paddingLeft: '1.25rem'
              }}>
                <span style={{ 
                  position: 'absolute', 
                  left: 0,
                  color: '#EF4444'
                }}>•</span>
                {label}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Optional Fields Suggestion */}
      {completion.required === 100 && completion.total < 100 && (
        <div style={{ 
          marginTop: '1rem',
          padding: '0.75rem',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          fontSize: '0.85rem',
          opacity: 0.9
        }}>
          <strong>💡 Tip:</strong> Add optional details like brand colors, logo, and marketing channels to personalize your experience.
        </div>
      )}
    </div>
  );
}

