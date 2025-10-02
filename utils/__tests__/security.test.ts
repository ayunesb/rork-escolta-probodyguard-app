import { createHash, sanitizeInput, validateEmail, validatePhone, generateBookingCode } from '../security';

describe('Security Utils', () => {
  describe('createHash', () => {
    it('should create consistent hashes', async () => {
      const data = 'TestData123';
      const hash1 = await createHash(data);
      const hash2 = await createHash(data);
      
      expect(hash1).toBeDefined();
      expect(hash2).toBeDefined();
      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(data);
    });

    it('should produce different hashes for different data', async () => {
      const hash1 = await createHash('Data1');
      const hash2 = await createHash('Data2');
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('validateEmail', () => {
    it('should validate correct emails', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user@domain.co.uk')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('should validate correct phone numbers', () => {
      expect(validatePhone('+1234567890')).toBe(true);
      expect(validatePhone('123-456-7890')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('123')).toBe(false);
      expect(validatePhone('abc')).toBe(false);
    });
  });

  describe('generateBookingCode', () => {
    it('should generate 6-digit codes', () => {
      const code = generateBookingCode();
      expect(code).toHaveLength(6);
      expect(/^\d{6}$/.test(code)).toBe(true);
    });

    it('should generate unique codes', () => {
      const code1 = generateBookingCode();
      const code2 = generateBookingCode();
      expect(code1).not.toBe(code2);
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
