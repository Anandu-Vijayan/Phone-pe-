const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const phonepe = require('../utils/phonepe');
const crypto = require('crypto');

// Initiate Payment
router.post('/initiate', async (req, res) => {
  try {
    const { amount, userId, phoneNumber } = req.body;

    // Validate input
    if (!amount || !userId || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Amount, userId, and phoneNumber are required',
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0',
      });
    }

    // Generate unique merchant transaction ID
    const merchantTransactionId = `TXN${Date.now()}${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Create payment record in database
    const payment = new Payment({
      merchantTransactionId,
      amount,
      userId,
      phoneNumber,
      status: 'PENDING', // Start as PENDING, will update to SUCCESS after payment completion
    });

    await payment.save();

    // Prepare payment data for PhonePe
    // URL Configuration for testing without frontend:
    // - redirectUrl: Where user is redirected after payment (simple success page)
    // - callbackUrl: Webhook endpoint that PhonePe calls (must be publicly accessible)
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    // Include merchantTransactionId in the redirect URL so the frontend
    // can show/check the transaction after redirect.
    const redirectUrl = `${baseUrl}/payment/success?merchantTransactionId=${merchantTransactionId}`;

    const paymentData = {
      merchantTransactionId,
      amount,
      // redirectUrl: Simple success page (no frontend needed)
      // User sees success message after payment completion
      redirectUrl,
      // callbackUrl: Webhook endpoint (PhonePe calls this automatically)
      // For local testing: Use ngrok to make this accessible
      // Example: ngrok http 3000, then set FRONTEND_URL=https://your-ngrok-url.ngrok-free.app
      callbackUrl: `${baseUrl}/api/payment/callback`,
      mobileNumber: phoneNumber,
    };

    // Initiate payment with PhonePe
    const phonepeResponse = await phonepe.initiatePayment(paymentData);

    if (!phonepeResponse.success) {
      payment.status = 'FAILED';
      payment.phonepeResponse = phonepeResponse.error;
      await payment.save();

      return res.status(500).json({
        success: false,
        message: 'Payment initiation failed',
        error: phonepeResponse.error,
      });
    }

    // Update payment with PhonePe response. If PhonePe returns a redirectUrl
    // use that, otherwise fall back to the one we generated above.
    payment.phonepeResponse = phonepeResponse.data;
    payment.redirectUrl = phonepeResponse.redirectUrl || redirectUrl;
    await payment.save();

    res.json({
      success: true,
      message: 'Payment initiated successfully',
      data: {
        merchantTransactionId: payment.merchantTransactionId,
        redirectUrl: payment.redirectUrl,
        amount: payment.amount,
        status: payment.status,
      },
      instructions: {
        step1: 'Copy the redirectUrl from above',
        step2: 'Open redirectUrl in a browser (not Postman!)',
        step3: 'Complete payment on PhonePe page',
        step4: 'Select payment method (Card/UPI/etc.)',
        step5: 'Enter payment details and confirm',
        step6: 'Status will update to SUCCESS automatically',
        note: 'Payment must be completed in browser, not Postman'
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// Payment Callback (Webhook from PhonePe)
router.post('/callback', async (req, res) => {
  try {
    const { response } = req.body;

    if (!response) {
      return res.status(400).json({
        success: false,
        message: 'Response data is required',
      });
    }

    // Decode base64 response
    const decodedResponse = JSON.parse(Buffer.from(response, 'base64').toString('utf-8'));

    // Handle both merchantTransactionId and merchantOrderId (SDK uses merchantOrderId)
    const merchantTransactionId = decodedResponse.merchantTransactionId || decodedResponse.merchantOrderId;
    const transactionId = decodedResponse.transactionId;
    const code = decodedResponse.code;
    const state = decodedResponse.state;
    const responseCode = decodedResponse.responseCode;
    const message = decodedResponse.message;

    // Find payment in database
    const payment = await Payment.findOne({ merchantTransactionId });

    if (!payment) {
      // Still return success to PhonePe to acknowledge receipt
      return res.json({
        success: true,
        message: 'Callback received',
      });
    }

    // Verify callback using SDK (if available)
    const isValid = phonepe.verifyCallback(decodedResponse);

    // Comprehensive status detection from callback - check all possible success indicators
    const isSuccess = 
      (code === 'PAYMENT_SUCCESS' && (state === 'COMPLETED' || state === 'SUCCESS')) ||
      code === 'SUCCESS' ||
      code === 'PAYMENT_COMPLETED' ||
      state === 'COMPLETED' ||
      state === 'SUCCESS' ||
      (decodedResponse.success === true && (state === 'COMPLETED' || code === 'PAYMENT_SUCCESS'));
    
    const isFailed = 
      code === 'PAYMENT_ERROR' || 
      code === 'PAYMENT_DECLINED' || 
      code === 'ERROR' ||
      state === 'FAILED' ||
      (decodedResponse.success === false && code !== 'PAYMENT_CANCELLED');
    
    const isCancelled = 
      code === 'PAYMENT_CANCELLED' || 
      state === 'CANCELLED';
    
    // Update payment status based on comprehensive detection
    if (isSuccess) {
      payment.status = 'SUCCESS';
    } else if (isFailed) {
      payment.status = 'FAILED';
    } else if (isCancelled) {
      payment.status = 'CANCELLED';
    }

    payment.phonepeTransactionId = transactionId;
    payment.callbackData = decodedResponse;
    await payment.save();

    // Return success response to PhonePe
    res.json({
      success: true,
      message: 'Callback processed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// Check Payment Status
router.get('/status/:merchantTransactionId', async (req, res) => {
  try {
    const { merchantTransactionId } = req.params;

    // Find payment in database
    const payment = await Payment.findOne({ merchantTransactionId });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    // Check status with PhonePe
    const statusResponse = await phonepe.checkPaymentStatus(merchantTransactionId);

    if (statusResponse.success) {
      // Official SDK pattern: response.state is directly available
      // Use direct state/code from response (official pattern)
      const state = statusResponse.state || 
                   statusResponse.data?.state ||
                   statusResponse.fullResponse?.state;
      
      const code = statusResponse.code ||
                  statusResponse.data?.code ||
                  statusResponse.fullResponse?.code;
      
      // Also check nested structures as fallback
      const fullResponse = statusResponse.fullResponse || statusResponse.data;
      const phonepeData = statusResponse.data?.data || 
                         statusResponse.data || 
                         statusResponse.fullResponse?.data ||
                         fullResponse;
      
      // Update payment status if changed
      if (phonepeData || fullResponse || state || code) {
        // Use direct state/code (official pattern) or fallback to nested
        const finalState = state || 
                          phonepeData?.state || 
                          phonepeData?.data?.state ||
                          fullResponse?.state ||
                          fullResponse?.data?.state ||
                          phonepeData?.status || 
                          fullResponse?.status;
        
        const finalCode = code ||
                         phonepeData?.code || 
                         phonepeData?.data?.code ||
                         fullResponse?.code ||
                         fullResponse?.data?.code;
        
        const transactionId = phonepeData?.transactionId || 
                             phonepeData?.data?.transactionId ||
                             fullResponse?.transactionId ||
                             fullResponse?.data?.transactionId ||
                             phonepeData?.merchantTransactionId;
        
        // Check payment details if available
        const paymentDetail = phonepeData?.paymentDetail || 
                             phonepeData?.data?.paymentDetail ||
                             fullResponse?.paymentDetail ||
                             fullResponse?.data?.paymentDetail;
        
        const paymentState = paymentDetail?.state || paymentDetail?.status;
        const paymentCode = paymentDetail?.code;
        
        // Use payment detail if available, otherwise use direct state/code from above
        const finalStateWithPaymentDetail = paymentState || finalState;
        const finalCodeWithPaymentDetail = paymentCode || finalCode;
        
        // Comprehensive status detection - check all possible indicators of success
        // Use finalStateWithPaymentDetail and finalCodeWithPaymentDetail (includes payment detail if available)
        let statusChanged = false;
        const isSuccess = 
          finalStateWithPaymentDetail === 'COMPLETED' || 
          finalStateWithPaymentDetail === 'SUCCESS' || 
          finalStateWithPaymentDetail === 'PAYMENT_SUCCESS' ||
          finalCodeWithPaymentDetail === 'PAYMENT_SUCCESS' || 
          finalCodeWithPaymentDetail === 'SUCCESS' ||
          finalCodeWithPaymentDetail === 'PAYMENT_COMPLETED' ||
          (paymentDetail && (paymentDetail.state === 'COMPLETED' || paymentDetail.status === 'SUCCESS')) ||
          (paymentDetail && paymentDetail.code === 'PAYMENT_SUCCESS');
        
        const isFailed = 
          finalStateWithPaymentDetail === 'FAILED' || 
          finalCodeWithPaymentDetail === 'PAYMENT_ERROR' || 
          finalCodeWithPaymentDetail === 'PAYMENT_DECLINED' || 
          finalCodeWithPaymentDetail === 'ERROR' ||
          (paymentDetail && (paymentDetail.state === 'FAILED' || paymentDetail.status === 'FAILED')) ||
          (paymentDetail && (paymentDetail.code === 'PAYMENT_ERROR' || paymentDetail.code === 'PAYMENT_DECLINED'));
        
        const isCancelled = 
          finalCodeWithPaymentDetail === 'PAYMENT_CANCELLED' || 
          finalStateWithPaymentDetail === 'CANCELLED' ||
          (paymentDetail && paymentDetail.code === 'PAYMENT_CANCELLED') ||
          (paymentDetail && paymentDetail.state === 'CANCELLED');
        
        // Update status based on comprehensive detection
        if (isSuccess) {
          if (payment.status !== 'SUCCESS') {
            payment.status = 'SUCCESS';
            statusChanged = true;
          }
        } else if (isFailed) {
          if (payment.status !== 'FAILED') {
            payment.status = 'FAILED';
            statusChanged = true;
          }
        } else if (isCancelled) {
          if (payment.status !== 'CANCELLED') {
            payment.status = 'CANCELLED';
            statusChanged = true;
          }
        }
        
        // Update transaction ID and response data
        if (transactionId && transactionId !== payment.phonepeTransactionId) {
          payment.phonepeTransactionId = transactionId;
          statusChanged = true;
        }
        
        // Store the full response for debugging
        payment.phonepeResponse = phonepeData || fullResponse;
        payment.callbackData = phonepeData || fullResponse;
        
        // Only save if something changed
        if (statusChanged) {
          await payment.save();
        }
      }
    }

    res.json({
      success: true,
      data: {
        merchantTransactionId: payment.merchantTransactionId,
        amount: payment.amount,
        status: payment.status,
        phonepeTransactionId: payment.phonepeTransactionId,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        phonepeData: statusResponse.success ? statusResponse.data : null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// Get All Payments
router.get('/all', async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// Get Payment by ID
router.get('/:merchantTransactionId', async (req, res) => {
  try {
    const { merchantTransactionId } = req.params;
    const payment = await Payment.findOne({ merchantTransactionId });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

module.exports = router;

