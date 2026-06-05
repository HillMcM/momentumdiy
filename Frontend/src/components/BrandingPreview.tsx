import React from 'react';
import { useIsMobile } from '../hooks/useMediaQuery';

interface BrandingPreviewProps {
  primaryColor?: string | null;
  secondaryColor?: string | null;
  accentColor?: string | null;
  fontHeading?: string | null;
  fontBody?: string | null;
  logo?: string | null;
}

export default function BrandingPreview({
  primaryColor = '#EF8E81',
  secondaryColor = '#D4AF37',
  accentColor = '#8B5CF6',
  fontHeading = 'Inter',
  fontBody = 'Inter',
  logo
}: BrandingPreviewProps) {
  const isMobile = useIsMobile();
  
  const previewStyle: React.CSSProperties = {
    fontFamily: fontBody || 'Inter, sans-serif',
    color: '#22202F',
    padding: isMobile ? '1rem' : '1.5rem',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    marginTop: '1rem'
  };

  const headingStyle: React.CSSProperties = {
    fontFamily: fontHeading || 'Inter, sans-serif',
    color: primaryColor || '#EF8E81',
    margin: '0 0 0.5rem 0',
    fontSize: isMobile ? '1.5rem' : '2rem',
    fontWeight: 700
  };

  const buttonStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, ${primaryColor || '#EF8E81'} 0%, ${secondaryColor || '#D4AF37'} 100%)`,
    color: '#FFF',
    border: 'none',
    borderRadius: '8px',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '1rem',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: `0 4px 12px ${primaryColor ? `${primaryColor}40` : 'rgba(239, 142, 129, 0.4)'}`
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: isMobile ? '1rem' : '1.5rem',
      marginTop: '1rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <h4 style={{ margin: 0, fontSize: isMobile ? '0.95rem' : '1.1rem', fontWeight: 600, color: '#FFF1E7' }}>
          🎨 Brand Preview
        </h4>
        <span style={{ fontSize: '0.75rem', opacity: 0.6, color: '#FFF1E7' }}>
          How your branding will look
        </span>
      </div>
      
      <div style={previewStyle}>
        {logo && (
          <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <img 
              src={logo} 
              alt="Brand logo preview" 
              style={{ 
                maxHeight: '60px', 
                maxWidth: '100%',
                objectFit: 'contain'
              }}
            />
          </div>
        )}
        
        <h2 style={headingStyle}>
          Your Brand Name
        </h2>
        
        <p style={{
          color: '#4B5563',
          fontSize: isMobile ? '0.9rem' : '1rem',
          lineHeight: 1.6,
          margin: '0.5rem 0 1rem 0'
        }}>
          This is how your brand will appear in generated content. The primary color is used for headings and CTAs, while the secondary color adds accents and highlights.
        </p>
        
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <div style={{
            background: primaryColor || '#EF8E81',
            color: '#FFF',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: 600,
            minWidth: '80px',
            textAlign: 'center'
          }}>
            Primary
          </div>
          <div style={{
            background: secondaryColor || '#D4AF37',
            color: '#22202F',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: 600,
            minWidth: '80px',
            textAlign: 'center'
          }}>
            Secondary
          </div>
          <div style={{
            background: accentColor || '#8B5CF6',
            color: '#FFF',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: 600,
            minWidth: '80px',
            textAlign: 'center'
          }}>
            Accent
          </div>
        </div>
        
        <button 
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = `0 6px 16px ${primaryColor ? `${primaryColor}50` : 'rgba(239, 142, 129, 0.5)'}`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `0 4px 12px ${primaryColor ? `${primaryColor}40` : 'rgba(239, 142, 129, 0.4)'}`;
          }}
        >
          Call to Action
        </button>
        
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          background: 'rgba(0, 0, 0, 0.05)',
          borderRadius: '6px',
          fontSize: '0.85rem',
          color: '#6B7280',
          borderLeft: `3px solid ${primaryColor || '#EF8E81'}`
        }}>
          <strong>Note:</strong> This preview shows how your branding will be applied to generated social media posts, emails, and other content.
        </div>
      </div>
    </div>
  );
}

