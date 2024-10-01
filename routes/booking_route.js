const express = require('express');
const router = express.Router();
const bookingController = require('../controller/booking_controller');

// Route to create a new booking
router.post('/', bookingController.createBooking);

// Route to get upcoming bookings for a user
router.get('/upcoming/:userId', bookingController.getUpcomingBookings);

// Route to get completed bookings for a user
router.get('/completed/:userId', bookingController.getCompletedBookings);

// Route to get canceled bookings for a user
router.get('/canceled/:userId', bookingController.getCanceledBookings);

// Route to update booking status
router.put('/update-status/:bookingId', bookingController.updateBookingStatus);

module.exports = router;
