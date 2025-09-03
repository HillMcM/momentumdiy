import Stripe from 'stripe';
export declare const stripe: Stripe;
export declare const STRIPE_CONFIG: {
    readonly publishableKey: string;
    readonly secretKey: string;
    readonly webhookSecret: string;
    readonly prices: {
        readonly monthly: {
            readonly monthly: string;
        };
        readonly annual: {
            readonly yearly: string;
        };
        readonly spark: {
            readonly monthly: string;
            readonly yearly: string;
        };
        readonly growth: {
            readonly monthly: string;
            readonly yearly: string;
        };
        readonly lead: {
            readonly monthly: string;
            readonly yearly: string;
        };
    };
    readonly trialDays: 30;
};
export type StripePriceIds = typeof STRIPE_CONFIG.prices;
//# sourceMappingURL=stripe.d.ts.map