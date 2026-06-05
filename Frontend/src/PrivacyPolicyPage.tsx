import { useNavigate } from 'react-router-dom';
import { BRANDING } from './config/branding';

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile Back Button */}
      <button
        onClick={() => navigate('/app')}
        className="fixed top-5 left-4 z-50 bg-[#EF8E81] text-white rounded-lg px-4 py-2 flex items-center gap-2 shadow-lg hover:bg-[#E67A6E] transition-colors md:hidden"
        style={{ minHeight: '44px', minWidth: '44px' }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 10H5M5 10L10 15M5 10L10 5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="font-semibold">Back</span>
      </button>

      <div style={{ 
        maxWidth: '900px', 
        margin: '0 auto', 
        padding: '2rem',
        color: '#FFF1E7',
        background: '#1B1628',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        marginBottom: '2rem'
      }}>
      <h1 style={{ 
        fontSize: '2.5rem', 
        fontWeight: 700, 
        marginBottom: '1rem',
        color: '#EF8E81',
        textAlign: 'center'
      }}>
        {BRANDING.name} Privacy Policy
      </h1>
      
      <p style={{ 
        textAlign: 'center', 
        fontSize: '0.9rem', 
        opacity: 0.7,
        marginBottom: '2rem'
      }}>
        Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </p>

      <div style={{ lineHeight: '1.8', fontSize: '0.95rem' }}>
        <p style={{ marginBottom: '2rem' }}>
          This Privacy Policy describes how {BRANDING.name} ("we," "us," or "our") collects, uses, and protects your personal information when you use our software-as-a-service platform (the "Service"). {BRANDING.name} is owned and operated by {BRANDING.legalName}. By using the Service, you agree to the collection and use of information in accordance with this policy.
        </p>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', color: '#D4AF37' }}>
            1. Information We Collect
          </h2>
          
          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Information You Provide
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            When you register for an account or use the Service, we collect information that you provide directly to us, including:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem', listStyleType: 'disc' }}>
            <li style={{ marginBottom: '0.5rem' }}>Name and contact information (email address, phone number)</li>
            <li style={{ marginBottom: '0.5rem' }}>Business information (business name, industry, business type)</li>
            <li style={{ marginBottom: '0.5rem' }}>Payment and billing information (processed securely through third-party payment processors)</li>
            <li style={{ marginBottom: '0.5rem' }}>Content you create, upload, or input into the Service (marketing materials, campaign data, etc.)</li>
            <li style={{ marginBottom: '0.5rem' }}>Communications with us (support requests, feedback, etc.)</li>
          </ul>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Automatically Collected Information
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            When you use the Service, we automatically collect certain information about your device and usage, including:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem', listStyleType: 'disc' }}>
            <li style={{ marginBottom: '0.5rem' }}>Device information (IP address, browser type, operating system)</li>
            <li style={{ marginBottom: '0.5rem' }}>Usage data (pages visited, features used, time spent, click patterns)</li>
            <li style={{ marginBottom: '0.5rem' }}>Log data (access times, error logs, performance data)</li>
            <li style={{ marginBottom: '0.5rem' }}>Cookies and similar tracking technologies (see Section 5 below)</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', color: '#D4AF37' }}>
            2. How We Use Your Information
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            We use the information we collect to:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem', listStyleType: 'disc' }}>
            <li style={{ marginBottom: '0.5rem' }}>Provide, operate, and maintain the Service</li>
            <li style={{ marginBottom: '0.5rem' }}>Process your registration, manage your account, and authenticate your identity</li>
            <li style={{ marginBottom: '0.5rem' }}>Process payments and manage subscriptions</li>
            <li style={{ marginBottom: '0.5rem' }}>Send you service-related communications (account updates, security alerts, support responses)</li>
            <li style={{ marginBottom: '0.5rem' }}>Improve, personalize, and optimize the Service based on usage patterns</li>
            <li style={{ marginBottom: '0.5rem' }}>Generate analytics and insights to enhance user experience</li>
            <li style={{ marginBottom: '0.5rem' }}>Detect, prevent, and address technical issues, fraud, or security threats</li>
            <li style={{ marginBottom: '0.5rem' }}>Comply with legal obligations and enforce our Terms of Service</li>
            <li style={{ marginBottom: '0.5rem' }}>Send you marketing communications (with your consent, where required by law)</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', color: '#D4AF37' }}>
            3. How We Share Your Information
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            We do not sell your personal information. We may share your information only in the following circumstances:
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Service Providers
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            We share information with trusted third-party service providers who help us operate the Service, including:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem', listStyleType: 'disc' }}>
            <li style={{ marginBottom: '0.5rem' }}>Payment processors (Stripe) for billing and transaction processing</li>
            <li style={{ marginBottom: '0.5rem' }}>Cloud hosting providers (Supabase, Render) for data storage and infrastructure</li>
            <li style={{ marginBottom: '0.5rem' }}>AI service providers (OpenAI, Anthropic, Google) for AI-powered features</li>
            <li style={{ marginBottom: '0.5rem' }}>Analytics providers to understand usage patterns</li>
            <li style={{ marginBottom: '0.5rem' }}>Email service providers for communications</li>
          </ul>
          <p style={{ marginBottom: '1rem' }}>
            These providers are contractually obligated to protect your information and use it only for the purposes we specify.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Legal Requirements
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            We may disclose your information if required by law, court order, or government regulation, or if we believe disclosure is necessary to protect our rights, your safety, or the safety of others, or to investigate fraud or security issues.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Business Transfers
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. We will notify you of any such change in ownership or control.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            With Your Consent
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            We may share your information with your explicit consent or at your direction.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', color: '#D4AF37' }}>
            4. Data Security
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            We implement reasonable technical and organizational security measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction. These measures include:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem', listStyleType: 'disc' }}>
            <li style={{ marginBottom: '0.5rem' }}>Encryption of data in transit (HTTPS/TLS) and at rest</li>
            <li style={{ marginBottom: '0.5rem' }}>Secure authentication and access controls</li>
            <li style={{ marginBottom: '0.5rem' }}>Regular security assessments and updates</li>
            <li style={{ marginBottom: '0.5rem' }}>Limited access to personal data on a need-to-know basis</li>
          </ul>
          <p style={{ marginBottom: '1rem' }}>
            However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security. You are responsible for maintaining the confidentiality of your account credentials.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', color: '#D4AF37' }}>
            5. Cookies and Tracking Technologies
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            We use cookies and similar tracking technologies to enhance your experience, analyze usage, and support the functionality of the Service. Cookies are small text files stored on your device. You can control cookies through your browser settings, but disabling cookies may limit some features of the Service.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', color: '#D4AF37' }}>
            6. Your Rights and Choices
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            Depending on your location, you may have certain rights regarding your personal information:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem', listStyleType: 'disc' }}>
            <li style={{ marginBottom: '0.5rem' }}><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Correction:</strong> Update or correct inaccurate information</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Deletion:</strong> Request deletion of your personal information (subject to legal retention requirements)</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Portability:</strong> Request a copy of your data in a portable format</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Account Management:</strong> Update your account information through your account settings</li>
          </ul>
          <p style={{ marginBottom: '1rem' }}>
            To exercise these rights, please contact us at <a href="mailto:info@hillaryedenmcmullen.com" style={{ color: '#EF8E81', textDecoration: 'underline' }}>info@hillaryedenmcmullen.com</a>. We will respond to your request within a reasonable timeframe and in accordance with applicable law.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', color: '#D4AF37' }}>
            7. Data Retention
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            We retain your personal information for as long as necessary to provide the Service, fulfill the purposes described in this policy, comply with legal obligations, resolve disputes, and enforce our agreements. When you cancel your account, we will delete or anonymize your personal information in accordance with our data retention policies, except where we are required to retain it for legal or regulatory purposes.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', color: '#D4AF37' }}>
            8. Children's Privacy
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            The Service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected information from a child without parental consent, we will take steps to delete that information.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', color: '#D4AF37' }}>
            9. International Data Transfers
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country. By using the Service, you consent to the transfer of your information to these countries. We take appropriate safeguards to ensure your information is protected in accordance with this Privacy Policy.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', color: '#D4AF37' }}>
            10. Changes to This Privacy Policy
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            We may update this Privacy Policy from time to time. If we make material changes, we will notify you by email or by posting a prominent notice on our website. The updated policy will be effective as of the date specified. Your continued use of the Service after the effective date constitutes acceptance of the updated policy.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', color: '#D4AF37' }}>
            11. Contact Us
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:
          </p>
          <p style={{ marginBottom: '1rem' }}>
            <strong>{BRANDING.name}</strong><br />
            {BRANDING.legalName}<br />
            Email: <a href="mailto:info@hillaryedenmcmullen.com" style={{ color: '#EF8E81', textDecoration: 'underline' }}>info@hillaryedenmcmullen.com</a>
          </p>
        </section>

        <div style={{ 
          marginTop: '3rem', 
          paddingTop: '2rem', 
          borderTop: '2px solid rgba(239, 142, 129, 0.3)',
          textAlign: 'center',
          fontSize: '0.9rem',
          opacity: 0.8
        }}>
          <p style={{ fontWeight: 600 }}>
            Thank you for trusting {BRANDING.name} with your information.
          </p>
        </div>
      </div>
      </div>
    </>
  );
}

