# Quick Postman Testing Guide

## ⚠️ Important: You Cannot Complete Payment in Postman!

Payment must be completed in a **browser**, not Postman. Postman is only for API testing.

## Testing Steps

### Step 1: Initiate Payment (Postman)

**Request:**
```
POST http://localhost:3000/api/payment/initiate
```

**Body:**
```json
{
  "amount": 100,
  "userId": "USER123",
  "phoneNumber": "9999999999"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "merchantTransactionId": "TXN123...",
    "redirectUrl": "https://mercury-uat.phonepe.com/...",
    "status": "PENDING"
  }
}
```

**📝 Copy the `redirectUrl` from response!**

### Step 2: Complete Payment (Browser - NOT Postman!)

1. **Copy the `redirectUrl`** from Step 1 response
2. **Open it in a browser** (Chrome, Firefox, etc.)
3. **Complete payment** on PhonePe page
4. **Payment will be processed**

### Step 3: Check Status (Postman)

**Request:**
```
GET http://localhost:3000/api/payment/status/TXN123...
```

Replace `TXN123...` with your `merchantTransactionId` from Step 1

**Response (After Payment):**
```json
{
  "success": true,
  "data": {
    "status": "SUCCESS",
    ...
  }
}
```

## Quick Checklist

- [ ] Initiate payment in Postman ✅
- [ ] Copy redirectUrl from response ✅
- [ ] Open redirectUrl in browser ✅
- [ ] Complete payment on PhonePe ✅
- [ ] Check status in Postman ✅

## Common Mistakes

❌ **Trying to complete payment in Postman**
- Payment must be done in browser
- Postman is only for API calls

❌ **Not opening redirectUrl**
- You must open the URL in browser
- Just having the URL doesn't complete payment

❌ **Checking status before completing payment**
- Status will be PENDING until payment is completed
- Complete payment first, then check status

## What Each Endpoint Does

1. **POST /api/payment/initiate**
   - Creates payment
   - Returns redirectUrl
   - Status: PENDING

2. **GET /api/payment/status/:id**
   - Checks status with PhonePe
   - Updates database automatically
   - Returns current status

3. **POST /api/payment/callback**
   - Called by PhonePe automatically
   - Updates status when payment completes
   - Usually not called manually

## Testing Flow Diagram

```
Postman → Initiate Payment → Get redirectUrl
   ↓
Browser → Open redirectUrl → Complete Payment
   ↓
PhonePe → Processes Payment → Sends Callback
   ↓
Postman → Check Status → See SUCCESS
```

## Tips

1. **Save merchantTransactionId:**
   - Copy it after initiating payment
   - Use it to check status later

2. **Watch server logs:**
   - See what's happening
   - Debug any issues

3. **Use ngrok for callbacks:**
   - If testing callbacks
   - Makes your local server accessible

## Summary

✅ **Postman:** Initiate payment, check status
❌ **Postman:** Complete payment (must use browser)
✅ **Browser:** Complete payment on PhonePe
✅ **Automatic:** Status updates after payment

