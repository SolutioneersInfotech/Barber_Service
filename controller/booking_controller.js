const Booking=require('../models/booking_model')

// Get upcoming bookings
const getUpcomingBookings = async (req, res) => {
    try {
        const upcomingBookings = await Booking.find({
            user_id:  req.userId,  // Assuming you have user ID from authenticated user
            booking_status: { $in: ['confirmed', 'pending'] },
            booking_date: { $gte: new Date() }  // Only future dates
        }).populate('service_id provider_id');

        res.status(200).json({ success: true, data: upcomingBookings });
    } catch (error) {
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

module.exports = {
    getUpcomingBookings,
    getCompletedBookings,
    getCancelledBookings
};
