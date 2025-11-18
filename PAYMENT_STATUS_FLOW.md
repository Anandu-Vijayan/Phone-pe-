# Payment Status Update Flow

## When Payment Status Changes to "SUCCESS" (Completed)

The payment status changes from `PENDING` to `SUCCESS` (completed) in **two ways**:

### 1. Automatic Update via Callback/Webhook (Recommended)

**When:** PhonePe automatically sends a POST request to your callback URL after the user completes the payment.

**How it works:**
1. User completes payment on PhonePe payment page
2. PhonePe sends a webhook to: `POST /api/payment/callback`
3. The callback route automatically updates the payment status in the database
4. Status changes to `SUCCESS` if payment was successful

**Callback URL:** 
- Make sure your callback URL is accessible (not localhost)
- For local testing, use tools like **ngrok** to expose your local server:
  ```bash
  ngrok http 3000
  ```
- Update `FRONTEND_URL` in `.env` with the ngrok URL

**Status Update Conditions:**
- `code === 'PAYMENT_SUCCESS'` AND `state === 'COMPLETED'` → Status = `SUCCESS`
- `code === 'PAYMENT_ERROR'` OR `code === 'PAYMENT_DECLINED'` → Status = `FAILED`
- `code === 'PAYMENT_CANCELLED'` → Status = `CANCELLED`

### 2. Manual Status Check

**When:** You manually check the payment status by calling the status API.

**How it works:**
1. Call: `GET /api/payment/status/:merchantTransactionId`
2. The API checks the current status with PhonePe
3. Updates the database with the latest status
4. Returns the updated status

**Example:**
```bash
GET http://localhost:3000/api/payment/status/TXN1234567890
```

**Status Update Conditions:**
- `state === 'COMPLETED'` OR `code === 'PAYMENT_SUCCESS'` → Status = `SUCCESS`
- `state === 'FAILED'` OR `code === 'PAYMENT_ERROR'` → Status = `FAILED`
- `code === 'PAYMENT_CANCELLED'` → Status = `CANCELLED`

## Payment Status Values

- **PENDING** - Payment initiated, waiting for user action
- **SUCCESS** - Payment completed successfully
- **FAILED** - Payment failed or declined
- **CANCELLED** - Payment was cancelled by user

## Testing Payment Status Updates

### For Local Development:

1. **Using Callback (Recommended):**
   - Use ngrok to expose your local server
   - Configure callback URL in PhonePe dashboard (if available)
   - Or test with actual payment flow

2. **Using Manual Status Check:**
   ```bash
   # After initiating payment, check status
   curl http://localhost:3000/api/payment/status/YOUR_MERCHANT_TRANSACTION_ID
   ```

3. **Check All Payments:**
   ```bash
   curl http://localhost:3000/api/payment/all
   ```

## Important Notes

1. **Callback URL Must Be Accessible:**
   - PhonePe cannot reach `localhost` or `127.0.0.1`
   - Use ngrok, a public IP, or deploy to a server for callbacks to work

2. **Status Check is Real-time:**
   - Manual status check queries PhonePe API directly
   - Always returns the latest status from PhonePe

3. **Database Updates:**
   - Both callback and status check update the MongoDB database
   - Check database logs to see status updates

4. **Logging:**
   - Status changes are logged to console
   - Check server logs to see when status updates occur

## Troubleshooting

**Status not updating to SUCCESS:**
1. Check if callback URL is accessible
2. Verify callback is being received (check server logs)
3. Manually check status using status API
4. Verify PhonePe credentials are correct
5. Check PhonePe dashboard for payment status

**Callback not received:**
1. Ensure callback URL is publicly accessible
2. Check PhonePe dashboard for callback configuration
3. Use ngrok for local testing
4. Verify server is running and route is accessible

