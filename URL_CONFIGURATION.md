# URL Configuration Guide (No Frontend)

## Understanding the URLs

### redirectUrl
**Purpose:** Where user is redirected AFTER completing payment  
**What it does:** Shows success/failure message to user  
**For testing:** Simple HTML page (already created at `/payment/success`)

### callbackUrl
**Purpose:** Webhook endpoint that PhonePe calls automatically  
**What it does:** Updates payment status in database  
**For testing:** Must be publicly accessible (use ngrok)

## Current Configuration

```javascript
redirectUrl: `${baseUrl}/payment/success`        // Simple success page
callbackUrl: `${baseUrl}/api/payment/callback`    // Webhook endpoint
```

## Setup Options

### Option 1: Local Testing (Basic)

**For redirectUrl only (no callbacks):**
```env
FRONTEND_URL=http://localhost:3000
```

**What works:**
- ✅ Payment initiation
- ✅ User can complete payment
- ✅ User sees success page
- ❌ Callbacks won't work (PhonePe can't reach localhost)

**Use this when:**
- Just testing payment flow
- Don't need automatic status updates
- Will check status manually

### Option 2: Local Testing with ngrok (Recommended)

**For full functionality (with callbacks):**

1. **Start ngrok:**
   ```bash
   ngrok http 3000
   ```

2. **Copy ngrok HTTPS URL:**
   ```
   https://abc123.ngrok-free.app
   ```

3. **Update .env:**
   ```env
   FRONTEND_URL=https://abc123.ngrok-free.app
   ```

4. **Restart server:**
   ```bash
   npm run dev
   ```

**What works:**
- ✅ Payment initiation
- ✅ User can complete payment
- ✅ User sees success page
- ✅ Callbacks work automatically
- ✅ Status updates automatically

**Use this when:**
- Need automatic status updates
- Testing complete payment flow
- Want callbacks to work

### Option 3: Production/Deployed Server

**When you deploy to a server:**

```env
FRONTEND_URL=https://your-domain.com
```

**What works:**
- ✅ Everything works automatically
- ✅ Callbacks work
- ✅ Status updates automatically

## URL Breakdown

### redirectUrl: `/payment/success`

**What it is:**
- Simple HTML success page
- Shows payment completion message
- Displays transaction ID
- Already created in `server.js`

**When it's called:**
- After user completes payment on PhonePe
- PhonePe redirects user to this URL
- User sees success message

**For testing:**
- Works with `localhost` (user sees it in browser)
- No special setup needed

### callbackUrl: `/api/payment/callback`

**What it is:**
- API endpoint that receives webhook from PhonePe
- Updates payment status automatically
- Must be publicly accessible

**When it's called:**
- Automatically by PhonePe after payment
- PhonePe sends payment status
- Updates database automatically

**For testing:**
- ❌ Won't work with `localhost` (PhonePe can't reach it)
- ✅ Use ngrok to make it accessible
- ✅ Or deploy to a server

## Quick Setup for Testing

### Step 1: Basic Setup (No Callbacks)

```env
FRONTEND_URL=http://localhost:3000
```

**Flow:**
1. Initiate payment → Get redirectUrl
2. Open redirectUrl → Complete payment
3. See success page
4. **Manually check status** via API

### Step 2: Full Setup (With Callbacks)

```bash
# Terminal 1: Start ngrok
ngrok http 3000

# Terminal 2: Update .env
FRONTEND_URL=https://your-ngrok-url.ngrok-free.app

# Terminal 3: Start server
npm run dev
```

**Flow:**
1. Initiate payment → Get redirectUrl
2. Open redirectUrl → Complete payment
3. See success page
4. **Status updates automatically** via callback

## Testing Checklist

### Without Frontend (Current Setup):

- [x] ✅ Success page created at `/payment/success`
- [x] ✅ Callback endpoint at `/api/payment/callback`
- [ ] ⚠️ Need ngrok for callbacks (if you want automatic updates)
- [ ] ✅ Can test payment flow without ngrok (manual status check)

### What You Can Test:

**Without ngrok:**
- ✅ Initiate payment
- ✅ Complete payment on PhonePe
- ✅ See success page
- ✅ Check status manually

**With ngrok:**
- ✅ Everything above
- ✅ Automatic status updates
- ✅ Callback webhooks work

## Example .env Configurations

### Local Testing (No Callbacks):
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/phonepe_payments
PHONEPE_CLIENT_ID=YOUR_CLIENT_ID
PHONEPE_CLIENT_SECRET=YOUR_CLIENT_SECRET
PHONEPE_CLIENT_VERSION=1
PHONEPE_ENVIRONMENT=SANDBOX
FRONTEND_URL=http://localhost:3000
```

### Local Testing (With Callbacks):
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/phonepe_payments
PHONEPE_CLIENT_ID=YOUR_CLIENT_ID
PHONEPE_CLIENT_SECRET=YOUR_CLIENT_SECRET
PHONEPE_CLIENT_VERSION=1
PHONEPE_ENVIRONMENT=SANDBOX
FRONTEND_URL=https://abc123.ngrok-free.app
```

### Production:
```env
PORT=3000
MONGODB_URI=mongodb://your-mongodb-uri
PHONEPE_CLIENT_ID=YOUR_CLIENT_ID
PHONEPE_CLIENT_SECRET=YOUR_CLIENT_SECRET
PHONEPE_CLIENT_VERSION=1
PHONEPE_ENVIRONMENT=PRODUCTION
FRONTEND_URL=https://your-domain.com
```

## Summary

**For testing without frontend:**

1. **redirectUrl:** Already set up at `/payment/success` ✅
   - Simple HTML page
   - Shows success message
   - Works with localhost

2. **callbackUrl:** Set up at `/api/payment/callback` ✅
   - Webhook endpoint
   - Needs ngrok for local testing
   - Or deploy to server

3. **Configuration:**
   - Basic: `FRONTEND_URL=http://localhost:3000` (no callbacks)
   - Full: `FRONTEND_URL=https://ngrok-url` (with callbacks)

**You're all set!** The success page is already created, so you can test payments without a frontend.

