const Booking = require('../models/booking_model'); // Import the Booking model
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Initialize Stripe
const { body, validationResult } = require('express-validator'); // For input validation
const { sendGeneralResponse } = require('../utils/responseHelper');
// Middleware for validating payment input
exports.validatePaymentInput = [
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('currency').isString().withMessage('Currency must be a string'),
    body('paymentMethodId').isString().withMessage('Payment method ID must be a string'),
    body('bookingId').isMongoId().withMessage('Invalid booking ID'),
];

exports.createPayment = async (req, res) => {
    const { amount, currency, paymentMethodId, bookingId } = req.body;

    try {
        // Create a new payment intent with Stripe using automatic payment methods
        const paymentIntent = await stripe.paymentIntents.create({
            amount, // Amount in smallest currency unit (e.g., paise for INR)
            currency,
            payment_method: paymentMethodId,
            automatic_payment_methods: {
                enabled: true, // Enables automatic payment methods
            },
        });

        // Update the booking with payment details
        await Booking.findByIdAndUpdate(bookingId, {
            'payment.amount': amount,
            'payment.currency': currency,
            'payment.payment_method': paymentMethodId,
            'payment.payment_status': paymentIntent.status,
            'payment.transaction_id': paymentIntent.id,
            'payment.payment_id': paymentIntent.id,
        }, { new: true });

        // Check the status of the payment intent
        if (paymentIntent.status === 'requires_action' || paymentIntent.status === 'requires_confirmation') {
            // Payment requires additional actions
            return res.status(200).json({
                success: false,
                message: 'Payment requires additional actions.',
                paymentIntent: paymentIntent,
            });
        }

        // Send a success response
        res.status(200).json({
            success: true,
            message: 'Payment successful',
            payment: paymentIntent,
        });
    } catch (error) {
        console.error('Payment Error:', error);
        res.status(400).json({
            success: false,
            message: 'Payment failed',
            error: error.message || 'An error occurred during payment processing',
        });
    }
};

// Retrieve payment details
exports.getPaymentStatus = async (req, res) => {
    const { bookingId } = req.params;

    try {
        // Retrieve the booking to check payment details
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        // Return the payment details
        res.status(200).json({
            success: true,
            payment: booking.payment,
        });
    } catch (error) {
        console.error('Retrieval Error:', error);
        res.status(400).json({
            success: false,
            message: 'Error retrieving payment status',
            error: error.message || 'An error occurred while retrieving payment status',
        });
    }
};

// Update payment status (for failed payments, etc.)
exports.updatePaymentStatus = async (req, res) => {
    const { bookingId, paymentStatus } = req.body;

    // Validate the request body
    if (!paymentStatus || !['pending', 'completed', 'failed'].includes(paymentStatus)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid payment status',
        });
    }

    try {
        // Update the payment status in the booking
        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            { 'payment.payment_status': paymentStatus },
            { new: true } // Return the updated document
        );

        if (!updatedBooking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        // Send a success response
        res.status(200).json({
            success: true,
            message: 'Payment status updated',
            booking: updatedBooking,
        });
    } catch (error) {
        console.error('Update Error:', error);
        res.status(400).json({
            success: false,
            message: 'Error updating payment status',
            error: error.message || 'An error occurred while updating payment status',
        });
    }
};
