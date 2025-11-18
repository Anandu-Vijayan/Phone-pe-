#!/bin/bash

# Start ngrok in background and save the URL
echo "Starting ngrok on port 3000..."
echo "Press Ctrl+C to stop"
echo ""
echo "After ngrok starts, copy the HTTPS URL and update your .env file:"
echo "FRONTEND_URL=https://your-ngrok-url.ngrok-free.app"
echo ""

ngrok http 3000

