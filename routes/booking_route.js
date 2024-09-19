const express = require('express')
const bookingController= require('../controller/booking_controller')
const verifyToken= require('../middleware/authmiddleware')
const router= express.Router();


// Upcoming bookings
router.get('/upcoming', verifyToken,bookingController.getUpcomingBookings);

// Completed bookings
router.get('/completed', bookingController.getCompletedBookings);

// Cancelled bookings
router.get('/cancelled', bookingController.getCancelledBookings);

module.exports = router;