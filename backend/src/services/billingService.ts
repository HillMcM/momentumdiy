import Stripe from 'stripe';

export class BillingService {
  private static getClient(): Stripe {
    const key = process.env['STRIPE_SECRET_KEY'] || '';
    if (!key) throw new Error('STRIPE_SECRET_KEY not set');
    return new Stripe(key, { apiVersion: '2024-06-20' } as any);
  }

  static async createCheckoutSession(params: {
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    customerEmail?: string;
    trialDays?: number;
  }) {
    const stripe = this.getClient();
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: params.priceId, quantity: 1 }],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      customer_email: params.customerEmail || undefined,
      subscription_data: params.trialDays ? { trial_period_days: params.trialDays } : undefined,
      allow_promotion_codes: true,
    } as any);
    return session;
  }

  static async createPortalSession(params: { customerId: string; returnUrl: string }) {
    const stripe = this.getClient();
    const session = await stripe.billingPortal.sessions.create({
      customer: params.customerId,
      return_url: params.returnUrl,
    });
    return session;
  }
}


