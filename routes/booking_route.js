const express = require('express');
const router = express.Router();
const bookingController = require('../controller/booking_controller');

// Route to create a new booking
router.post('/', bookingController.createBooking);


// Route to update booking status
router.put('/update-status/:bookingId', bookingController.updateBookingStatus);

router.get('/status/:userId', bookingController.fetchAllBookingsStatus);
 


module.exports = router;
