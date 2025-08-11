import Stripe from 'stripe';
export declare class BillingService {
    private static getClient;
    static createCheckoutSession(params: {
        priceId: string;
        successUrl: string;
        cancelUrl: string;
        customerEmail?: string;
        trialDays?: number;
    }): Promise<Stripe.Response<Stripe.Checkout.Session>>;
    static createPortalSession(params: {
        customerId: string;
        returnUrl: string;
    }): Promise<Stripe.Response<Stripe.BillingPortal.Session>>;
}
//# sourceMappingURL=billingService.d.ts.map