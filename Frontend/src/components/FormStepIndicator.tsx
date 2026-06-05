import React from 'react';
import { useIsMobile } from '../hooks/useMediaQuery';

interface FormStepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps?: string[]; // Optional step labels
  onStepClick?: (step: number) => void; // Optional click handler to jump to step
}

export default function FormStepIndicator({
  currentStep,
  totalSteps,
  steps,
  onStepClick
}: FormStepIndicatorProps) {
  const isMobile = useIsMobile();

  if (!isMobile && totalSteps <= 1) {
    return null; // Don't show indicator on desktop if only one step
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: isMobile ? '1rem' : '1rem 2rem',
        background: 'rgba(255, 255, 255, 0.03)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        marginBottom: '1rem',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}
    >
      {/* Progress bar */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <React.Fragment key={stepNumber}>
              <div
                onClick={() => onStepClick && !isUpcoming && onStepClick(stepNumber)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                  flex: 1,
                  cursor: onStepClick && !isUpcoming ? 'pointer' : 'default',
                  opacity: isUpcoming ? 0.4 : 1,
                  minWidth: isMobile ? '44px' : '60px',
                  minHeight: isMobile ? '44px' : 'auto',
                  padding: '0.25rem',
                  borderRadius: '8px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (onStepClick && !isUpcoming) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (onStepClick && !isUpcoming) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {/* Step circle */}
                <div
                  style={{
                    width: isMobile ? '32px' : '36px',
                    height: isMobile ? '32px' : '36px',
                    borderRadius: '50%',
                    background: isCompleted
                      ? '#10b981'
                      : isCurrent
                      ? '#EF8E81'
                      : 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isCompleted || isCurrent ? '#FFF1E7' : 'rgba(255, 255, 255, 0.6)',
                    fontWeight: '600',
                    fontSize: isMobile ? '0.85rem' : '0.9rem',
                    border: isCurrent ? '2px solid #EF8E81' : '2px solid transparent',
                    boxShadow: isCurrent ? '0 0 0 4px rgba(239, 142, 129, 0.2)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {isCompleted ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>
                {/* Step label */}
                {steps && steps[index] && (
                  <span
                    style={{
                      fontSize: isMobile ? '0.65rem' : '0.75rem',
                      color: isCurrent ? '#EF8E81' : isCompleted ? '#10b981' : 'rgba(255, 255, 255, 0.5)',
                      textAlign: 'center',
                      fontWeight: isCurrent ? '600' : '400',
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {steps[index]}
                  </span>
                )}
              </div>
              {/* Connector line */}
              {stepNumber < totalSteps && (
                <div
                  style={{
                    flex: 1,
                    height: '2px',
                    background: stepNumber < currentStep ? '#10b981' : 'rgba(255, 255, 255, 0.2)',
                    margin: '0 0.5rem',
                    transition: 'background 0.2s'
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      {/* Step counter */}
      <div
        style={{
          marginLeft: '1rem',
          padding: '0.5rem 1rem',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          fontSize: isMobile ? '0.75rem' : '0.85rem',
          color: '#FFF1E7',
          fontWeight: '600',
          whiteSpace: 'nowrap'
        }}
      >
        {currentStep} / {totalSteps}
      </div>
    </div>
  );
}

