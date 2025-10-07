export default function TermsPage() {
  return (
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
        MomentumDIY Terms & Conditions
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
          These Terms & Conditions ("Terms") govern your access to and use of the MomentumDIY software-as-a-service platform (the "Service"). MomentumDIY is owned and operated by Hillary Eden McMullen, a sole proprietor doing business as MomentumDIY ("MomentumDIY," "we," "us," or "our"). By creating an account or using the Service, you agree to these Terms and any policies referenced herein. If you do not agree, do not use the Service.
        </p>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', color: '#D4AF37' }}>
            1. Account Registration and Eligibility
          </h2>
          
          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Eligibility
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            You must be at least 18 years old (or the age of majority in your jurisdiction) to use MomentumDIY. By using the Service, you represent that you meet this age requirement and are legally able to enter into this agreement. If you are using the Service on behalf of an organization, you represent that you have authority to bind that entity to these Terms.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Account Information
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            When registering, you agree to provide accurate, current, and complete information, including your name, email address, billing information, and basic business details. You must keep your account information updated. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Account Security
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            You must notify us immediately at our support contact (see Section 14) if you suspect any unauthorized use of your account or security breach. We are not liable for any loss or damage arising from your failure to safeguard your account.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', color: '#D4AF37' }}>
            2. Subscription Plans and Payment
          </h2>
          
          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Subscription Fees
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            MomentumDIY is offered on a subscription basis. The current plans are $14.99 per month (monthly billing) or $143.88 per year (annual billing). Annual plans provide a discounted rate equivalent to 12 months of service. All fees are stated in U.S. dollars. We may modify our pricing or introduce new charges; any fee changes will be communicated in advance and will not apply retroactively to your current billing period.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Billing and Auto-Renewal
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            By subscribing, you authorize us (or our third-party payment processor) to charge your provided payment method for the applicable subscription fee in advance on a recurring basis (monthly or annually, depending on your plan). Subscriptions auto-renew at the end of each billing cycle unless you cancel before the next renewal date.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            No Refunds
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            All sales are final. Payments are non-refundable once charged, except where required by law. This means that we do not offer refunds or credits for partial use or the unused portion of your subscription period. If you cancel in the middle of a paid period, you will retain access to the Service until the end of that period, but you will not receive a pro-rated refund for the remaining time.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Taxes
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            Subscription fees do not include any taxes (such as sales, VAT, or other taxes). You are responsible for any applicable taxes or government charges, except for taxes based on our income. We will charge tax if we are required to do so by law, and such taxes will be added to your billing amount.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Payment Failures
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            If we are unable to process your payment (e.g., due to expiration or insufficient funds), we will notify you, and we may suspend or downgrade your account until payment is resolved. If charges remain unpaid, we reserve the right to terminate your access to the Service for non-payment after reasonable notice.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', color: '#D4AF37' }}>
            3. Cancellation and Termination
          </h2>
          
          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Your Right to Cancel
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            You may cancel your MomentumDIY subscription at any time. Cancellations can be made through your account settings or by contacting us. If you cancel, your subscription will remain active until the end of the current billing cycle and will not renew thereafter. You will not be billed for any subsequent period after cancellation (monthly or annually, as applicable).
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Termination by MomentumDIY
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            We reserve the right to suspend or terminate your account (or access to certain features) at any time with or without notice if you violate these Terms, misuse the Service, or engage in fraudulent or unlawful activity. We may also terminate the Service or your account for convenience (for any reason or no reason) by providing notice to you. In the event we discontinue the Service or terminate your account without cause, we may provide a pro-rata refund for any unused period of a pre-paid subscription, if required by law or at our discretion.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Effect of Termination
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            Upon termination or cancellation of your account, your right to access or use the Service will immediately cease. You remain responsible for any fees or charges incurred up to the date of termination. We have no obligation to retain your content or data after termination, except as required by law, and we may delete your data in our discretion (subject to applicable data retention policies). Sections of these Terms that by their nature should survive termination (such as intellectual property, disclaimers, limitations of liability, indemnity, and dispute provisions) will continue to apply.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', color: '#D4AF37' }}>
            4. Personal Data and Privacy
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            Your privacy is important to us. By using the Service, you agree to the collection and use of your information as outlined here (and in our Privacy Policy, if available):
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Data We Collect
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            When you sign up or use MomentumDIY, we collect personal information such as your name, email address, contact information, payment details, and business information needed to provide the Service. We also collect usage data like how you interact with the app (e.g., logins, feature usage) to help improve the Service. We do not collect sensitive personal data like social security numbers or health information, as the Service is not intended to handle such data.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            How We Use Your Data
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            We use the collected information to operate and provide the Service, including to create and manage your account, process payments, send you service updates, and support your marketing campaigns. We may also use it to communicate with you (e.g. sending product announcements or customer support responses) and to improve our platform's features and performance.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Protection of Data
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            We implement reasonable security measures to protect your personal data. However, you understand that no method of transmission or storage is completely secure, and we cannot guarantee absolute security of data. By using the Service, you consent to the transfer and storage of your information on our servers and with authorized third-party service providers (for example, payment processors) as needed to provide the Service.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Third-Party Processors
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            We use reputable third-party services to help run MomentumDIY – for example, payment processing providers for billing, and cloud hosting for data storage. These providers may have access to your personal data for the sole purpose of performing services on our behalf. We are not responsible for the practices of third-party services that are not under our control, and your use of third-party integrations is governed by their respective privacy policies.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            No Sharing or Selling
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            We do not sell your personal information to third parties for marketing. We will not share your personal data with third parties except (a) as needed to provide the Service (as described above), (b) with your consent, or (c) as required by law or lawful order (such as responding to a subpoena).
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Privacy Policy
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            Additional details about our data practices may be provided in a separate Privacy Policy. By agreeing to these Terms, you also agree to our Privacy Policy (if one is provided on our site). In the event of a conflict between these Terms and the Privacy Policy regarding personal data handling, the Privacy Policy will govern.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', color: '#D4AF37' }}>
            5. Acceptable Use Policy
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            When using MomentumDIY, you agree to use the Service responsibly and legally. You must not misuse the platform or any content generated through it. In particular, you agree NOT to:
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Illegal or Harmful Use
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            Use the Service for any unlawful purpose, or to publish, transmit, or store any content that is unlawful, defamatory, harassing, obscene, or violates any rights of others. This includes refraining from using the Service to engage in fraud, phishing, spamming, or any other harmful or deceitful activity.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Intellectual Property Infringement
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            Use the Service to upload, generate, or distribute content that infringes or misappropriates the intellectual property rights or privacy rights of any third party. You are responsible for ensuring you have the necessary rights or permissions for all materials (text, images, data) that you input into the platform or use in your marketing campaigns.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Malicious Activity
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            Introduce any viruses, malware, or harmful code into the Service, or attempt to hack, disable, or disrupt the Service or servers (e.g., by launching a denial-of-service attack or exploiting vulnerabilities). You must not attempt to reverse engineer or interfere with any part of the Service, including any AI models or software underlying the platform.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Unauthorized Access
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            Share your account credentials with others or use another user's account without authorization. You will not scrape, crawl, or use any automated means to extract data from the Service without our prior written permission.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Circumvention and Misuse
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            Avoid or bypass any security or usage controls of the Service, or use the Service in a way that abuses our offerings (for example, using automated bots to rapidly generate content in a way that strains the Service). You also agree not to use the Service to create content for high-risk purposes (e.g. medical, legal, or financial advice) without proper verification by a professional, and not to misrepresent AI-generated content as human-produced in situations where doing so could deceive or cause harm.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Compliance with Third-Party Terms
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            Because MomentumDIY integrates third-party AI services (see Section 6 below), you agree to comply with all applicable use policies of those providers. For example, you must not use the AI features in ways that violate OpenAI's or Anthropic's content standards (such as generating disallowed violent, hateful, or adult content). If any third-party provider we utilize has additional rules or restrictions, you agree to abide by them when using the related features of our Service.
          </p>

          <p style={{ marginBottom: '1rem', fontStyle: 'italic', opacity: 0.9 }}>
            If you violate this Acceptable Use Policy or any other provision of these Terms, we may suspend or terminate your account without notice, and you may additionally be subject to legal consequences.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', color: '#D4AF37' }}>
            6. AI Features and Third-Party Services
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            MomentumDIY is an AI-enabled marketing platform. This means parts of our Service utilize third-party artificial intelligence models and services (such as OpenAI's ChatGPT, Anthropic's Claude, and the Gemini 2.5 Flash Image generation tool) to assist you in creating content. The following terms apply to the use of these AI features and integrations:
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Third-Party AI Providers
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            When you use our AI-driven features, your prompts, inputs, and queries are securely transmitted to third-party AI providers (e.g., OpenAI, Anthropic, and others) for processing. The AI provider then returns the generated output (text or images) to MomentumDIY, which we deliver to you as part of the Service. By using these features, you acknowledge and consent that your content may be processed by these external AI services. We do not control these third-party services and thus cannot guarantee their functionality, availability, or privacy practices. Your use of the AI features is also subject to the terms and policies of the respective AI providers (which may include content usage rules and data handling practices). We are not responsible for the services or outputs provided by these third parties.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            AI-Generated Content (Output)
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            The content generated by the AI (the "Output") is based on the input you provide and the AI's training data. You are solely responsible for how you use the AI-generated content. While these tools are powerful, AI Output may be inaccurate, misleading, biased, or incomplete. The Output may even unintentionally resemble or reproduce existing content. You should review and validate all AI-generated text or images before using them in your campaigns or business. Do not rely on AI Output as professional advice (e.g., legal, financial, medical) without consulting a qualified expert. MomentumDIY does not guarantee that AI Output will be unique, factually correct, or fit for any particular purpose.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            User Inputs
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            You retain ownership of the content, data, and materials you provide as input to the AI features and of the outputs generated for you (see Section 7 on Intellectual Property). However, by using the AI features, you grant MomentumDIY and our third-party AI partners a limited license to process and transmit your inputs as necessary to generate the requested output. This license is solely for the purpose of operating the Service for you; we and our providers do not claim ownership of your prompts or the resulting content.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Data Usage by AI Providers
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            To our knowledge and intent, our chosen AI partners (such as OpenAI and Anthropic) do not use your inputs to train their general models or otherwise retain your content except as needed to provide the service. We will strive to only integrate AI services that respect user data privacy (for instance, OpenAI's enterprise-level policies). Nonetheless, you should avoid submitting highly sensitive or confidential information to the AI features. We are not liable for any loss or exposure of data that you input into third-party AI systems as part of using MomentumDIY, since those systems are outside our direct control.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            No SLA for AI Features
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            The AI features are provided on an "as-is" basis without any service-level guarantee. Given the experimental and evolving nature of AI technology, downtime, delays, or errors in AI responses may occur. We do not guarantee that AI services will be available 24/7 or that they will meet any performance metrics. You agree that MomentumDIY is not responsible for unavailability or failures of third-party AI services.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Third-Party Integrations
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            In addition to AI providers, MomentumDIY may integrate other third-party services or APIs to enhance functionality (for example, social media platforms, email providers, or design tools). Any such integrations are provided for your convenience. We do not endorse or assume liability for third-party services, and use of those services may require you to agree to their terms and conditions. MomentumDIY is not responsible for content or practices of any third-party websites or services linked or integrated into our platform. If a third-party service ceases to be available or we discontinue an integration, we will not be liable for any losses arising from your inability to use that integration through our Service.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', color: '#D4AF37' }}>
            7. Intellectual Property Rights
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            This section addresses the ownership and rights to intellectual property for both MomentumDIY and users of the Service:
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Our Intellectual Property
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            All rights, title, and interest in and to the Service (including our software code, algorithms, features, design, logos, trademarks, and any content provided by us) are owned by MomentumDIY (Hillary Eden McMullen) and its licensors. The Terms do not transfer any of our intellectual property rights to you. We grant you a limited, non-exclusive, non-transferable license to use the Service during your valid subscription solely for your internal business or personal marketing purposes. You may not copy, distribute, sell, reverse-engineer, or create derivative works from our software or materials, except as explicitly allowed by us or by law. Any feedback or suggestions you provide about the Service are completely voluntary, and we are free to use them without obligation or compensation to you.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Your Content and Campaigns
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            You retain ownership of all content and data you upload into MomentumDIY or create using the Service (including text, images, graphics, and campaign materials that you design, as well as the Input you provide to AI features and the resulting AI-generated Output we deliver back to you). We do not claim ownership over your creative work. However, by using the Service, you grant us a worldwide, non-exclusive license to host, store, transfer, display, and process your content as needed to operate the Service and provide features you request. For example, we may temporarily store your campaign data or share your prompts with an AI provider to generate content (per Section 6). This license is only for the purpose of running and improving the Service for you and other users. We will not use your content outside of providing the Service without your permission.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            User Content Responsibility
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            You are solely responsible for the content you create, upload, or distribute via MomentumDIY. This means you must ensure you have all necessary rights (licenses, consents) to use and share such content. We do not pre-screen user content, but we reserve the right to remove or disable access to any content that we believe violates these Terms or the law. You agree that we are not liable for any content that is created or shared by you or other users through the Service. If you choose to share or publish content generated with MomentumDIY, you must comply with all applicable laws (e.g., marketing and advertising regulations) and you must not violate any third-party rights.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            AI Outputs and Intellectual Property
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            The ownership and intellectual property status of AI-generated outputs can be complex. Our policy is that, to the extent possible, you own the final outputs generated by the AI when using your own inputs (just as if you created the content yourself). However, you acknowledge that AI outputs are generated based on patterns learned from existing data, and thus we do not guarantee that outputs are free from third-party claims. For example, an AI-generated image might coincidentally resemble someone's copyrighted image, or text might contain phrases common in other works. Use AI outputs at your own risk, and perform any necessary checks (such as copyright or trademark clearance) before using them commercially. MomentumDIY is not liable if an AI-generated output is challenged by a third party for intellectual property infringement or any other reason. If you become aware that any output may infringe someone's rights, you should refrain from using it and notify us so we can help address the issue.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Our Marks
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            "MomentumDIY" and our logos and any brand elements are our trademarks or service marks. You may not use our marks without our prior written permission, except as needed to identify our Service when you use it or refer to it (such as in a truthful review or tutorial). Any permitted use of our trademarks must comply with any guidelines we provide.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', color: '#D4AF37' }}>
            8. Disclaimers of Warranties
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            MomentumDIY is provided on an "AS IS" and "AS AVAILABLE" basis. To the fullest extent permitted by law, MomentumDIY disclaims all warranties of any kind – whether express, implied, or statutory – regarding the Service and any outcomes from using it. This includes, but is not limited to:
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            No Guarantee of Results
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            We make no promise that the Service or any marketing advice or AI-generated content will guarantee success in your business or marketing campaigns. You acknowledge that any strategies or materials produced via the Service are used at your own discretion and risk.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Implied Warranties
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            We expressly disclaim any implied warranties, including merchantability, fitness for a particular purpose, title, and non-infringement. It is your responsibility to determine that the Service meets your needs and is suitable for your intended use.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Service Reliability
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            We do not warrant that the Service will be uninterrupted, timely, secure, or error-free. Because our platform relies on third-party systems (web hosting, AI APIs, etc.), we cannot guarantee that the Service will be available at all times or that it will operate without delay or imperfections. Any scheduled downtime, limitations, or known issues will be communicated on our site or status page when possible.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Data Accuracy
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            Any information or content (including AI outputs) obtained through MomentumDIY is for general informational purposes. We do not warrant the accuracy or completeness of any content generated or provided by the Service. You should independently verify important information before relying on it.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            No Professional Advice
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            No part of the Service is intended to provide legal, financial, accounting, health, or other professional advice. Always consult a professional if you require such advice. We are not liable for any decisions you make based on information or results obtained from the Service.
          </p>

          <p style={{ marginBottom: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>
            Some jurisdictions do not allow the exclusion of certain warranties, so some of the above disclaimers may not apply to you. In such cases, any warranties required by law are limited in duration to 30 days from the date you first use the Service, and no warranties shall apply after that period.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', color: '#D4AF37' }}>
            9. Limitation of Liability
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            To the maximum extent permitted by law, MomentumDIY (and Hillary Eden McMullen individually) shall not be liable for certain types of damages or losses related to your use of the Service:
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Indirect & Consequential Damages
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            We will not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, revenues, data, goodwill, or other intangible losses, arising out of or related to your use of (or inability to use) the Service. This limitation applies even if we have been advised of the possibility of such damages, and regardless of the theory of liability (contract, tort, negligence, strict liability, or otherwise).
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Third-Party and Content Liability
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            We are not responsible for any harm resulting from: (a) errors or omissions in AI-generated content, or your reliance on such content; (b) your interactions with or reliance on third-party services integrated with MomentumDIY; or (c) loss or exposure of data during transmission to third-party AI providers or other integrations (as those are beyond our control). You use those features at your own risk.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Service Downtime
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            We are not liable for any delay or failure in performance of the Service caused by events outside our reasonable control, including internet outages, third-party system failures, or force majeure events. No financial compensation (credits or refunds) will be provided for temporary downtime or technical issues, unless required under applicable law.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Cap on Liability
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            Our total liability to you for any claims arising from or related to the Service is limited to the amount you paid us for the Service in the 12 months immediately preceding the claim (or, if greater, $100 USD). If you have not paid any amount (for example, if you are on a free trial), our total liability shall not exceed $100. This cap applies collectively to all claims, actions, and causes of action of any kind.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Exceptions
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            Nothing in these Terms is intended to exclude or limit liability that cannot be limited under law. For example, if applicable law prohibits us from fully disclaiming an implied warranty or limiting our liability for personal injury or gross negligence, then we will comply with those laws and our liability will be limited to the smallest amount permitted. In jurisdictions that do not allow the exclusion of incidental or consequential damages, the above exclusion may not apply to you, but the rest of the limitations still apply.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', color: '#D4AF37' }}>
            10. Indemnification
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            You agree to indemnify, defend, and hold harmless MomentumDIY (and Hillary Eden McMullen and any affiliates, employees, and agents) from and against any and all claims, liabilities, damages, losses, and expenses (including reasonable attorneys' fees) that arise out of or relate to your use of the Service or your violation of these Terms. This includes, without limitation:
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Your Content & Campaigns
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            Any claim that content you created, uploaded, or distributed using MomentumDIY (including AI-generated output based on your prompts) infringes someone's intellectual property or other rights, or has caused harm to a third party (for example, a defamation or privacy claim).
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Breach of Terms or Law
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            Any breach by you of these Terms, or of any applicable law or regulation in connection with your use of the Service. For example, if you use the Service in a way that violates data protection laws, or if you run an email campaign through MomentumDIY that violates anti-spam laws, you agree to cover any resulting costs or penalties.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Misuse of Service
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            Any other misuse of the Service by you or anyone using your account (even if not authorized by you), including any fraudulent, illegal, or negligent activity.
          </p>

          <p style={{ marginBottom: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>
            We reserve the right to handle our legal defense as we see fit, including choosing our counsel, in any matter otherwise subject to indemnification by you. In such a case, you agree to cooperate with us in our defense and not to settle any claim in a way that imposes obligations or liability on MomentumDIY without our prior written consent.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', color: '#D4AF37' }}>
            11. Governing Law and Dispute Resolution
          </h2>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Governing Law
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            These Terms and any dispute arising out of or related to the Service or your use of the Service will be governed by the laws of the State of New Hampshire, USA, without regard to its conflict of laws principles. If you reside outside the United States, you agree that U.S. federal and New Hampshire state laws will apply to the extent not prohibited by law.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Jurisdiction and Venue
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            In the event of any dispute or claim between us that is not subject to arbitration (if applicable) or that cannot be resolved informally, you agree that it will be resolved exclusively in the state or federal courts located in New Hampshire. Both you and MomentumDIY consent to the personal jurisdiction of those courts, waiving any objections to inconvenient forum.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Dispute Resolution (Optional)
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            We encourage you to contact us first to attempt to resolve any issue informally. If we offer any dispute resolution mechanism (such as arbitration or mediation) on our website or via a specific agreement, we will provide those details separately. Unless otherwise agreed by both parties in writing, we each retain the right to seek relief in a court of law.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            No Class Actions
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            You and MomentumDIY agree that any dispute will be conducted solely on an individual basis and not in a class, consolidated, or representative action. This means you may only bring claims on your own behalf, and not on behalf of others or a class of users. (If this class action waiver is not enforceable under the laws of your jurisdiction, it shall be severable and not affect the rest of this section.)
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Injunctive Relief
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            Notwithstanding the above, nothing in these Terms will prevent either party from seeking immediate injunctive relief or other equitable remedy from a court of competent jurisdiction when necessary to protect that party's rights pending a final resolution of the dispute.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', color: '#D4AF37' }}>
            12. Changes to These Terms
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            MomentumDIY may update or modify these Terms from time to time. If we make material changes, we will notify you by email or by posting a prominent notice on our website or within the app. The notice will designate when the changes will become effective. Continued use of the Service after a revised Terms effective date constitutes your acceptance of the updated Terms. If you do not agree to the changes, you must stop using the Service and, if applicable, cancel your subscription. We encourage you to review these Terms periodically to stay informed of any updates. For your convenience, we will update the "Effective Date" at the top of this document when we make changes.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', color: '#D4AF37' }}>
            13. Miscellaneous
          </h2>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Entire Agreement
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            These Terms (along with any referenced documents like the Privacy Policy or additional product-specific terms) constitute the entire agreement between you and MomentumDIY regarding the Service, and supersede all prior agreements or understandings (whether written or oral) relating to its subject matter.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Severability
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            If any provision of these Terms is held to be invalid or unenforceable by a court of competent jurisdiction, that provision will be enforced to the maximum extent permissible and the remainder of the Terms will remain in full force and effect.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Waiver
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            Our failure to enforce any part of these Terms is not a waiver of our right to later enforce that or any other part of the Terms. A waiver of any term shall only be effective if in writing and signed by us.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Assignment
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            You may not assign or transfer these Terms or your rights or obligations under them without our prior written consent. We may assign these Terms as part of a merger, acquisition, sale of assets, or by operation of law or otherwise. These Terms will bind and inure to the benefit of the parties, their successors, and permitted assigns.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            No Third-Party Beneficiaries
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            These Terms create no third-party beneficiary rights. No third party (other than permitted successors/assignees) has any rights to enforce any portion of these Terms.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Relationship of Parties
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            You and MomentumDIY are independent contractors. These Terms do not create a partnership, franchise, joint venture, agency, or fiduciary relationship between us.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Headings
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            Section headings in these Terms are for convenience only and have no legal or contractual effect.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', color: '#D4AF37' }}>
            14. Contact Information
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            If you have any questions, concerns, or feedback about these Terms or the Service, please contact us at MomentumDIY Support. You can also reach out to Hillary Eden McMullen (d/b/a MomentumDIY) at <a href="mailto:info@hillaryedenmcmullen.com" style={{ color: '#EF8E81', textDecoration: 'underline' }}>info@hillaryedenmcmullen.com</a>. We will do our best to address your inquiry promptly.
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
          <p style={{ marginBottom: '0.5rem', fontStyle: 'italic' }}>
            By using MomentumDIY, you acknowledge that you have read, understood, and agree to these Terms & Conditions.
          </p>
          <p style={{ fontWeight: 600 }}>
            Thank you for trusting MomentumDIY with your marketing endeavors!
          </p>
        </div>
      </div>
    </div>
  );
}

