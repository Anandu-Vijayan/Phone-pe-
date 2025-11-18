# Testing Guide

This guide explains how to set up and run tests for the PhonePe Payment API.

## Test Environment Setup

### 1. Environment Variables

Create a `.env.test` file in the root directory:

```env
# Test Environment Configuration
PORT=3001
NODE_ENV=test

# Test MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/phonepe_payments_test

# PhonePe Test Configuration (use sandbox)
PHONEPE_CLIENT_ID=YOUR_CLIENT_ID
PHONEPE_CLIENT_SECRET=YOUR_CLIENT_SECRET
PHONEPE_CLIENT_VERSION=1
PHONEPE_ENVIRONMENT=SANDBOX

# Frontend URL for testing
FRONTEND_URL=http://localhost:3001
```

**Note:** Tests use a separate database (`phonepe_payments_test`) to avoid affecting your development data.

### 2. Install Test Dependencies

```bash
npm install
```

This installs:
- `jest` - Testing framework
- `supertest` - HTTP assertion library for API testing

### 3. Ensure MongoDB is Running

Make sure MongoDB is running before running tests:

```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas connection string in .env.test
```

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

Automatically reruns tests when files change:

```bash
npm run test:watch
```

### Run Tests with Coverage Report

Generate code coverage report:

```bash
npm run test:coverage
```

Coverage reports are generated in the `coverage/` directory.

## Test Structure

```
test/
├── setup.js           # Test setup and teardown
├── payment.test.js    # Payment API endpoint tests
└── README.md          # Test documentation
```

## Test Coverage

The test suite covers:

- ✅ **Health Check** - API status endpoint
- ✅ **Payment Initiation** - Create new payment transactions
- ✅ **Payment Status** - Check payment status by transaction ID
- ✅ **Get Payment** - Retrieve payment details by ID
- ✅ **Get All Payments** - List all payment transactions
- ✅ **Validation** - Input validation and error handling
- ✅ **Error Handling** - 404 and 500 error responses

## Test Database

- Tests use a separate database: `phonepe_payments_test`
- Database is cleaned after each test
- Database is dropped after all tests complete
- This ensures tests don't affect your development database

## Writing New Tests

Example test structure:

```javascript
const request = require('supertest');
const app = require('../server');
const Payment = require('../models/Payment');

describe('Feature Name', () => {
  beforeEach(async () => {
    // Setup test data
  });

  it('should test something', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .expect(200);

    expect(response.body.success).toBe(true);
  });

  afterEach(async () => {
    // Cleanup
  });
});
```

## Postman Collection

For manual API testing, use the Postman collection:

1. Import `PhonePe_Payment_API.postman_collection.json` into Postman
2. Set `base_url` variable to `http://localhost:3000`
3. Test endpoints in order:
   - Health Check
   - Initiate Payment
   - Check Payment Status
   - Get Payment by ID
   - Get All Payments

The Postman collection automatically saves `merchantTransactionId` and `redirectUrl` as collection variables for easy testing.

## Troubleshooting

### Tests Fail with Connection Error

- Ensure MongoDB is running
- Check `.env.test` has correct `MONGODB_URI`
- Verify MongoDB connection string is valid

### Tests Hang or Timeout

- Check if test database is accessible
- Ensure no other process is using the test database
- Try restarting MongoDB

### Port Already in Use

- Change `PORT` in `.env.test` to a different port
- Or kill the process using the port

