# Quick Setup Guide

## Step 1: Install Dependencies

```bash
npm install
```

This will automatically install the PhonePe SDK from:
```
https://phonepe.mycloudrepo.io/public/repositories/phonepe-pg-sdk-node/releases/v2/phonepe-pg-sdk-node.tgz
```

## Step 2: Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/phonepe_payments

# PhonePe Configuration (Developer Account)
PHONEPE_CLIENT_ID=M23PEWICDBGTQ_2511171603
PHONEPE_CLIENT_SECRET=ZmI5Yjg4ODYtM2E5OC00ODczLWJlNzEtNzFiYzUxOTgxNzBk
PHONEPE_CLIENT_VERSION=1
PHONEPE_ENVIRONMENT=SANDBOX

# Frontend URL (for redirects)
FRONTEND_URL=http://localhost:3000
```

## Step 3: Start MongoDB

Make sure MongoDB is running:
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas connection string in MONGODB_URI
```

## Step 4: Run the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Step 5: Test with Postman

1. Import `PhonePe_Payment_API.postman_collection.json` into Postman
2. Set `base_url` variable to `http://localhost:3000`
3. Test the endpoints

## API Endpoints

- `GET /` - Health check
- `POST /api/payment/initiate` - Initiate payment
- `GET /api/payment/status/:merchantTransactionId` - Check payment status
- `GET /api/payment/:merchantTransactionId` - Get payment details
- `GET /api/payment/all` - Get all payments
- `POST /api/payment/callback` - PhonePe webhook callback

