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
        const cancelledBookings = await Booking.find({
            user_id: req.user._id,
            booking_status: 'cancelled'
        }).populate('service_id provider_id');

        res.status(200).json({ success: true, data: cancelledBookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};



const createBooking = async (req, res) => {
    try {
        const { user_id, service_id, provider_id, booking_date, amount, currency, payment_method, transaction_id, payment_id, booking_id, additional_info } = req.body;

        // Create new booking
        const newBooking = new Booking({
            user_id,
            service_id,
            provider_id,
            booking_date,
            booking_status: 'pending', // Initially setting the status to 'pending'
            payment: {
                amount,
                currency,
                payment_method,
                payment_status: 'pending', // Initially setting payment status to 'pending'
                transaction_id,
                payment_date: new Date(), // Assuming payment is done at the time of booking
                payment_id,
                booking_id
            },
            details: { additional_info } 
        });

        await newBooking.save();
        return res.status(201).json({ success: true, message: 'Booking created successfully', booking: newBooking });
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



// Get all booking history for a user
exports.getBookingHistory = async (req, res) => {
    try {
        const userId = req.user._id; // Assuming the user is authenticated and user_id is available

        // Find all bookings for the authenticated user
        const bookingHistory = await Booking.find({ user_id: userId })
            .populate('service_id provider_id')
            .sort({ booking_date: -1 }); // Sort by booking date in descending order (latest first)

        if (!bookingHistory || bookingHistory.length === 0) {
            return res.status(404).json({ message: 'No booking history found' });
        }

        res.status(200).json({ success: true, data: bookingHistory });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get booking history filtered by status (e.g., 'confirmed', 'completed', 'cancelled')
exports.getBookingHistoryByStatus = async (req, res) => {
    try {
        const userId = req.user._id; // Assuming the user is authenticated and user_id is available
        const { status } = req.params; // Extract status from the request params

        // Validate status
        const validStatuses = ['confirmed', 'completed', 'cancelled', 'pending'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid booking status' });
        }

        // Find bookings based on status for the user
        const bookingHistory = await Booking.find({
            user_id: userId,
            booking_status: status
        })
            .populate('service_id provider_id')
            .sort({ booking_date: -1 });

        if (!bookingHistory || bookingHistory.length === 0) {
            return res.status(404).json({ message: `No ${status} bookings found` });
        }

        res.status(200).json({ success: true, data: bookingHistory });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
