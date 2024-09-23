const express = require('express')
const bookingController= require('../controller/booking_controller')
const verifyToken= require('../middleware/authmiddleware')
const router= express.Router();


// Upcoming bookings
router.get('/upcoming', verifyToken,bookingController.getUpcomingBookings);

// Completed bookings
router.get('/completed', bookingController.getCompletedBookings);

router.post('/book', bookingController.createBooking)

// Cancelled bookings
router.get('/cancelled', bookingController.getCancelledBookings);

router.put('/cancel/:transactionId', bookingController.cancelTransaction);
router.put('/post/:transactionId', bookingController.postTransaction);
router.get('/view/:transactionId', bookingController.viewTransaction);
router.get('/ereceipt/:transactionId', bookingController.generateEReceipt);


module.exports = router;