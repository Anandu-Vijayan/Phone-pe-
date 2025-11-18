# Test Suite

This directory contains automated tests for the PhonePe Payment API.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Ensure MongoDB is running:**
   - Local MongoDB: `mongod`
   - Or use MongoDB Atlas connection string in `.env.test`

3. **Configure test environment:**
   - The test suite uses `.env.test` for configuration
   - Tests use a separate test database: `phonepe_payments_test`

## Running Tests

### Run all tests:
```bash
npm test
```

### Run tests in watch mode:
```bash
npm run test:watch
```

### Run tests with coverage:
```bash
npm run test:coverage
```

## Test Files

- `setup.js` - Test setup and teardown (database connection, cleanup)
- `payment.test.js` - API endpoint tests for payment routes

## Test Coverage

Tests cover:
- Payment initiation
- Payment status checking
- Payment retrieval by ID
- Getting all payments
- Health check endpoint
- Error handling and validation

## Test Database

Tests use a separate test database (`phonepe_payments_test`) which is:
- Cleared after each test
- Dropped after all tests complete

This ensures tests don't affect your development database.

