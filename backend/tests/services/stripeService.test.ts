import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { StripeService, SubscriptionData } from '../../src/services/stripeService';

// Mock Stripe
jest.mock('../../src/config/stripe', () => ({
  stripe: {
    customers: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn()
    },
    checkout: {
      sessions: {
        create: jest.fn()
      }
    },
    subscriptions: {
      retrieve: jest.fn(),
      update: jest.fn(),
      cancel: jest.fn()
    }
  },
  STRIPE_CONFIG: {
    prices: {
      monthly: { monthly: 'price_monthly_test' },
      annual: { yearly: 'price_annual_test' },
      founder: { monthly: 'price_founder_monthly_test' }
    }
  }
}));

jest.mock('../../src/config/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: {}, error: null }))
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: { stripe_customer_id: 'cus_test' }, error: null }))
        }))
      }))
    }))
  }
}));

jest.mock('../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }
}));

import { stripe, STRIPE_CONFIG } from '../../src/config/stripe';

describe('StripeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createSubscription', () => {
    const mockSubscriptionData: SubscriptionData = {
      userId: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      plan: 'monthly',
      interval: 'monthly'
    };

    it('should create a new customer and checkout session', async () => {
      const mockCustomer = { id: 'cus_new123' };
      const mockSession = {
        id: 'cs_test123',
        url: 'https://checkout.stripe.com/pay/cs_test123'
      };

      (stripe.customers.create as jest.Mock).mockResolvedValue(mockCustomer);
      (stripe.checkout.sessions.create as jest.Mock).mockResolvedValue(mockSession);

      const result = await StripeService.createSubscription(mockSubscriptionData);

      expect(result.success).toBe(true);
      expect(result.sessionId).toBe('cs_test123');
      expect(result.url).toBe('https://checkout.stripe.com/pay/cs_test123');
      expect(stripe.customers.create).toHaveBeenCalledWith({
        email: mockSubscriptionData.email,
        name: mockSubscriptionData.name,
        metadata: {
          userId: mockSubscriptionData.userId
        }
      });
    });

    it('should handle errors gracefully', async () => {
      (stripe.customers.create as jest.Mock).mockRejectedValue(
        new Error('Stripe API error')
      );

      const result = await StripeService.createSubscription(mockSubscriptionData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create subscription');
    });

    it('should use correct price ID for plan and interval', async () => {
      const mockCustomer = { id: 'cus_new123' };
      const mockSession = { id: 'cs_test123', url: 'https://checkout.stripe.com' };

      (stripe.customers.create as jest.Mock).mockResolvedValue(mockCustomer);
      (stripe.checkout.sessions.create as jest.Mock).mockResolvedValue(mockSession);

      await StripeService.createSubscription({
        ...mockSubscriptionData,
        plan: 'monthly',
        interval: 'monthly'
      });

      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          line_items: expect.arrayContaining([
            expect.objectContaining({
              price: STRIPE_CONFIG.prices.monthly.monthly
            })
          ])
        })
      );
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription at period end', async () => {
      const mockSubscription = {
        id: 'sub_123',
        cancel_at_period_end: true
      };

      (stripe.subscriptions.update as jest.Mock).mockResolvedValue(mockSubscription);

      const result = await StripeService.cancelSubscription('sub_123');

      expect(result.success).toBe(true);
      expect(stripe.subscriptions.update).toHaveBeenCalledWith('sub_123', {
        cancel_at_period_end: true
      });
    });

    it('should handle cancellation errors', async () => {
      (stripe.subscriptions.update as jest.Mock).mockRejectedValue(
        new Error('Subscription not found')
      );

      const result = await StripeService.cancelSubscription('sub_invalid');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Input Validation', () => {
    it('should reject invalid email addresses', async () => {
      const invalidData: SubscriptionData = {
        userId: 'user-123',
        email: 'not-an-email',
        name: 'Test User',
        plan: 'monthly',
        interval: 'monthly'
      };

      const result = await StripeService.createSubscription(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('email');
    });

    it('should reject empty user ID', async () => {
      const invalidData: SubscriptionData = {
        userId: '',
        email: 'test@example.com',
        name: 'Test User',
        plan: 'monthly',
        interval: 'monthly'
      };

      const result = await StripeService.createSubscription(invalidData);

      expect(result.success).toBe(false);
    });
  });
});



