export interface PasswordValidationResult {
  isValid: boolean;
  feedback: string[];
}

export const validatePasswordStrength = (password: string): PasswordValidationResult => {
  const feedback: string[] = [];
  
  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    feedback.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    feedback.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    feedback.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push('Password must contain at least one special character');
  }
  
  const commonPasswords = ['password', '12345678', 'qwerty', 'abc123', 'password123'];
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    feedback.push('Password is too common');
  }
  
  return {
    isValid: feedback.length === 0,
    feedback
  };
};
