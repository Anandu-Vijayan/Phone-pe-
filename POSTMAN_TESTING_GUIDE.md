# Postman Testing Guide for PhonePe Payment

## Important Note About redirectUrl

**⚠️ redirectUrl vs callbackUrl:**

- **redirectUrl**: Where user is redirected AFTER payment (usually your frontend page)
- **callbackUrl**: Webhook endpoint that PhonePe calls (your API endpoint)

**Your current setup:**
- `redirectUrl: /api/payment/callback` ❌ (This is wrong - should be frontend page)
- `callbackUrl: /api/payment/callback` ✅ (This is correct - webhook endpoint)

## Testing Flow in Postman

### Step 1: Initiate Payment

**Request:**
```
POST http://localhost:3000/api/payment/initiate
```

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "amount": 100,
  "userId": "USER123",
  "phoneNumber": "9999999999"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Payment initiated successfully",
  "data": {
    "merchantTransactionId": "TXN1234567890...",
    "redirectUrl": "https://mercury-uat.phonepe.com/...",
    "amount": 100,
    "status": "PENDING"
  }
}
```

**What to do:**
1. Copy the `redirectUrl` from response
2. Open it in a browser (not Postman)
3. Complete payment on PhonePe page

### Step 2: Complete Payment on PhonePe

**Important:** You CANNOT complete payment in Postman!

1. **Copy the redirectUrl** from Step 1 response
2. **Open in browser** (Chrome, Firefox, etc.)
3. **Complete payment** on PhonePe page
4. **Payment will be processed**

### Step 3: Check Payment Status

**Request:**
```
GET http://localhost:3000/api/payment/status/YOUR_MERCHANT_TRANSACTION_ID
```

**Replace `YOUR_MERCHANT_TRANSACTION_ID`** with the `merchantTransactionId` from Step 1

**Expected Response (After Payment):**
```json
{
  "success": true,
  "data": {
    "merchantTransactionId": "TXN123...",
    "amount": 100,
    "status": "SUCCESS",
    "phonepeTransactionId": "...",
    ...
  }
}
```

### Step 4: Test Callback (Optional)

**Request:**
```
POST http://localhost:3000/api/payment/callback
```

**Headers:**
```
Content-Type: application/json
```

**Body (Example - PhonePe sends this):**
```json
{
  "response": "BASE64_ENCODED_RESPONSE"
}
```

**Note:** This is usually called by PhonePe automatically, but you can test it manually.

## Complete Postman Collection Usage

### 1. Health Check
- **GET** `/` - Verify server is running

### 2. Initiate Payment
- **POST** `/api/payment/initiate`
- Get `redirectUrl` and `merchantTransactionId`

### 3. Complete Payment (Browser)
- Open `redirectUrl` in browser
- Complete payment on PhonePe
- **Cannot be done in Postman!**

### 4. Check Status
- **GET** `/api/payment/status/:merchantTransactionId`
- Verify status updated to SUCCESS

### 5. Get Payment Details
- **GET** `/api/payment/:merchantTransactionId`
- Get full payment details

### 6. Get All Payments
- **GET** `/api/payment/all`
- List all payments

## Testing Tips

### Tip 1: Use Environment Variables

In Postman, create an environment with:
```
base_url: http://localhost:3000
merchantTransactionId: (will be set after initiate)
```

### Tip 2: Save redirectUrl

After initiating payment:
1. Copy `redirectUrl` from response
2. Save it somewhere
3. Open in browser to complete payment

### Tip 3: Check Server Logs

While testing, watch your server console for:
- Payment initiation logs
- Status check logs
- Callback received logs

### Tip 4: Use ngrok for Callback Testing

If testing callbacks:
1. Start ngrok: `ngrok http 3000`
2. Update `.env`: `FRONTEND_URL=https://your-ngrok-url.ngrok-free.app`
3. Restart server
4. Re-initiate payment

## Common Postman Testing Issues

### Issue 1: Can't Complete Payment in Postman

**Problem:** Payment must be completed in browser, not Postman

**Solution:**
- Copy `redirectUrl` from Postman response
- Open in browser
- Complete payment there

### Issue 2: Status Stays PENDING

**Problem:** Payment not completed yet

**Solution:**
- Make sure you opened `redirectUrl` in browser
- Complete payment on PhonePe page
- Then check status again

### Issue 3: Callback Not Received

**Problem:** Callback URL not accessible

**Solution:**
- Use ngrok for local testing
- Update `FRONTEND_URL` in `.env`
- Restart server

### Issue 4: redirectUrl Not Working

**Problem:** redirectUrl might be incorrect

**Solution:**
- Check if redirectUrl is from PhonePe domain
- Verify PhonePe credentials in `.env`
- Check server logs for errors

## Quick Testing Workflow

1. **Postman:** Initiate payment
   ```
   POST /api/payment/initiate
   ```

2. **Browser:** Complete payment
   - Copy `redirectUrl` from Postman response
   - Open in browser
   - Complete payment

3. **Postman:** Check status
   ```
   GET /api/payment/status/TXN123...
   ```

4. **Postman:** Verify success
   ```
   GET /api/payment/TXN123...
   ```

## Important Notes

✅ **What you CAN test in Postman:**
- Initiate payment
- Check payment status
- Get payment details
- Test callback endpoint (manually)

❌ **What you CANNOT test in Postman:**
- Complete actual payment (must use browser)
- Receive automatic callbacks (unless using ngrok)

## Fix Your redirectUrl

**Current (Wrong):**
```javascript
redirectUrl: `${process.env.FRONTEND_URL}/api/payment/callback`
```

**Should be (Correct):**
```javascript
redirectUrl: `${process.env.FRONTEND_URL}/payment/success`  // Frontend success page
callbackUrl: `${process.env.FRONTEND_URL}/api/payment/callback`  // Webhook endpoint
```

**For Testing:**
If you don't have a frontend, you can use:
```javascript
redirectUrl: `${process.env.FRONTEND_URL}/payment/callback`  // Simple redirect
callbackUrl: `${process.env.FRONTEND_URL}/api/payment/callback`  // Webhook
```

But ideally:
- `redirectUrl` = Frontend page where user sees success message
- `callbackUrl` = API endpoint that receives webhook

