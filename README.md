# PhonePe Payment SDK Integration

A simple Node.js project integrating PhonePe Payment Gateway with MongoDB for payment transaction management.

## Features

- ✅ PhonePe Official SDK Integration (v2)
- ✅ MongoDB for payment transaction storage
- ✅ RESTful API endpoints
- ✅ Payment status tracking
- ✅ Webhook callback handling
- ✅ Postman collection for testing

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- PhonePe Merchant Account with:
  - Merchant ID
  - Salt Key
  - Salt Index

## Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd "Phone Pe  v1.00"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory (you can copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your credentials (copy from `env.example`):
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/phonepe_payments
   PHONEPE_CLIENT_ID=YOUR_CLIENT_ID
   PHONEPE_CLIENT_SECRET=YOUR_CLIENT_SECRET
   PHONEPE_CLIENT_VERSION=1
   PHONEPE_ENVIRONMENT=SANDBOX
   FRONTEND_URL=http://localhost:3000
   ```
   
   **Note:** The PhonePe SDK is installed from the official repository:
   ```bash
   npm install https://phonepe.mycloudrepo.io/public/repositories/phonepe-pg-sdk-node/releases/v2/phonepe-pg-sdk-node.tgz
   ```
   
   **For Developer Account:** Use `PHONEPE_ENVIRONMENT=SANDBOX` for testing. Change to `PRODUCTION` when going live.

4. **Start MongoDB**
   
   Make sure MongoDB is running on your system:
   ```bash
   # For local MongoDB
   mongod
   
   # Or use MongoDB Atlas connection string in MONGODB_URI
   ```

5. **Run the application**
   ```bash
   # Development mode (with nodemon)
   npm run dev
   
   # Production mode
   npm start
   ```

   The server will start on `http://localhost:3000`

## API Endpoints

### 1. Health Check
- **GET** `/`
- Returns API information and available endpoints

### 2. Initiate Payment
- **POST** `/api/payment/initiate`
- **Body:**
  ```json
  {
    "amount": 100,
    "userId": "USER123",
    "phoneNumber": "9999999999"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Payment initiated successfully",
    "data": {
      "merchantTransactionId": "TXN1234567890",
      "redirectUrl": "https://mercury-uat.phonepe.com/...",
      "amount": 100,
      "status": "PENDING"
    }
  }
  ```

### 3. Check Payment Status
- **GET** `/api/payment/status/:merchantTransactionId`
- Returns current payment status from PhonePe

### 4. Get Payment by ID
- **GET** `/api/payment/:merchantTransactionId`
- Returns payment details from database

### 5. Get All Payments
- **GET** `/api/payment/all`
- Returns all payment transactions

### 6. Payment Callback (Webhook)
- **POST** `/api/payment/callback`
- This endpoint is called by PhonePe after payment completion
- **Body:** (sent by PhonePe)
  ```json
  {
    "response": "base64_encoded_response"
  }
  ```

## Postman Collection

Import the `PhonePe_Payment_API.postman_collection.json` file into Postman to test all endpoints.

### Setup Postman Environment

1. Import the collection
2. Set the `base_url` variable to `http://localhost:3000` (or your server URL)
3. Use the collection to test all endpoints

## Project Structure

```
Phone Pe  v1.00/
├── config/
│   └── database.js          # MongoDB connection
├── models/
│   └── Payment.js           # Payment model schema
├── routes/
│   └── payment.js           # Payment API routes
├── utils/
│   └── phonepe.js           # PhonePe SDK utilities
├── .env                     # Environment variables (create this)
├── .env.example             # Example environment variables
├── .gitignore               # Git ignore file
├── package.json             # Dependencies
├── server.js                # Main server file
├── README.md                # This file
└── PhonePe_Payment_API.postman_collection.json  # Postman collection
```

## PhonePe Configuration

### Official SDK

This project uses the **official PhonePe Payment Gateway SDK for Node.js (v2)**:
- SDK Package: `phonepe-pg-sdk-node`
- Installation: Automatically installed via `npm install`
- Source: `https://phonepe.mycloudrepo.io/public/repositories/phonepe-pg-sdk-node/releases/v2/phonepe-pg-sdk-node.tgz`

### Getting PhonePe Credentials

1. Sign up for a PhonePe Developer/Merchant Account
2. Get your credentials from the PhonePe Dashboard:
   - **Client ID**: Your unique client identifier (e.g., `M23PEWICDBGTQ_2511171603`)
   - **Client Secret**: Your secret key for API authentication
   - **Client Version**: Version number (usually `1`)
   - **Environment**: `SANDBOX` for testing or `PRODUCTION` for live

### Environment Configuration

- **SANDBOX**: Use for testing and development
- **PRODUCTION**: Use for live transactions

Set `PHONEPE_ENVIRONMENT` in `.env` accordingly. The SDK automatically uses the correct API endpoints based on the environment.

## Payment Flow

1. **Initiate Payment**: Client calls `/api/payment/initiate` with payment details
2. **Redirect**: Server returns PhonePe payment URL
3. **User Payment**: User completes payment on PhonePe page
4. **Callback**: PhonePe sends callback to `/api/payment/callback`
5. **Status Check**: Client can check status using `/api/payment/status/:merchantTransactionId`

## Testing

### Using Postman

1. Import the Postman collection
2. Start the server
3. Test endpoints in order:
   - Health Check
   - Initiate Payment (use the `merchantTransactionId` from response)
   - Check Payment Status
   - Get All Payments

### Using cURL

```bash
# Initiate Payment
curl -X POST http://localhost:3000/api/payment/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "userId": "USER123",
    "phoneNumber": "9999999999"
  }'

# Check Status
curl http://localhost:3000/api/payment/status/TXN1234567890
```

## Error Handling

The API returns standardized error responses:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

## Security Notes

- Never commit `.env` file to version control
- Keep your PhonePe Salt Key secure
- Use HTTPS in production
- Validate all inputs on the server side
- Implement proper authentication/authorization for production use

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify MongoDB connection string format

### PhonePe API Errors
- Verify Merchant ID, Salt Key, and Salt Index
- Check API URL (production vs UAT)
- Ensure callback URL is accessible (use ngrok for local testing)

### Port Already in Use
- Change `PORT` in `.env`
- Or stop the process using port 3000

## License

ISC

## Support

For PhonePe API documentation, visit: [PhonePe Developer Portal](https://developer.phonepe.com/)

