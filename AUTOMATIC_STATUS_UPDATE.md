# Automatic Payment Status Update

## How Status Automatically Changes to SUCCESS

The payment status **automatically** changes from `PENDING` to `SUCCESS` **only when the bank actually receives the money**. This happens in two ways:

## 1. Automatic Callback/Webhook (Primary Method)

**When:** PhonePe automatically sends a webhook to your server **after the bank confirms payment**.

**How it works:**
1. User completes payment on PhonePe
2. Bank processes and confirms the payment
3. PhonePe sends callback to: `POST /api/payment/callback`
4. Status **automatically** updates to `SUCCESS` in database
5. No manual intervention needed!

**Callback URL Setup:**
- Must be publicly accessible (not localhost)
- Use ngrok for local testing: `ngrok http 3000`
- Update `FRONTEND_URL` in `.env` with ngrok URL
- Callback URL: `https://your-ngrok-url.ngrok-free.app/api/payment/callback`

**Status Detection:**
The system automatically detects payment completion by checking:
- `code === 'PAYMENT_SUCCESS'` AND `state === 'COMPLETED'`
- `code === 'SUCCESS'`
- `state === 'COMPLETED'` or `state === 'SUCCESS'`
- Any combination indicating successful payment

## 2. Status Check API (Secondary Method)

**When:** You call the status API, it queries PhonePe and updates automatically.

**How it works:**
1. Call: `GET /api/payment/status/:merchantTransactionId`
2. System queries PhonePe API for latest status
3. If PhonePe reports payment as completed, status **automatically** updates
4. Returns updated status

**Usage:**
```bash
GET /api/payment/status/YOUR_MERCHANT_TRANSACTION_ID
```

**Comprehensive Detection:**
The system checks multiple indicators:
- Payment state: `COMPLETED`, `SUCCESS`
- Payment code: `PAYMENT_SUCCESS`, `SUCCESS`, `PAYMENT_COMPLETED`
- Payment detail objects
- Multiple nested response structures

## Important Points

### ✅ Automatic Updates Only
- Status changes **automatically** when bank confirms payment
- No manual intervention required
- Based on actual payment confirmation from PhonePe

### ✅ Real Payment Confirmation
- Status only changes to `SUCCESS` when:
  - Bank has received the money
  - PhonePe confirms the payment
  - Payment is actually completed

### ✅ Multiple Detection Methods
- Checks callback webhooks from PhonePe
- Checks status API responses
- Handles different response formats
- Comprehensive status detection

## Testing Automatic Updates

### Method 1: Using Callback (Recommended)

1. **Set up ngrok:**
   ```bash
   ngrok http 3000
   ```

2. **Update .env:**
   ```env
   FRONTEND_URL=https://your-ngrok-url.ngrok-free.app
   ```

3. **Initiate payment:**
   ```bash
   POST /api/payment/initiate
   ```

4. **Complete payment on PhonePe**

5. **Status automatically updates** when callback is received

### Method 2: Using Status Check

1. **Initiate payment:**
   ```bash
   POST /api/payment/initiate
   ```

2. **Complete payment on PhonePe**

3. **Check status:**
   ```bash
   GET /api/payment/status/YOUR_MERCHANT_TRANSACTION_ID
   ```

4. **Status automatically updates** if payment is completed

## What Gets Logged

When status automatically updates, you'll see:
```
✓✓✓ Payment TXN123 AUTOMATICALLY marked as SUCCESS (Payment Confirmed)
✓✓✓ Payment TXN123 AUTOMATICALLY saved to database with status: SUCCESS
```

## Troubleshooting

### Status Not Updating Automatically

1. **Check callback URL:**
   - Must be publicly accessible
   - Use ngrok for local testing
   - Verify URL in PhonePe dashboard

2. **Check server logs:**
   - Look for callback received messages
   - Check status check responses
   - Verify PhonePe response structure

3. **Check PhonePe Dashboard:**
   - Verify payment is actually completed
   - Check payment status in PhonePe

4. **Test Status Check:**
   ```bash
   GET /api/payment/status/YOUR_TXN_ID
   ```
   - Check server logs for response
   - Verify status detection logic

### Callback Not Received

1. **Verify ngrok is running:**
   ```bash
   ngrok http 3000
   ```

2. **Check callback URL:**
   - Must be HTTPS (not HTTP)
   - Must be publicly accessible
   - Format: `https://your-url.ngrok-free.app/api/payment/callback`

3. **Check PhonePe Dashboard:**
   - Verify callback URL is configured
   - Check callback logs in PhonePe

## Summary

- ✅ Status updates **automatically** when bank receives money
- ✅ No manual intervention needed
- ✅ Based on actual payment confirmation
- ✅ Works via callbacks and status checks
- ✅ Comprehensive detection handles all response formats

The system is designed to **automatically** detect and update payment status only when the payment is actually confirmed by the bank through PhonePe.

