const Booking = require('../models/booking_model');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

// Create a new booking
exports.createBooking = [
    body('user_id').isMongoId().withMessage('User ID must be a valid MongoDB Object ID'),
    body('service_id').isMongoId().withMessage('Service ID must be a valid MongoDB Object ID'),
    body('provider_id').isMongoId().withMessage('Provider ID must be a valid MongoDB Object ID'),
    body('booking_date').isISO8601().toDate().withMessage('Booking date must be a valid date'),
    body('booking_status').isIn(['confirmed', 'completed', 'cancelled', 'pending']).withMessage('Invalid booking status'),
    body('payment.amount').isNumeric().withMessage('Payment amount must be a number'),
    body('payment.currency').isString().withMessage('Currency must be a string'),
    body('payment_method').isIn(['credit_card', 'paypal', 'bank_transfer']).withMessage('Invalid payment method'),
    body('payment_status').isIn(['paid', 'pending', 'failed']).withMessage('Invalid payment status'),
    body('payment.transaction_id').isString().withMessage('Transaction ID must be a string'),
    body('payment.payment_date').isISO8601().toDate().withMessage('Payment date must be a valid date'),
    body('payment.payment_id').isString().withMessage('Payment ID must be a string'),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const newBooking = new Booking({
                ...req.body,
                payment: {
                    ...req.body.payment,
                    booking_id: uuidv4() // Generate unique booking ID
                }
            });

            const savedBooking = await newBooking.save();
            res.status(201).json(savedBooking);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
];

// Get all bookings
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().populate('user_id service_id provider_id');
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a booking by ID
exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('user_id service_id provider_id');
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a booking by ID
exports.updateBooking = [
    body('booking_status').optional().isIn(['confirmed', 'completed', 'cancelled', 'pending']).withMessage('Invalid booking status'),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updatedBooking) {
                return res.status(404).json({ message: 'Booking not found' });
            }
            res.status(200).json(updatedBooking);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
];

// Delete a booking by ID
exports.deleteBooking = async (req, res) => {
    try {
        const deletedBooking = await Booking.findByIdAndDelete(req.params.id);
        if (!deletedBooking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.status(204).json();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
