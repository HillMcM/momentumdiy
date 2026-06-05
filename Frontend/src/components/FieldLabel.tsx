import React from 'react';

interface FieldLabelProps {
  label: string;
  required?: boolean;
  optional?: boolean;
  description?: string;
}

export default function FieldLabel({ 
  label, 
  required = false, 
  optional = false,
  description 
}: FieldLabelProps) {
  return (
    <div style={{ marginBottom: '0.25rem' }}>
      <div style={{ 
        fontSize: '0.85rem', 
        opacity: 0.9, 
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flexWrap: 'wrap'
      }}>
        <span>{label}</span>
        {required && (
          <span style={{
            fontSize: '0.7rem',
            padding: '0.15rem 0.4rem',
            background: 'rgba(239, 68, 68, 0.2)',
            color: '#EF4444',
            borderRadius: '4px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Required
          </span>
        )}
        {optional && (
          <span style={{
            fontSize: '0.7rem',
            padding: '0.15rem 0.4rem',
            background: 'rgba(156, 163, 175, 0.2)',
            color: '#9CA3AF',
            borderRadius: '4px',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Optional
          </span>
        )}
      </div>
      {description && (
        <p style={{
          fontSize: '0.75rem',
          opacity: 0.7,
          margin: '0.25rem 0 0 0',
          color: '#FFF1E7'
        }}>
          {description}
        </p>
      )}
    </div>
  );
}

