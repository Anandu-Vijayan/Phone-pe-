# Ngrok Setup Guide

## What is Ngrok?

Ngrok creates a secure tunnel from a public URL to your local server, allowing PhonePe to send callbacks to your local development environment.

## Step 1: Install Ngrok

### Option A: Using npm (Recommended)
```bash
npm install -g ngrok
```

### Option B: Download from website
1. Visit: https://ngrok.com/download
2. Download for your OS (Linux/Mac/Windows)
3. Extract and add to PATH, or use directly

### Option C: Using package manager

**Ubuntu/Debian:**
```bash
sudo snap install ngrok
```

**Mac (using Homebrew):**
```bash
brew install ngrok
```

## Step 2: Start Your Node.js Server

Make sure your server is running on port 3000:
```bash
npm run dev
# or
npm start
```

You should see: `Server is running on port 3000`

## Step 3: Start Ngrok

Open a **new terminal window** and run:
```bash
ngrok http 3000
```

You'll see output like:
```
ngrok                                                                              
                                                                                   
Session Status                online                                               
Account                       Your Account (Plan: Free)                            
Version                       3.x.x                                                
Region                        United States (us)                                   
Latency                       -                                                    
Web Interface                 http://127.0.0.1:4040                                
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:3000
                                                                                   
Connections                   ttl     opn     rt1     rt5     p50     p90           
                              0       0       0.00    0.00    0.00    0.00         
```

## Step 4: Copy the Ngrok URL

Copy the **HTTPS URL** (the one that looks like `https://abc123.ngrok-free.app`)

**Important:** Use the **HTTPS** URL, not HTTP!

## Step 5: Update Your .env File

Update your `.env` file with the ngrok URL:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/phonepe_payments
PHONEPE_CLIENT_ID=M23PEWICDBGTQ_2511171603
PHONEPE_CLIENT_SECRET=ZmI5Yjg4ODYtM2E5OC00ODczLWJlNzEtNzFiYzUxOTgxNzBk
PHONEPE_CLIENT_VERSION=1
PHONEPE_ENVIRONMENT=SANDBOX
FRONTEND_URL=https://abc123.ngrok-free.app
```

Replace `https://abc123.ngrok-free.app` with your actual ngrok URL.

## Step 6: Restart Your Server

After updating `.env`, restart your Node.js server:
```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

## Step 7: Test the Setup

1. **Check ngrok is forwarding:**
   - Visit: http://127.0.0.1:4040 (ngrok web interface)
   - You can see all requests being forwarded

2. **Test your API:**
   ```bash
   curl https://abc123.ngrok-free.app/
   ```
   Should return your API info

3. **Test payment initiation:**
   ```bash
   curl -X POST https://abc123.ngrok-free.app/api/payment/initiate \
     -H "Content-Type: application/json" \
     -d '{
       "amount": 100,
       "userId": "USER123",
       "phoneNumber": "9999999999"
     }'
   ```

## Important Notes

### Free Plan Limitations:
- **URL changes every time** you restart ngrok
- You'll need to update `.env` each time
- Limited connections per minute

### Paid Plan Benefits:
- **Static domain** (doesn't change)
- More connections
- Better performance

### Ngrok Web Interface:
- Visit: http://127.0.0.1:4040
- See all incoming requests
- Inspect request/response data
- Useful for debugging callbacks

## Troubleshooting

### Ngrok not found:
```bash
# Check if installed
which ngrok

# If not found, install using npm
npm install -g ngrok
```

### Port already in use:
```bash
# Check what's using port 3000
lsof -i :3000

# Kill the process or use different port
```

### Ngrok URL not working:
1. Make sure your Node.js server is running
2. Check ngrok is forwarding to correct port
3. Verify the URL in ngrok output

### Callback not received:
1. Verify ngrok URL is accessible from internet
2. Check PhonePe dashboard callback URL configuration
3. Check server logs for incoming requests
4. Use ngrok web interface (http://127.0.0.1:4040) to see requests

## Alternative: Use a Static Domain (Paid)

If you need a permanent URL:
1. Sign up for ngrok paid plan
2. Configure static domain
3. Update `.env` once
4. No need to update URL each time

## Quick Reference

```bash
# Start ngrok
ngrok http 3000

# Start server
npm run dev

# Check ngrok status
# Visit: http://127.0.0.1:4040

# Update .env with ngrok URL
FRONTEND_URL=https://your-ngrok-url.ngrok-free.app
```

