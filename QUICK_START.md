# Quick Start Guide

## Your PhonePe Developer Account Credentials

```
Client ID: M23PEWICDBGTQ_2511171603
Client Version: 1
Client Secret: ZmI5Yjg4ODYtM2E5OC00ODczLWJlNzEtNzFiYzUxOTgxNzBk
Environment: SANDBOX (for testing)
```

## Step 1: Install Dependencies

```bash
npm install
```

This will install:
- Express.js
- MongoDB (Mongoose)
- PhonePe Official SDK (v2)
- Other dependencies

## Step 2: Create .env File

Create a `.env` file in the root directory with these exact values:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/phonepe_payments
PHONEPE_CLIENT_ID=M23PEWICDBGTQ_2511171603
PHONEPE_CLIENT_SECRET=ZmI5Yjg4ODYtM2E5OC00ODczLWJlNzEtNzFiYzUxOTgxNzBk
PHONEPE_CLIENT_VERSION=1
PHONEPE_ENVIRONMENT=SANDBOX
FRONTEND_URL=http://localhost:3000
```

## Step 3: Start MongoDB

```bash
# If MongoDB is installed locally
mongod

# Or use MongoDB Atlas connection string in MONGODB_URI
```

## Step 4: Start the Server

```bash
npm run dev
```

Server will start on `http://localhost:3000`

## Step 5: Test the API

### Using Postman

1. Import `PhonePe_Payment_API.postman_collection.json`
2. Set `base_url` variable to `http://localhost:3000`
3. Test the endpoints

### Using cURL

**Initiate Payment:**
```bash
curl -X POST http://localhost:3000/api/payment/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "userId": "USER123",
    "phoneNumber": "9999999999"
  }'
```

**Check Payment Status:**
```bash
curl http://localhost:3000/api/payment/status/TXN1234567890
```

## API Endpoints

- `GET /` - Health check
- `POST /api/payment/initiate` - Initiate payment
- `GET /api/payment/status/:merchantTransactionId` - Check status
- `GET /api/payment/:merchantTransactionId` - Get payment details
- `GET /api/payment/all` - Get all payments
- `POST /api/payment/callback` - PhonePe webhook

## Important Notes

1. **Environment**: Currently set to `SANDBOX` for testing. Change to `PRODUCTION` when going live.

2. **Callback URL**: Make sure your callback URL is accessible. For local testing, use tools like ngrok:
   ```bash
   ngrok http 3000
   ```
   Then update `FRONTEND_URL` in `.env` with the ngrok URL.

3. **MongoDB**: Ensure MongoDB is running before starting the server.

4. **PhonePe SDK**: The official SDK handles all API calls, checksums, and verification automatically.

## Troubleshooting

- **MongoDB Connection Error**: Check if MongoDB is running and `MONGODB_URI` is correct
- **PhonePe API Error**: Verify credentials in `.env` file
- **Port Already in Use**: Change `PORT` in `.env` or stop the process using port 3000

