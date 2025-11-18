# Card Payment Testing Guide

## How PhonePe Payment Works

PhonePe Standard Checkout allows users to choose their payment method (UPI, Card, NetBanking, etc.) on the payment page. The payment mode is **selected by the user**, not pre-configured.

## Testing with Card Payment

### Step 1: Initiate Payment

**Request:**
```bash
POST /api/payment/initiate
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
    "redirectUrl": "https://mercury-uat.phonepe.com/...",
    "merchantTransactionId": "TXN123..."
  }
}
```

### Step 2: Open Payment Page

1. Copy the `redirectUrl` from response
2. Open it in browser
3. You'll see PhonePe payment page with multiple options:
   - UPI
   - **Card** ← Select this
   - Net Banking
   - Wallet
   - etc.

### Step 3: Select Card Payment

1. Click on **"Card"** option on PhonePe payment page
2. Enter test card details (see below)
3. Complete payment

### Step 4: Use Test Card Details (Sandbox)

For PhonePe **SANDBOX** environment, use these test card details:

#### Test Card 1 (Success):
```
Card Number: 5123 4567 8901 2346
Expiry: 12/25 (any future date)
CVV: 123 (any 3 digits)
Cardholder Name: Test User
```

#### Test Card 2 (Success):
```
Card Number: 4111 1111 1111 1111
Expiry: 12/25
CVV: 123
Cardholder Name: Test User
```

#### Test Card 3 (Declined):
```
Card Number: 4000 0000 0000 0002
Expiry: 12/25
CVV: 123
Cardholder Name: Test User
```

**Note:** These are example test cards. Check PhonePe documentation for actual sandbox test cards.

### Step 5: Complete Payment

1. Enter card details
2. Click "Pay"
3. Payment will be processed
4. Status will update to SUCCESS automatically

## Why Payment Shows as PENDING

### Common Reasons:

1. **Payment Not Completed:**
   - User didn't complete payment on PhonePe page
   - Payment was cancelled
   - Payment failed

2. **Payment Method Not Selected:**
   - User didn't select card payment
   - User selected UPI but didn't complete

3. **Test Card Issues:**
   - Wrong test card number
   - Card declined
   - Invalid card details

## Fixing PENDING Status

### Solution 1: Complete Payment Properly

1. Open `redirectUrl` in browser
2. **Select "Card" payment method**
3. Enter test card details
4. Complete payment
5. Status will update automatically

### Solution 2: Check PhonePe Dashboard

1. Login to PhonePe Merchant Dashboard
2. Check payment status there
3. Verify payment was actually completed
4. Check for any errors

### Solution 3: Use Status Check API

After completing payment:

```bash
GET /api/payment/status/YOUR_MERCHANT_TRANSACTION_ID
```

This will:
- Query PhonePe for latest status
- Update database automatically
- Return updated status

## PhonePe Sandbox Test Cards

**Important:** Check PhonePe documentation for official test cards for your sandbox environment.

Common test card patterns:
- **Success:** Cards ending in even numbers (e.g., ...2346)
- **Declined:** Cards ending in specific numbers (e.g., ...0002)
- **3D Secure:** Some cards trigger 3D Secure flow

## Payment Flow Diagram

```
1. Initiate Payment → Get redirectUrl
2. Open redirectUrl → PhonePe Payment Page
3. Select "Card" → Enter Card Details
4. Complete Payment → PhonePe Processes
5. Callback Received → Status = SUCCESS
```

## Troubleshooting

### Issue: Payment Always PENDING

**Check:**
1. Did you open redirectUrl in browser?
2. Did you select card payment method?
3. Did you enter card details?
4. Did you complete payment?
5. Check PhonePe dashboard for actual status

### Issue: Card Payment Not Available

**Possible Causes:**
1. Card payment not enabled in PhonePe dashboard
2. Sandbox environment limitations
3. Payment amount too low/high

**Solution:**
- Check PhonePe merchant dashboard settings
- Enable card payment method
- Verify sandbox configuration

### Issue: Test Card Declined

**Solution:**
- Try different test card numbers
- Check PhonePe documentation for valid test cards
- Verify card details are correct
- Check expiry date is in future

## Important Notes

1. **Payment Method Selection:**
   - User selects payment method on PhonePe page
   - Cannot force card payment programmatically
   - User must choose "Card" option

2. **Test Cards:**
   - Use PhonePe official test cards
   - Check PhonePe documentation
   - Sandbox cards may differ from production

3. **Status Updates:**
   - Status updates automatically after payment
   - Via callback/webhook
   - Or via status check API

4. **Sandbox vs Production:**
   - Sandbox: Use test cards
   - Production: Use real cards
   - Test cards won't work in production

## Quick Checklist

- [ ] Initiate payment
- [ ] Open redirectUrl in browser
- [ ] Select "Card" payment method
- [ ] Enter test card details
- [ ] Complete payment
- [ ] Check status (should be SUCCESS)
- [ ] Verify in PhonePe dashboard

## Summary

✅ **To use card payment:**
1. Initiate payment (gets redirectUrl)
2. Open redirectUrl in browser
3. Select "Card" on PhonePe page
4. Enter test card details
5. Complete payment
6. Status updates to SUCCESS automatically

❌ **Cannot:**
- Force card payment programmatically
- Skip user selection
- Auto-complete payment

The payment method is **always selected by the user** on the PhonePe payment page!

