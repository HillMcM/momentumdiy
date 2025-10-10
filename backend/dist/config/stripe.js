"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.STRIPE_CONFIG = exports.stripe = void 0;
const stripe_1 = __importDefault(require("stripe"));
const stripeSecretKey = process.env['STRIPE_SECRET_KEY'];
const stripePublishableKey = process.env['STRIPE_PUBLISHABLE_KEY'];
if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is required');
}
if (!stripePublishableKey) {
    throw new Error('STRIPE_PUBLISHABLE_KEY environment variable is required');
}
exports.stripe = new stripe_1.default(stripeSecretKey, {
    apiVersion: '2025-08-27.basil',
    typescript: true,
});
exports.STRIPE_CONFIG = {
    publishableKey: stripePublishableKey,
    secretKey: stripeSecretKey,
    webhookSecret: process.env['STRIPE_WEBHOOK_SECRET'] || '',
    prices: {
        founder: {
            monthly: process.env['STRIPE_PRICE_FOUNDER_MONTHLY'] || '',
            yearly: process.env['STRIPE_PRICE_FOUNDER_YEARLY'] || '',
        },
        monthly: {
            monthly: process.env['STRIPE_PRICE_MONTHLY'] || 'price_monthly',
            yearly: process.env['STRIPE_PRICE_MONTHLY'] || 'price_monthly',
        },
        annual: {
            monthly: process.env['STRIPE_PRICE_ANNUAL'] || 'price_annual',
            yearly: process.env['STRIPE_PRICE_ANNUAL'] || 'price_annual',
        },
        spark: {
            monthly: process.env['STRIPE_PRICE_SPARK_MONTHLY'] || 'price_spark_monthly',
            yearly: process.env['STRIPE_PRICE_SPARK_MONTHLY'] || 'price_spark_monthly',
        },
        growth: {
            monthly: process.env['STRIPE_PRICE_GROWTH_MONTHLY'] || 'price_growth_monthly',
            yearly: process.env['STRIPE_PRICE_GROWTH_MONTHLY'] || 'price_growth_monthly',
        },
        lead: {
            monthly: process.env['STRIPE_PRICE_LEAD_MONTHLY'] || 'price_lead_monthly',
            yearly: process.env['STRIPE_PRICE_LEAD_MONTHLY'] || 'price_lead_monthly',
        }
    },
    trialDays: 30,
};
//# sourceMappingURL=stripe.js.map