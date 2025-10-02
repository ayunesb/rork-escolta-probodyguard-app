import { emailSchema, phoneSchema, passwordSchema, sanitizeInput } from '../validation';

describe('Validation Utils', () => {
  describe('emailSchema', () => {
    it('should validate correct email addresses', () => {
      expect(emailSchema.safeParse('test@example.com').success).toBe(true);
      expect(emailSchema.safeParse('user.name+tag@example.co.uk').success).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(emailSchema.safeParse('invalid').success).toBe(false);
      expect(emailSchema.safeParse('test@').success).toBe(false);
      expect(emailSchema.safeParse('@example.com').success).toBe(false);
      expect(emailSchema.safeParse('').success).toBe(false);
    });
  });

  describe('phoneSchema', () => {
    it('should validate correct phone numbers', () => {
      expect(phoneSchema.safeParse('+1234567890').success).toBe(true);
      expect(phoneSchema.safeParse('+12345678901').success).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(phoneSchema.safeParse('123').success).toBe(false);
      expect(phoneSchema.safeParse('invalid').success).toBe(false);
      expect(phoneSchema.safeParse('').success).toBe(false);
    });
  });

  describe('passwordSchema', () => {
    it('should validate passwords with minimum length', () => {
      expect(passwordSchema.safeParse('Pass123').success).toBe(true);
      expect(passwordSchema.safeParse('MyPassword').success).toBe(true);
    });

    it('should reject short passwords', () => {
      expect(passwordSchema.safeParse('short').success).toBe(false);
      expect(passwordSchema.safeParse('12345').success).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should remove dangerous characters', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).not.toContain('<script>');
      expect(sanitizeInput('Normal text')).toBe('Normal text');
    });

    it('should handle empty strings', () => {
      expect(sanitizeInput('')).toBe('');
    });
  });
});
