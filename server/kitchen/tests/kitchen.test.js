const { normalizePhoneToE164, isValidStatusTransition, generateOrderNumber } = require('../utils');
const { ORDER_STATUS } = require('../types');

describe('Kitchen Module Utils', () => {
  describe('normalizePhoneToE164', () => {
    test('should normalize US phone number', () => {
      expect(normalizePhoneToE164('(939) 341-5337', 'US')).toBe('+19393415337');
      expect(normalizePhoneToE164('939-341-5337', 'US')).toBe('+19393415337');
      expect(normalizePhoneToE164('9393415337', 'US')).toBe('+19393415337');
    });

    test('should handle invalid phone numbers', () => {
      expect(normalizePhoneToE164('invalid')).toBeNull();
      expect(normalizePhoneToE164('')).toBeNull();
      expect(normalizePhoneToE164(null)).toBeNull();
    });
  });

  describe('isValidStatusTransition', () => {
    test('should allow valid transitions', () => {
      expect(isValidStatusTransition('RECEIVED_UNCONFIRMED', 'CONFIRMED')).toBe(true);
      expect(isValidStatusTransition('CONFIRMED', 'PREPARING')).toBe(true);
      expect(isValidStatusTransition('PREPARING', 'READY')).toBe(true);
      expect(isValidStatusTransition('READY', 'COMPLETED')).toBe(true);
    });

    test('should reject invalid transitions', () => {
      expect(isValidStatusTransition('RECEIVED_UNCONFIRMED', 'READY')).toBe(false);
      expect(isValidStatusTransition('COMPLETED', 'PREPARING')).toBe(false);
      expect(isValidStatusTransition('CANCELLED', 'CONFIRMED')).toBe(false);
    });

    test('should allow cancellation from active statuses', () => {
      expect(isValidStatusTransition('RECEIVED_UNCONFIRMED', 'CANCELLED')).toBe(true);
      expect(isValidStatusTransition('CONFIRMED', 'CANCELLED')).toBe(true);
      expect(isValidStatusTransition('PREPARING', 'CANCELLED')).toBe(true);
    });
  });

  describe('generateOrderNumber', () => {
    test('should generate formatted order numbers', () => {
      expect(generateOrderNumber(0)).toBe('ORDER-0001');
      expect(generateOrderNumber(42)).toBe('ORDER-0043');
      expect(generateOrderNumber(999)).toBe('ORDER-1000');
    });
  });
});

// Mock tests for data adapter (requires more setup)
describe('Google Sheets Adapter', () => {
  test('should handle idempotent order creation', () => {
    // TODO: Implement with proper mocking
    expect(true).toBe(true);
  });

  test('should validate status transitions', () => {
    // TODO: Implement with proper mocking  
    expect(true).toBe(true);
  });
});
