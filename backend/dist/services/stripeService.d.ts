export interface SubscriptionData {
    userId: string;
    email: string;
    name?: string;
    plan: 'monthly' | 'annual' | 'spark' | 'growth' | 'lead';
    interval: 'monthly' | 'yearly';
}
export interface CustomerData {
    id: string;
    email: string;
    name?: string;
    subscription_status: string;
    trial_start_date?: Date;
    trial_end_date?: Date;
    subscription_start_date?: Date;
    subscription_end_date?: Date;
    subscription_plan?: string;
    stripe_customer_id?: string;
}
export declare class StripeService {
    static createOrRetrieveCustomer(userId: string, email: string, name?: string): Promise<string>;
    static createSubscription(subscriptionData: SubscriptionData): Promise<{
        subscriptionId: string;
        clientSecret: string | undefined;
        trialEnd: string;
    }>;
    static cancelSubscription(userId: string): Promise<{
        success: boolean;
    }>;
    static getSubscriptionDetails(userId: string): Promise<{
        status: any;
        trialEnd: any;
        plan: any;
        currentPeriodStart?: never;
        currentPeriodEnd?: never;
        cancelAtPeriodEnd?: never;
    } | {
        status: import("stripe").Stripe.Subscription.Status;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        cancelAtPeriodEnd: boolean;
        plan: any;
        trialEnd: any;
    } | null>;
    static handleWebhook(event: any): Promise<void>;
    private static handleSubscriptionUpdate;
    private static handleSubscriptionCancellation;
    private static handlePaymentSuccess;
    private static processAffiliateCommission;
    private static handlePaymentFailure;
}
//# sourceMappingURL=stripeService.d.ts.map