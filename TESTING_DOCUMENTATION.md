# Testing Documentation

## Overview

This document provides comprehensive testing guidelines for the Escolta Pro security app.

## Test Structure

### Unit Tests

Unit tests are located in `__tests__` directories next to the files they test.

```
utils/
  __tests__/
    validation.test.ts
    security.test.ts
    performance.test.ts
services/
  __tests__/
    cacheService.test.ts
backend/
  __tests__/
    auth.test.ts
```

### Running Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Run tests with coverage
bun test --coverage

# Run specific test file
bun test utils/__tests__/validation.test.ts
```

## Test Categories

### 1. Validation Tests

**Location**: `utils/__tests__/validation.test.ts`

Tests for input validation schemas:
- Email validation
- Phone number validation
- Password strength validation
- Input sanitization

**Example**:
```typescript
describe('emailSchema', () => {
  it('should validate correct email addresses', () => {
    expect(emailSchema.safeParse('test@example.com').success).toBe(true);
  });
});
```

### 2. Security Tests

**Location**: `utils/__tests__/security.test.ts`

Tests for security utilities:
- Hash generation
- Email validation
- Phone validation
- Booking code generation
- Input sanitization

**Example**:
```typescript
describe('createHash', () => {
  it('should create consistent hashes', async () => {
    const hash1 = await createHash('data');
    const hash2 = await createHash('data');
    expect(hash1).toBe(hash2);
  });
});
```

### 3. Performance Tests

**Location**: `utils/__tests__/performance.test.ts`

Tests for performance measurement utilities:
- Synchronous function performance
- Asynchronous function performance

### 4. Cache Service Tests

**Location**: `services/__tests__/cacheService.test.ts`

Tests for caching functionality:
- Set and get operations
- TTL expiration
- Cache deletion
- Cache clearing

### 5. Integration Tests

**Location**: `backend/__tests__/auth.test.ts`

Tests for tRPC routes and backend integration.

## Writing New Tests

### Test Template

```typescript
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('Feature Name', () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
  });

  describe('specific functionality', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = functionToTest(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### Best Practices

1. **Arrange-Act-Assert Pattern**
   - Arrange: Set up test data
   - Act: Execute the function
   - Assert: Verify the result

2. **Test Naming**
   - Use descriptive names
   - Start with "should"
   - Be specific about what is being tested

3. **Test Independence**
   - Each test should be independent
   - Use `beforeEach` for setup
   - Use `afterEach` for cleanup

4. **Mock External Dependencies**
   ```typescript
   jest.mock('@/lib/firebase', () => ({
     db: mockDb,
     auth: mockAuth,
   }));
   ```

5. **Test Edge Cases**
   - Empty inputs
   - Null/undefined values
   - Boundary conditions
   - Error scenarios

## Coverage Goals

- **Utilities**: 90%+ coverage
- **Services**: 80%+ coverage
- **Components**: 70%+ coverage
- **Integration**: 60%+ coverage

## Continuous Integration

Tests run automatically on:
- Pull requests
- Commits to main branch
- Pre-deployment

## Manual Testing

### Test Accounts

```
CLIENT: client@demo.com / demo123
GUARD: guard1@demo.com / demo123
COMPANY: company@demo.com / demo123
ADMIN: admin@demo.com / demo123
```

### Test Scenarios

1. **User Authentication**
   - Sign up with new account
   - Sign in with existing account
   - Sign out
   - Biometric authentication (mobile only)

2. **Booking Flow**
   - Create new booking
   - View booking details
   - Track guard location
   - Complete booking
   - Rate guard

3. **Payment Flow**
   - Process payment
   - View payment history
   - Request refund (admin)

4. **Chat System**
   - Send messages
   - Receive messages
   - Typing indicators
   - Message translation

5. **Real-time Features**
   - Location tracking
   - Live updates
   - Notifications

## Debugging Tests

### Common Issues

1. **Async Tests Timing Out**
   ```typescript
   it('should complete async operation', async () => {
     await expect(asyncFunction()).resolves.toBe(expected);
   }, 10000); // Increase timeout
   ```

2. **Mock Not Working**
   ```typescript
   jest.clearAllMocks(); // Clear mocks between tests
   ```

3. **State Persistence**
   ```typescript
   beforeEach(() => {
     // Reset state before each test
   });
   ```

## Performance Testing

### Benchmarking

```typescript
import { measurePerformance } from '@/utils/performance';

measurePerformance('operation-name', () => {
  // Code to benchmark
});
```

### Load Testing

For load testing, use external tools:
- Artillery
- k6
- JMeter

## Security Testing

### Checklist

- [ ] Input validation on all user inputs
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Authentication checks
- [ ] Authorization checks
- [ ] Rate limiting
- [ ] Secure data storage

## Accessibility Testing

### Manual Checks

- [ ] Screen reader compatibility
- [ ] Keyboard navigation
- [ ] Color contrast
- [ ] Touch target sizes
- [ ] Text scaling

## Platform-Specific Testing

### iOS
- Test on physical device
- Test on simulator
- Test different iOS versions

### Android
- Test on physical device
- Test on emulator
- Test different Android versions

### Web
- Test on Chrome
- Test on Safari
- Test on Firefox
- Test responsive design

## Reporting Issues

When reporting test failures:

1. **Test name and location**
2. **Expected behavior**
3. **Actual behavior**
4. **Steps to reproduce**
5. **Environment details**
6. **Screenshots/logs**

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://testingjavascript.com/)
