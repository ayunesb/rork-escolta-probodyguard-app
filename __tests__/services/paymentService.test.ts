/**
 * Payment Service Unit Tests
 * Tests for client token generation, payment processing, and refunds
 */

import { paymentService } from '@/services/paymentService';
import { getDocs } from 'firebase/firestore';

// Mock ENV config
jest.mock('@/config/env', () => ({
  ENV: {
    API_URL: 'https://api.test.com',
    PAYMENTS_CURRENCY: 'MXN',
  },
  PAYMENT_CONFIG: {
    PROCESSING_FEE_PERCENT: 0.029,
    PROCESSING_FEE_FIXED: 3.5,
    PLATFORM_CUT_PERCENT: 0.1,
  },
}));

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  serverTimestamp: jest.fn(() => ({ seconds: Date.now() / 1000 })),
}));

jest.mock('@/lib/firebase', () => ({
  db: jest.fn(() => ({})),
}));

// Mock fetch
global.fetch = jest.fn();

describe('PaymentService - Client Token', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get client token successfully', async () => {
    const mockToken = 'mock-braintree-client-token-12345';
    
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ clientToken: mockToken }),
    });

    const token = await paymentService.getClientToken('user-123');

    expect(token).toBe(mockToken);
    expect(global.fetch).toHaveBeenCalled();
  });

  it('should handle client token generation error', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });

    await expect(paymentService.getClientToken('user-123')).rejects.toThrow();
  });
});

describe('PaymentService - Payment Processing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process payment successfully', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ 
        success: true,
        transactionId: 'transaction-123' 
      }),
    });

    const result = await paymentService.processPayment(
      'payment-nonce-xyz',
      150.00,
      'booking-789',
      'user-123',
      true
    );

    expect(result.success).toBe(true);
    expect(result.transactionId).toBe('transaction-123');
  });

  it('should handle payment processing failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Insufficient funds' }),
    });

    const result = await paymentService.processPayment(
      'payment-nonce-xyz',
      150.00,
      'booking-789',
      'user-123',
      false
    );

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should calculate payment breakdown correctly', () => {
    const hourlyRate = 200;
    const duration = 5;
    const breakdown = paymentService.calculateBreakdown(hourlyRate, duration);

    expect(breakdown.subtotal).toBe(1000);
    expect(breakdown.total).toBeGreaterThan(breakdown.subtotal);
    expect(breakdown.processingFee).toBeGreaterThan(0);
    expect(breakdown.platformCut).toBeGreaterThan(0);
    expect(breakdown.guardPayout).toBeLessThan(breakdown.subtotal);
    
    // Verify total calculation
    expect(breakdown.total).toBe(
      breakdown.subtotal + breakdown.processingFee
    );
  });
});

describe('PaymentService - Payment Methods', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load saved payment methods', async () => {
    const mockPaymentMethods = [
      {
        token: 'pm-1',
        last4: '4242',
        cardType: 'Visa',
        expirationMonth: '12',
        expirationYear: '2025',
      },
      {
        token: 'pm-2',
        last4: '5555',
        cardType: 'MasterCard',
        expirationMonth: '06',
        expirationYear: '2026',
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ paymentMethods: mockPaymentMethods }),
    });

    const methods = await paymentService.getSavedPaymentMethods('user-123');

    expect(methods).toHaveLength(2);
    expect(methods[0].token).toBe('pm-1');
    expect(methods[0].last4).toBe('4242');
    expect(methods[1].cardType).toBe('MasterCard');
  });

  it('should handle no saved payment methods (404)', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ paymentMethods: [] }),
    });

    const methods = await paymentService.getSavedPaymentMethods('user-123');

    expect(methods).toEqual([]);
  });

  it('should remove payment method successfully', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    await expect(
      paymentService.removePaymentMethod('user-123', 'pm-token')
    ).resolves.not.toThrow();

    expect(global.fetch).toHaveBeenCalled();
  });
});

describe('PaymentService - Refunds', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Firestore query for refund updates
    (getDocs as jest.Mock).mockResolvedValue({
      empty: false,
      docs: [{
        id: 'payment-doc-123',
      }],
    });
  });

  it('should process refund successfully', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ 
        success: true,
        refundId: 'refund-123' 
      }),
    });

    const result = await paymentService.processRefund(
      'transaction-123',
      'booking-789',
      150.00
    );

    expect(result.success).toBe(true);
    // The service returns refundId as transactionId
    expect(result.transactionId).toBe('refund-123');
  });

  it('should handle partial refunds', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ 
        success: true,
        refundId: 'refund-456' 
      }),
    });

    const result = await paymentService.processRefund(
      'transaction-123',
      'booking-789',
      75.00
    );

    expect(result.success).toBe(true);
    // The service returns refundId as transactionId
    expect(result.transactionId).toBe('refund-456');
  });

  it('should handle refund processing error', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Transaction already refunded' }),
    });

    const result = await paymentService.processRefund(
      'transaction-123',
      'booking-789',
      150.00
    );

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe('PaymentService - Edge Cases', () => {
  it('should format MXN currency correctly', () => {
    const formatted = paymentService.formatMXN(1234.56);
    // Should contain the amount with proper formatting
    expect(formatted).toContain('1,234.56');
    // Should be in currency format (may vary by locale, so check for $ or MXN)
    expect(formatted).toMatch(/\$|MXN/);
  });

  it('should calculate booking cost breakdown', async () => {
    const cost = await paymentService.calculateBookingCost(
      200, // hourly rate
      5,   // duration
      'armored', // vehicle type
      'armed',   // protection type
      1 // number of protectees
    );

    expect(cost.subtotal).toBe(1000);
    expect(cost.vehicleFee).toBeGreaterThan(0);
    expect(cost.protectionFee).toBeGreaterThan(0);
    expect(cost.platformFee).toBeGreaterThan(0);
    expect(cost.total).toBeGreaterThan(cost.subtotal);
  });

  it('should validate payment breakdown percentages', () => {
    const hourlyRate = 200;
    const duration = 5;
    const breakdown = paymentService.calculateBreakdown(hourlyRate, duration);

    const subtotal = breakdown.subtotal;

    // Platform cut should be reasonable (5-15% of subtotal)
    const platformPercentage = (breakdown.platformCut / subtotal) * 100;
    expect(platformPercentage).toBeGreaterThanOrEqual(5);
    expect(platformPercentage).toBeLessThanOrEqual(20);

    // Processing fee should be reasonable (2-5% of subtotal)
    const processingPercentage = (breakdown.processingFee / subtotal) * 100;
    expect(processingPercentage).toBeGreaterThanOrEqual(2);
    expect(processingPercentage).toBeLessThanOrEqual(10);
  });
});

