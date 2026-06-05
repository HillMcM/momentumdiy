import { useNavigate } from 'react-router-dom';
import { BRANDING } from './config/branding';

export default function AffiliateProgramTermsPage() {
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile Back Button */}
      <button
        onClick={() => navigate(-1)}
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
        marginBottom: '2rem',
        marginTop: '2rem'
      }}>
      <h1 style={{ 
        fontSize: '2.5rem', 
        fontWeight: 700, 
        marginBottom: '1rem',
        color: '#EF8E81',
        textAlign: 'center'
      }}>
        {BRANDING.name} Affiliate Program Terms
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
          These Affiliate Program Terms ("Affiliate Terms") govern your participation in the {BRANDING.name} Affiliate Program (the "Program"). These terms are in addition to, and not in lieu of, the {BRANDING.name} Terms of Service. By participating in the Program, you agree to be bound by these Affiliate Terms. If you do not agree to these terms, you may not participate in the Program.
        </p>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', color: '#D4AF37' }}>
            1. Program Overview
          </h2>
          
          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            What is the Affiliate Program?
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            The {BRANDING.name} Affiliate Program allows eligible participants ("Affiliates") to earn commissions by referring new customers to {BRANDING.name}. When someone you refer signs up for a paid subscription and makes their first payment, you earn a commission on their subscription revenue.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Types of Affiliates
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            The Program includes two types of affiliates: (a) <strong>User Affiliates</strong> - existing {BRANDING.name} users who refer friends and colleagues, and (b) <strong>Partner Affiliates</strong> - marketing professionals, agencies, or consultants who refer their clients. Both types earn the same commission rate and are subject to these same terms, except where specifically noted.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', color: '#D4AF37' }}>
            2. Eligibility and Enrollment
          </h2>
          
          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            User Affiliate Eligibility
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            To become a User Affiliate, you must: (a) have an active {BRANDING.name} account, (b) have been a user for at least 30 days, and (c) have a valid subscription (trial or paid). You may opt into the Program through your account settings. Once enrolled, you will receive a unique referral code.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Partner Affiliate Eligibility
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            To become a Partner Affiliate, you must: (a) be a marketing professional, agency, consultant, or similar business entity, (b) submit an application through our partner application form, (c) be approved by {BRANDING.name} in our sole discretion, and (d) maintain good standing in the Program. Partner applications are subject to review, and we reserve the right to reject any application for any reason. Approval does not guarantee ongoing participation if you violate these terms.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Age and Legal Capacity
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            You must be at least 18 years old (or the age of majority in your jurisdiction) to participate in the Program. If you are participating on behalf of a business entity, you represent that you have authority to bind that entity to these Affiliate Terms.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            One Account Per Person
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            Each person or entity may only have one affiliate account. Creating multiple accounts to circumvent Program limits or earn additional commissions is prohibited and may result in termination of all accounts and forfeiture of all commissions.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', color: '#D4AF37' }}>
            3. Commission Structure
          </h2>
          
          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Commission Rate
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            Affiliates earn a commission equal to <strong>20% of the subscription revenue</strong> generated from each successful referral. This commission is calculated based on the actual amount paid by the referred customer (after any discounts, refunds, or chargebacks).
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Commission Duration
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            Commissions are paid for <strong>12 months</strong> from the date the referred customer makes their first payment. After 12 months, no further commissions will be earned for that referral, even if the customer continues their subscription.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            When Commissions Are Earned
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            A commission is earned only when: (a) a new customer clicks your unique referral link, (b) that customer signs up for a {BRANDING.name} account within 90 days of clicking your link, (c) the customer makes their first payment (converting from trial to paid subscription), and (d) the payment is successfully processed and not refunded or charged back. Commissions are not earned on free trials, cancelled subscriptions, refunded payments, or chargebacks.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Commission Calculation
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            Commissions are calculated monthly based on the subscription revenue received from your referrals during that month. For example, if a referral pays $14.99 per month, you earn $2.998 (20%) per month for 12 months, totaling $35.976 over the commission period. Commission amounts are shown in U.S. dollars and are subject to the payment processing fees and currency conversion rates applicable to your payout method.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Self-Referrals Prohibited
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            You may not refer yourself, create multiple accounts to refer yourself, or engage in any scheme to earn commissions on your own subscription. Self-referrals will be detected and voided, and may result in immediate termination from the Program and forfeiture of all commissions.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', color: '#D4AF37' }}>
            4. Referral Tracking and Attribution
          </h2>
          
          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Referral Links and Codes
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            Upon enrollment, you will receive a unique referral code and referral link. You must use your assigned referral link or code when promoting {BRANDING.name}. Using someone else's referral code, modifying referral links, or attempting to manipulate the tracking system is prohibited and may result in termination.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            90-Day Attribution Window
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            When someone clicks your referral link, we track that click for 90 days. If the person signs up for {BRANDING.name} within that 90-day window, the referral will be attributed to you. If they sign up after 90 days, you will not receive credit for the referral, even if they later mention your name or code.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            First-Click Attribution
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            If a potential customer clicks multiple affiliate links before signing up, only the first click (within the 90-day window) will be credited. This ensures fair attribution and prevents disputes between affiliates.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Tracking Accuracy
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            While we use industry-standard tracking methods, we cannot guarantee 100% accuracy in all circumstances. Factors such as browser settings, ad blockers, cookie restrictions, or technical issues may affect tracking. {BRANDING.name} is not liable for lost commissions due to tracking failures, but we will make reasonable efforts to investigate and resolve legitimate tracking issues reported within 30 days of the signup date.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', color: '#D4AF37' }}>
            5. Payouts and Payment Terms
          </h2>
          
          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Minimum Payout Threshold
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            You must accumulate at least <strong>$10.00 USD</strong> in earned commissions before you can request a payout. Commissions below this threshold will remain in your account until you reach the minimum or until your account is terminated (at which point commissions below the minimum may be forfeited).
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Payout Schedule
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            Payouts are processed monthly. You may request a payout at any time once you reach the $10 minimum. Payout requests submitted by the last day of a month will be processed within 30 days of the request. Payouts are made via Stripe Connect directly to your bank account. You must complete Stripe Connect onboarding and provide valid banking information to receive payouts.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Pending vs. Available Balance
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            Your commission balance is divided into two categories: (a) <strong>Pending Balance</strong> - commissions earned but not yet available for payout (typically held for 30 days to account for refunds or chargebacks), and (b) <strong>Available Balance</strong> - commissions that are eligible for payout. Only your available balance can be withdrawn.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Refunds and Chargebacks
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            If a referred customer receives a refund or initiates a chargeback, the corresponding commission will be deducted from your balance (including from pending payouts if necessary). If your balance becomes negative due to refunds or chargebacks, future commissions will be applied to offset the negative balance before you can receive new payouts.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Payment Processing Fees
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            Payouts are processed through Stripe Connect. Stripe may charge standard processing fees for transfers, which are deducted from your payout amount. {BRANDING.name} does not charge additional fees for payouts. You are responsible for any taxes, fees, or charges imposed by your bank or financial institution.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Taxes
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            You are solely responsible for reporting and paying any taxes (including income tax, self-employment tax, or sales tax) applicable to your affiliate commissions in your jurisdiction. {BRANDING.name} does not withhold taxes from payouts unless required by law. We may request tax information (such as a W-9 form for U.S. affiliates) if required by applicable tax regulations. If you are subject to tax withholding, we will deduct the required amount from your payouts and remit it to the appropriate tax authority.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Payment Disputes
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            If you believe there is an error in your commission balance or payout, you must notify us within 60 days of the date the commission was earned or the payout was processed. We will investigate and correct any legitimate errors. Disputes raised after 60 days may not be honored.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', color: '#D4AF37' }}>
            6. Affiliate Responsibilities and Restrictions
          </h2>
          
          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Accurate Promotion
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            You must accurately represent {BRANDING.name} and its features, pricing, and benefits. You may not make false, misleading, or exaggerated claims about the Service. You must not misrepresent your relationship with {BRANDING.name} (for example, claiming to be an employee or official partner beyond the affiliate relationship).
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Prohibited Marketing Practices
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            You agree NOT to engage in any of the following prohibited practices:
          </p>
          <ul style={{ marginLeft: '2rem', marginBottom: '1rem', listStyleType: 'disc' }}>
            <li style={{ marginBottom: '0.5rem' }}>Spam, unsolicited emails, or unsolicited messages (including on social media, forums, or messaging platforms)</li>
            <li style={{ marginBottom: '0.5rem' }}>Purchasing or bidding on {BRANDING.name} trademarks, brand names, or variations as search engine keywords (unless explicitly authorized)</li>
            <li style={{ marginBottom: '0.5rem' }}>Creating fake reviews, testimonials, or social media accounts to promote {BRANDING.name}</li>
            <li style={{ marginBottom: '0.5rem' }}>Using deceptive or misleading advertising (including "clickbait" or false claims)</li>
            <li style={{ marginBottom: '0.5rem' }}>Violating any applicable laws, regulations, or third-party terms of service (such as platform rules on social media sites)</li>
            <li style={{ marginBottom: '0.5rem' }}>Engaging in any fraudulent, illegal, or unethical activity</li>
            <li style={{ marginBottom: '0.5rem' }}>Using automated tools, bots, or scripts to generate fake clicks or signups</li>
            <li style={{ marginBottom: '0.5rem' }}>Offering incentives, cashback, or rewards to potential customers in exchange for using your referral link (unless explicitly approved by {BRANDING.name})</li>
          </ul>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Compliance with Laws
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            You must comply with all applicable laws and regulations when promoting {BRANDING.name}, including but not limited to: (a) CAN-SPAM Act and other anti-spam laws, (b) GDPR and other data protection laws (if applicable), (c) FTC guidelines on endorsements and testimonials (including disclosure requirements), (d) advertising and marketing regulations in your jurisdiction, and (e) platform-specific rules (such as social media platform terms of service).
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Disclosure Requirements
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            When promoting {BRANDING.name}, you must clearly disclose your affiliate relationship. For example, you should include language such as "I earn a commission if you sign up through my link" or "This is an affiliate link" in your promotional content. This disclosure must be clear, conspicuous, and placed near any affiliate link or promotional content. Failure to disclose your affiliate relationship may violate FTC guidelines and these terms.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Use of {BRANDING.name} Branding
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            You may use {BRANDING.name} logos, trademarks, and brand materials solely for the purpose of promoting the Service through your referral link. Any use of our branding must comply with any brand guidelines we provide. You may not modify our logos or create derivative works. You may not use our branding in a way that suggests we endorse your products or services (beyond the affiliate relationship), or that implies a partnership, employment, or other relationship beyond what is stated in these terms.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Domain and Website Restrictions
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            You may not register domain names that include {BRANDING.name} trademarks or brand names (or variations or misspellings) without our prior written permission. You may not create websites or social media accounts that impersonate {BRANDING.name} or suggest an official relationship beyond the affiliate program.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', color: '#D4AF37' }}>
            7. Termination
          </h2>
          
          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Termination by You
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            You may terminate your participation in the Program at any time by contacting us or through your affiliate dashboard. Upon termination, you will stop earning new commissions, but you will continue to receive commissions for referrals that were already attributed to you (subject to the 12-month commission period and other terms herein).
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Termination by {BRANDING.name}
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            We reserve the right to suspend or terminate your participation in the Program at any time, with or without cause, and with or without notice. We may terminate your account immediately if you violate these Affiliate Terms, engage in fraudulent activity, or misuse the Program. Common reasons for termination include: spam, self-referrals, fraudulent signups, violation of marketing restrictions, or any activity that damages {BRANDING.name}'s reputation or business.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Effect of Termination
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            Upon termination: (a) your referral link will stop working and you will not earn commissions on new referrals, (b) you will receive any earned commissions that are already available for payout (subject to the minimum payout threshold), (c) pending commissions may be forfeited if termination is due to violation of these terms, (d) you must immediately stop using {BRANDING.name} branding and remove any affiliate links from your promotional materials, and (e) you will lose access to your affiliate dashboard. We are not obligated to pay commissions earned after the termination date, except for commissions already earned and available at the time of termination.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Forfeiture of Commissions
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            If your account is terminated due to violation of these Affiliate Terms, fraud, or abuse, we reserve the right to forfeit all pending and unpaid commissions. We may also reverse or claw back commissions that were already paid if we discover the commissions were earned through fraudulent means or violation of these terms.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', color: '#D4AF37' }}>
            8. Relationship of Parties
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            You and {BRANDING.name} are independent contractors. These Affiliate Terms do not create a partnership, joint venture, agency, franchise, or employment relationship. You are not an employee, agent, or representative of {BRANDING.name}. You have no authority to bind {BRANDING.name} or make commitments on our behalf. You are solely responsible for your own business operations, expenses, and compliance with applicable laws.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', color: '#D4AF37' }}>
            9. Disclaimers and Limitations
          </h2>
          
          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            No Guarantee of Results
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            {BRANDING.name} makes no guarantee that you will earn any specific amount of commissions or that the Program will be profitable for you. Your success depends on many factors, including your marketing efforts, audience, and market conditions. We do not promise any minimum number of referrals or commission amounts.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Program Modifications
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            We reserve the right to modify, suspend, or discontinue the Program or any part of it at any time, with or without notice. This includes the right to change commission rates, payout thresholds, tracking methods, or Program rules. Material changes will be communicated to active affiliates, but we are not obligated to provide advance notice for all changes. Continued participation after changes constitutes acceptance of the modified terms.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            Limitation of Liability
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            To the maximum extent permitted by law, {BRANDING.name} shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your participation in the Program, including lost profits, lost commissions, or business interruption. Our total liability to you for any claims related to the Program is limited to the total amount of commissions paid to you in the 12 months preceding the claim (or $100, whichever is greater).
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#EF8E81' }}>
            No Warranties
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            The Program is provided "as is" and "as available" without warranties of any kind, express or implied. We disclaim all warranties, including merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the Program will be uninterrupted, error-free, or that tracking will be 100% accurate.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', color: '#D4AF37' }}>
            10. Indemnification
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            You agree to indemnify, defend, and hold harmless {BRANDING.name} (and Hillary Eden McMullen, employees, and agents) from and against any claims, liabilities, damages, losses, and expenses (including reasonable attorneys' fees) arising from: (a) your participation in the Program, (b) your promotional activities or content, (c) your violation of these Affiliate Terms or applicable laws, (d) any claims by third parties related to your use of affiliate links or promotional materials, or (e) any misrepresentation or false claims you make about {BRANDING.name} or the Service.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', color: '#D4AF37' }}>
            11. Confidentiality
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            You may receive confidential information about {BRANDING.name}, including commission rates, Program details, business strategies, or customer data. You agree to keep such information confidential and not disclose it to third parties, except as required by law. This obligation survives termination of your participation in the Program.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', color: '#D4AF37' }}>
            12. Governing Law and Disputes
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            These Affiliate Terms are governed by the laws of the State of New Hampshire, USA, without regard to conflict of laws principles. Any disputes arising from or related to the Program will be resolved in the state or federal courts located in New Hampshire. You consent to the personal jurisdiction of those courts.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', color: '#D4AF37' }}>
            13. Changes to These Terms
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            We may update these Affiliate Terms from time to time. Material changes will be communicated to active affiliates via email or through the affiliate dashboard. Continued participation in the Program after changes become effective constitutes your acceptance of the updated terms. If you do not agree to the changes, you must terminate your participation in the Program.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', color: '#D4AF37' }}>
            14. Contact Information
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            If you have questions about the Affiliate Program or these terms, please contact us at <a href="mailto:info@hillaryedenmcmullen.com" style={{ color: '#EF8E81', textDecoration: 'underline' }}>info@hillaryedenmcmullen.com</a>.
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
            By participating in the {BRANDING.name} Affiliate Program, you acknowledge that you have read, understood, and agree to these Affiliate Program Terms.
          </p>
        </div>
      </div>
      </div>
    </>
  );
}

