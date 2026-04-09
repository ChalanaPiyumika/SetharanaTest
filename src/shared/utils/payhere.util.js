const crypto = require('crypto');
const env = require('../config/env');

/**
 * PayHere Utility
 * Handles PayHere payment gateway integration
 */

/**
 * Generate MD5 hash for PayHere payment
 * @param {string} orderId - Order/Appointment ID
 * @param {string} amount - Payment amount (format: "5000.00")
 * @param {string} currency - Currency code (default: "LKR")
 * @returns {string} Generated hash
 */
const generateHash = (orderId, amount, currency = 'LKR') => {
    const merchantId = env.PAYHERE_MERCHANT_ID;
    const merchantSecret = env.PAYHERE_MERCHANT_SECRET;

    // Step 1: Hash the merchant secret
    const hashedSecret = crypto
        .createHash('md5')
        .update(merchantSecret)
        .digest('hex')
        .toUpperCase();

    // Step 2: Generate payment hash
    const hash = crypto
        .createHash('md5')
        .update(`${merchantId}${orderId}${amount}${currency}${hashedSecret}`)
        .digest('hex')
        .toUpperCase();

    return hash;
};

/**
 * Verify hash received from PayHere webhook
 * @param {string} receivedHash - Hash from PayHere
 * @param {string} orderId - Order/Appointment ID
 * @param {string} amount - Payment amount
 * @param {string} statusCode - Payment status code
 * @returns {boolean} True if hash is valid
 */
const verifyHash = (receivedHash, orderId, amount, statusCode) => {
    const merchantId = env.PAYHERE_MERCHANT_ID;
    const merchantSecret = env.PAYHERE_MERCHANT_SECRET;

    // Step 1: Hash the merchant secret
    const hashedSecret = crypto
        .createHash('md5')
        .update(merchantSecret)
        .digest('hex')
        .toUpperCase();

    // Step 2: Generate expected hash
    const expectedHash = crypto
        .createHash('md5')
        .update(`${merchantId}${orderId}${amount}${statusCode}${hashedSecret}`)
        .digest('hex')
        .toUpperCase();

    return receivedHash === expectedHash;
};

/**
 * Generate PayHere payment form data
 * @param {object} appointmentData - Appointment details
 * @returns {object} PayHere form data
 */
const generatePaymentData = (appointmentData) => {
    const { publicId, amount, patientName, patientEmail, patientPhone } = appointmentData;

    const formattedAmount = parseFloat(amount).toFixed(2);
    const currency = 'LKR';
    const hash = generateHash(publicId, formattedAmount, currency);

    return {
        merchant_id: env.PAYHERE_MERCHANT_ID,
        return_url: env.PAYHERE_RETURN_URL,
        cancel_url: env.PAYHERE_CANCEL_URL,
        notify_url: env.PAYHERE_NOTIFY_URL,
        order_id: publicId,
        items: 'Medical Consultation',
        currency: currency,
        amount: formattedAmount,
        first_name: patientName.split(' ')[0] || 'Patient',
        last_name: patientName.split(' ').slice(1).join(' ') || '',
        email: patientEmail,
        phone: patientPhone || '',
        address: '',
        city: 'Colombo',
        country: 'Sri Lanka',
        hash: hash
    };
};

/**
 * Get PayHere base URL based on sandbox setting
 * @returns {string} Base URL
 */
const getBaseUrl = () => {
    return env.PAYHERE_SANDBOX
        ? 'https://sandbox.payhere.lk'
        : 'https://www.payhere.lk';
};

/**
 * Get PayHere OAuth access token for API calls (refund, etc.)
 * Requires PAYHERE_APP_ID and PAYHERE_APP_SECRET from Settings > API Keys
 * @returns {Promise<string>} Access token
 */
const getAccessToken = async () => {
    const appId = env.PAYHERE_APP_ID;
    const appSecret = env.PAYHERE_APP_SECRET;

    if (!appId || !appSecret) {
        throw new Error('PayHere API credentials (PAYHERE_APP_ID, PAYHERE_APP_SECRET) are not configured');
    }

    const authCode = Buffer.from(`${appId}:${appSecret}`).toString('base64');
    const baseUrl = getBaseUrl();

    const response = await fetch(`${baseUrl}/merchant/v1/oauth/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${authCode}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`PayHere OAuth token request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.access_token;
};

/**
 * Request a refund from PayHere for a specific payment
 * @param {string} paymentId - The PayHere payment_id (gateway reference)
 * @param {string} description - Reason for refund
 * @returns {Promise<object>} Refund result from PayHere
 */
const requestRefund = async (paymentId, description = 'Appointment cancelled by user') => {
    const accessToken = await getAccessToken();
    const baseUrl = getBaseUrl();

    console.log(`[PayHere Refund] Requesting refund for payment: ${paymentId}`);

    const response = await fetch(`${baseUrl}/merchant/v1/payment/refund`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            payment_id: paymentId,
            description: description
        })
    });

    const result = await response.json();

    if (!response.ok || result.status !== 1) {
        console.error('[PayHere Refund] Failed:', result);
        throw new Error(`PayHere refund failed: ${result.msg || result.message || 'Unknown error'}`);
    }

    console.log(`[PayHere Refund] Success for payment: ${paymentId}`, result);
    return result;
};

module.exports = {
    generateHash,
    verifyHash,
    generatePaymentData,
    requestRefund
};
