"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingService = void 0;
const stripe_1 = __importDefault(require("stripe"));
class BillingService {
    static getClient() {
        const key = process.env['STRIPE_SECRET_KEY'] || '';
        if (!key)
            throw new Error('STRIPE_SECRET_KEY not set');
        return new stripe_1.default(key, { apiVersion: '2024-06-20' });
    }
    static async createCheckoutSession(params) {
        const stripe = this.getClient();
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            line_items: [{ price: params.priceId, quantity: 1 }],
            success_url: params.successUrl,
            cancel_url: params.cancelUrl,
            customer_email: params.customerEmail || undefined,
            subscription_data: params.trialDays ? { trial_period_days: params.trialDays } : undefined,
            allow_promotion_codes: true,
        });
        return session;
    }
    static async createPortalSession(params) {
        const stripe = this.getClient();
        const session = await stripe.billingPortal.sessions.create({
            customer: params.customerId,
            return_url: params.returnUrl,
        });
        return session;
    }
}
exports.BillingService = BillingService;
//# sourceMappingURL=billingService.js.map