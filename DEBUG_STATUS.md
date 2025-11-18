# Debugging Payment Status Updates

## Issue: Status Not Changing When Calling Status API

I've added extensive logging to help debug why the status might not be updating.

## What I Fixed

1. **Enhanced Logging**: Added detailed console logs to see:
   - Full PhonePe API response
   - Extracted data structure
   - Status comparison logic
   - Whether status actually changed

2. **Better Response Handling**: Now handles multiple possible response structures from PhonePe SDK

3. **Status Comparison**: Only updates if status actually changed (prevents unnecessary saves)

## How to Debug

### Step 1: Check Server Logs

When you call the status API, check your server console. You should see logs like:

```
Status Check Response: { ... }
PhonePe Status Response: { ... }
PhonePe Data extracted: { ... }
Payment TXN123 - State: COMPLETED, Code: PAYMENT_SUCCESS
✓ Payment TXN123 marked as SUCCESS
✓ Payment TXN123 saved to database
```

### Step 2: Test the Status API

```bash
# Replace TXN123 with your actual merchantTransactionId
curl http://localhost:3000/api/payment/status/TXN123
```

### Step 3: Check What's Being Returned

Look at the server logs to see:
1. What PhonePe is returning
2. What data is being extracted
3. What state/code values are present
4. Why status might not be updating

## Common Issues

### Issue 1: Response Structure Different

**Symptom**: Logs show data but status doesn't update

**Solution**: Check the logs to see the actual field names. The code now tries multiple field names:
- `state` or `status`
- `code`
- `transactionId`

### Issue 2: Status Already Matches

**Symptom**: Logs show "No changes to save"

**Solution**: The payment status in database already matches PhonePe status. This is normal if you've already checked the status.

### Issue 3: PhonePe Returns Different Status Values

**Symptom**: Logs show state/code but they don't match our conditions

**Solution**: Check the logs to see what values PhonePe is actually returning, then we can update the conditions.

### Issue 4: API Error

**Symptom**: Logs show "Failed to check status"

**Solution**: 
- Check PhonePe credentials in `.env`
- Verify the merchantTransactionId exists
- Check if payment was actually initiated

## What to Look For in Logs

1. **"PhonePe Status Response"** - Full response from PhonePe SDK
2. **"PhonePe Data extracted"** - What data we extracted from response
3. **"Payment TXN123 - State: X, Code: Y"** - The actual status values
4. **"✓ Payment marked as SUCCESS"** - Status was updated
5. **"ℹ Payment status unchanged"** - Status didn't change (might already be correct)
6. **"⚠ No data received"** - PhonePe didn't return data

## Testing Steps

1. **Initiate a payment:**
   ```bash
   curl -X POST http://localhost:3000/api/payment/initiate \
     -H "Content-Type: application/json" \
     -d '{"amount": 100, "userId": "USER123", "phoneNumber": "9999999999"}'
   ```

2. **Note the merchantTransactionId from response**

3. **Check status:**
   ```bash
   curl http://localhost:3000/api/payment/status/YOUR_MERCHANT_TRANSACTION_ID
   ```

4. **Check server logs** to see what's happening

5. **Check database:**
   ```bash
   curl http://localhost:3000/api/payment/YOUR_MERCHANT_TRANSACTION_ID
   ```

## Expected Behavior

- **First call**: Status should update from PENDING to SUCCESS/FAILED/CANCELLED
- **Subsequent calls**: Status should remain the same (no changes to save)

## If Status Still Doesn't Update

1. **Share the server logs** - Copy the console output when you call the status API
2. **Share the API response** - What the status API returns
3. **Check PhonePe Dashboard** - Verify the payment status there

The enhanced logging will help us identify exactly what's happening!

