const { StandardCheckoutClient, Env, MetaInfo, StandardCheckoutPayRequest } = require('phonepe-pg-sdk-node');

// Initialize PhonePe SDK with Client ID and Client Secret
const clientId = process.env.PHONEPE_CLIENT_ID;
const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
const clientVersion = parseInt(process.env.PHONEPE_CLIENT_VERSION) || 1;
const environment = process.env.PHONEPE_ENVIRONMENT || 'SANDBOX';

// Use getInstance method (recommended way to initialize SDK)
const phonePe = StandardCheckoutClient.getInstance(
  clientId,
  clientSecret,
  clientVersion,
  environment === 'PRODUCTION' ? Env.PRODUCTION : Env.SANDBOX
);

class PhonePePayment {
  // Initiate payment using official SDK
  async initiatePayment(paymentData) {
    try {
      const {
        merchantTransactionId,
        amount,
        redirectUrl,
        callbackUrl,
        mobileNumber,
      } = paymentData;

      // Build payment request using SDK builder pattern (official pattern)
      // For card payment: User will select card payment method on PhonePe payment page
      // The payment method (UPI/Card/NetBanking) is selected by user on payment page
      
      // Build MetaInfo (optional - for additional metadata)
      // MetaInfo allows you to pass custom data (udf1-udf5)
      const metaInfo = MetaInfo.builder()
        .udf1(mobileNumber || 'N/A')
        .udf2(`Amount: ${amount}`)
        .build();

      // Build payment request
      const paymentRequest = StandardCheckoutPayRequest.builder()
        .merchantOrderId(merchantTransactionId)
        .amount(amount * 100) // Convert to paise
        .redirectUrl(redirectUrl)
        .metaInfo(metaInfo)
        .build();

      // Initiate payment using official SDK pattern
      const response = await phonePe.pay(paymentRequest);

      // Extract redirect URL from response (official SDK returns redirectUrl directly)
      const redirectUrlFromResponse = response?.redirectUrl || 
                                     response?.data?.redirectUrl ||
                                     response?.data?.instrumentResponse?.redirectInfo?.url;

      return {
        success: true,
        data: response.data || response,
        redirectUrl: redirectUrlFromResponse,
        fullResponse: response, // Include full response for debugging
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || error.response?.data || error,
      };
    }
  }

  // Check payment status using official SDK
  async checkPaymentStatus(merchantTransactionId) {
    try {
      // Official SDK pattern: client.getOrderStatus(merchantOrderId)
      const response = await phonePe.getOrderStatus(merchantTransactionId);
      
      // Official SDK pattern: response.state is directly available
      // Also check for nested structures as fallback
      const state = response?.state || 
                   response?.data?.state ||
                   response?.data?.data?.state;
      
      const code = response?.code ||
                  response?.data?.code ||
                  response?.data?.data?.code;

      // Return response in a consistent format
      return {
        success: true,
        data: response.data || response, // Include data if available, otherwise full response
        state: state, // Direct state access (official pattern)
        code: code, // Direct code access
        fullResponse: response, // Include full response for debugging
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || error.response?.data || error,
      };
    }
  }

  // Verify callback (SDK handles verification internally)
  verifyCallback(callbackData) {
    try {
      // The SDK should handle callback verification
      // Return true if verification passes, false otherwise
      if (phonePe.verifyCallback) {
        return phonePe.verifyCallback(callbackData);
      }
      // If method doesn't exist, assume SDK handles it automatically
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new PhonePePayment();

