const express = require('express');
const router = express.Router();
const bookingController = require('../controller/booking_controller');
const verifyToken = require('../middleware/authmiddleware')

router.post('/', bookingController.createBooking);
router.get('/', bookingController.getAllBookings);
router.get('/:id', bookingController.getBookingById);
router.put('/:id', bookingController.updateBooking);
router.delete('/:id', bookingController.deleteBooking);
// Route to get all booking history for a user
router.get('/history', verifyToken, bookingController.getBookingHistory);

// Route to get booking history filtered by status
router.get('/history/status/:status', verifyToken, bookingController.getBookingHistoryByStatus);

module.exports = router;
