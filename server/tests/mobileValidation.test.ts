import { isIndianMobileNumber } from '../src/utils/mobileValidator';

describe('Indian Mobile Number Validation', () => {
  it('should accept valid 10-digit Indian numbers starting with 6-9', () => {
    expect(isIndianMobileNumber('9876543210')).toBe(true);
    expect(isIndianMobileNumber('8123456789')).toBe(true);
    expect(isIndianMobileNumber('7123456789')).toBe(true);
    expect(isIndianMobileNumber('6123456789')).toBe(true);
  });

  it('should reject numbers not starting with 6, 7, 8, or 9', () => {
    expect(isIndianMobileNumber('5123456789')).toBe(false);
    expect(isIndianMobileNumber('0123456789')).toBe(false);
    expect(isIndianMobileNumber('1234567890')).toBe(false);
  });

  it('should reject numbers less than 10 digits', () => {
    expect(isIndianMobileNumber('987654321')).toBe(false);
    expect(isIndianMobileNumber('9876')).toBe(false);
  });

  it('should reject numbers more than 10 digits', () => {
    expect(isIndianMobileNumber('98765432101')).toBe(false);
    expect(isIndianMobileNumber('919876543210')).toBe(false);
  });

  it('should reject numbers containing alphabets or special characters', () => {
    expect(isIndianMobileNumber('98765abcde')).toBe(false);
    expect(isIndianMobileNumber('98765!@#$0')).toBe(false);
    expect(isIndianMobileNumber('98765 4321')).toBe(false);
    expect(isIndianMobileNumber('+9198765432')).toBe(false);
  });

  it('should handle whitespace appropriately (should reject if internal, accept if trimmed correctly before passing)', () => {
    // The utility strips leading/trailing space for safety, but internal spaces are rejected
    expect(isIndianMobileNumber(' 9876543210 ')).toBe(true); 
    expect(isIndianMobileNumber('98 76543210')).toBe(false); 
  });
});
