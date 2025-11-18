const request = require('supertest');
const app = require('../server');
const Payment = require('../models/Payment');

describe('Payment API Tests', () => {
  let merchantTransactionId;

  describe('POST /api/payment/initiate', () => {
    it('should initiate a payment successfully', async () => {
      const response = await request(app)
        .post('/api/payment/initiate')
        .send({
          amount: 100,
          userId: 'USER123',
          phoneNumber: '9999999999'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('merchantTransactionId');
      expect(response.body.data).toHaveProperty('redirectUrl');
      expect(response.body.data.amount).toBe(100);
      expect(response.body.data.status).toBe('PENDING');

      merchantTransactionId = response.body.data.merchantTransactionId;
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/payment/initiate')
        .send({
          amount: 100
          // Missing userId and phoneNumber
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    it('should return 400 if amount is invalid', async () => {
      const response = await request(app)
        .post('/api/payment/initiate')
        .send({
          amount: -100,
          userId: 'USER123',
          phoneNumber: '9999999999'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('greater than 0');
    });
  });

  describe('GET /api/payment/status/:merchantTransactionId', () => {
    beforeEach(async () => {
      const payment = new Payment({
        merchantTransactionId: 'TEST_TXN_123',
        amount: 100,
        userId: 'USER123',
        phoneNumber: '9999999999',
        status: 'PENDING'
      });
      await payment.save();
    });

    it('should return payment status', async () => {
      const response = await request(app)
        .get('/api/payment/status/TEST_TXN_123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('merchantTransactionId');
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data.merchantTransactionId).toBe('TEST_TXN_123');
    });

    it('should return 404 if payment not found', async () => {
      const response = await request(app)
        .get('/api/payment/status/NON_EXISTENT_TXN')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('GET /api/payment/:merchantTransactionId', () => {
    beforeEach(async () => {
      const payment = new Payment({
        merchantTransactionId: 'TEST_TXN_456',
        amount: 200,
        userId: 'USER456',
        phoneNumber: '8888888888',
        status: 'SUCCESS'
      });
      await payment.save();
    });

    it('should return payment details', async () => {
      const response = await request(app)
        .get('/api/payment/TEST_TXN_456')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.merchantTransactionId).toBe('TEST_TXN_456');
      expect(response.body.data.amount).toBe(200);
      expect(response.body.data.status).toBe('SUCCESS');
    });

    it('should return 404 if payment not found', async () => {
      const response = await request(app)
        .get('/api/payment/NON_EXISTENT_TXN')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/payment/all', () => {
    beforeEach(async () => {
      await Payment.insertMany([
        {
          merchantTransactionId: 'TXN_001',
          amount: 100,
          userId: 'USER1',
          phoneNumber: '1111111111',
          status: 'PENDING'
        },
        {
          merchantTransactionId: 'TXN_002',
          amount: 200,
          userId: 'USER2',
          phoneNumber: '2222222222',
          status: 'SUCCESS'
        }
      ]);
    });

    it('should return all payments', async () => {
      const response = await request(app)
        .get('/api/payment/all')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data).toHaveLength(2);
    });
  });

  describe('GET /', () => {
    it('should return API health check', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('running');
      expect(response.body).toHaveProperty('endpoints');
    });
  });
});

