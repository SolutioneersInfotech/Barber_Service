const express = require('express');
const {
    createPayment,
    getPaymentStatus,
    updatePaymentStatus
} = require('../controller/payment_controller');

const router = express.Router();

// Payment routes
router.post('/', createPayment);
router.get('all/:bookingId', getPaymentStatus);
router.put('/status', updatePaymentStatus); // To update payment status

module.exports = router;
