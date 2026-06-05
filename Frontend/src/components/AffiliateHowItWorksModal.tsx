
interface AffiliateHowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AffiliateHowItWorksModal({ isOpen, onClose }: AffiliateHowItWorksModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: '#2A243E',
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          border: '1px solid #3A344E',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0, fontSize: '2rem', color: '#FFF', marginBottom: '0.5rem' }}>
            How It Works
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#FFF',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ color: '#FFF' }}>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{
                flexShrink: 0,
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #EF8E81 0%, #D4AF37 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}>
                1
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#FFF', marginBottom: '0.5rem' }}>
                  Join the Program
                </h4>
                <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.6' }}>
                  Sign up and get your unique referral code. Must be active for 30+ days.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{
                flexShrink: 0,
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #EF8E81 0%, #D4AF37 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}>
                2
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#FFF', marginBottom: '0.5rem' }}>
                  Share Your Link
                </h4>
                <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.6' }}>
                  Share your referral link with friends, colleagues, or your audience. We track clicks for 90 days.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{
                flexShrink: 0,
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #EF8E81 0%, #D4AF37 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}>
                3
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#FFF', marginBottom: '0.5rem' }}>
                  Earn Commission
                </h4>
                <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.6' }}>
                  When someone signs up and makes their first payment, you earn 20% of their subscription for 12 months.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{
                flexShrink: 0,
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #EF8E81 0%, #D4AF37 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}>
                4
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#FFF', marginBottom: '0.5rem' }}>
                  Get Paid
                </h4>
                <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.6' }}>
                  Once you reach $10, request a payout and receive funds directly to your bank account monthly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

