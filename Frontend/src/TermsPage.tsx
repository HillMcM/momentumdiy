export default function TermsPage() {
  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '2rem',
      color: '#FFF1E7',
      background: '#1B1628',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <h1 style={{ 
        fontSize: '2rem', 
        fontWeight: 700, 
        marginBottom: '1.5rem',
        color: '#EF8E81'
      }}>
        Terms & Conditions
      </h1>
      
      <div style={{ lineHeight: '1.8', fontSize: '0.95rem' }}>
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '0.75rem', color: '#D4AF37' }}>
            1. Acceptance of Terms
          </h2>
          <p>
            [Your terms and conditions content will go here. Please provide the legal text you'd like to include.]
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '0.75rem', color: '#D4AF37' }}>
            2. Use of Service
          </h2>
          <p>
            [Content about service usage, user responsibilities, and acceptable use policies.]
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '0.75rem', color: '#D4AF37' }}>
            3. Subscription and Billing
          </h2>
          <p>
            [Content about subscription terms, billing cycles, cancellation policies, and refunds.]
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '0.75rem', color: '#D4AF37' }}>
            4. Privacy and Data
          </h2>
          <p>
            [Content about data collection, privacy policies, and how user data is handled.]
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '0.75rem', color: '#D4AF37' }}>
            5. Intellectual Property
          </h2>
          <p>
            [Content about ownership of content, trademarks, and user-generated content.]
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '0.75rem', color: '#D4AF37' }}>
            6. Limitation of Liability
          </h2>
          <p>
            [Content about service warranties, disclaimers, and liability limitations.]
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '0.75rem', color: '#D4AF37' }}>
            7. Contact Information
          </h2>
          <p>
            For questions about these terms, please contact us at: <a href="mailto:info@hillaryedenmcmullen.com" style={{ color: '#EF8E81' }}>info@hillaryedenmcmullen.com</a>
          </p>
        </section>

        <div style={{ 
          marginTop: '2rem', 
          paddingTop: '1.5rem', 
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '0.85rem',
          opacity: 0.7
        }}>
          <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </div>
    </div>
  );
}

