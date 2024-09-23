const Booking=require('../models/booking_model')
const getUpcomingBookings = async (req, res) => {
    try {
        const userId = req.body.userId; // Assuming userId is passed in the body

        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required.' });
        }
        const upcomingBookings = await Booking.find({
            user_id:userId,
            booking_status: { $in: ['confirmed', 'pending'] },
            booking_date: { $gte: new Date() } // Only future dates
        }).populate('shop.services');

        console.log('User ID:', req.userId); // Optional: log for debugging

        res.status(200).json({ success: true, data: upcomingBookings });
    } catch (error) {
        console.error('Error fetching upcoming bookings:', error); // Log the error for debugging
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get completed bookings
const getCompletedBookings = async (req, res) => {
    try {
        const completedBookings = await Booking.find({
            user_id: req.user._id,
            booking_status: 'completed'
        }).populate('service_id provider_id');

        res.status(200).json({ success: true, data: completedBookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get cancelled bookings
const getCancelledBookings = async (req, res) => {
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
        console.error('Error creating booking:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


const cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;

        // Find booking by ID and update the status to 'cancelled'
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        booking.booking_status = 'cancelled';
        booking.payment.payment_status = 'failed'; // Assuming payment is failed on cancellation
        await booking.save();

        return res.status(200).json({ success: true, message: 'Booking cancelled successfully', booking });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


// Cancel a transaction
const cancelTransaction = async (req, res) => {
    const { transactionId } = req.params;

    try {
        const transaction = await Transaction.findById(transactionId);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if (transaction.status === 'canceled') {
            return res.status(400).json({ message: 'Transaction is already canceled' });
        }

        transaction.status = 'canceled';
        await transaction.save();

        res.status(200).json({ message: 'Transaction canceled successfully', transaction });
    } catch (error) {
        console.error('Cancel transaction error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Post a transaction
const postTransaction = async (req, res) => {
    const { transactionId } = req.params;

    try {
        const transaction = await Transaction.findById(transactionId);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if (transaction.status === 'posted') {
            return res.status(400).json({ message: 'Transaction is already posted' });
        }

        transaction.status = 'posted';
        await transaction.save();

        res.status(200).json({ message: 'Transaction posted successfully', transaction });
    } catch (error) {
        console.error('Post transaction error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// View transaction details
const viewTransaction = async (req, res) => {
    const { transactionId } = req.params;

    try {
        const transaction = await Transaction.findById(transactionId);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.status(200).json({ transaction });
    } catch (error) {
        console.error('View transaction error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// Generate e-receipt for a transaction
const generateEReceipt = async (req, res) => {
    try {
        const { bookingId } = req.params;

        // Find booking by ID
        const booking = await Booking.findById(bookingId).populate('user_id service_id provider_id');
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Format receipt data
        const receipt = {
            booking_id: booking._id,
            user: booking.user_id,
            service: booking.service_id,
            provider: booking.provider_id,
            booking_date: booking.booking_date,
            booking_status: booking.booking_status,
            payment: booking.payment,
            details: booking.details
        };

        return res.status(200).json({ success: true, message: 'Receipt retrieved successfully', receipt });
    } catch (error) {
        console.error('Error viewing receipt:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};



module.exports = {
    getUpcomingBookings,
    getCompletedBookings,
    getCancelledBookings,
    viewTransaction,
    cancelTransaction,
    postTransaction,
    cancelBooking, 
    generateEReceipt,
    createBooking
};
