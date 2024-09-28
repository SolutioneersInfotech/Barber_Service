const express = require('express');
const router = express.Router();
const bookingController = require('../controller/booking_controller');
const verifyToken = require('../middleware/authmiddleware');

// Create a new booking
router.post('/:userId',  bookingController.createBooking);

// Get all bookings
router.get('/',  bookingController.getAllBookings);

// Get booking by ID
router.get('/:id', bookingController.getBookingById);

// Update booking by ID
router.put('/:id',  bookingController.updateBooking);

// Delete booking by ID
router.delete('/:id', bookingController.deleteBooking);

// Route to get all booking history for a user by userId
router.get('/history/:user_id', bookingController.getBookingHistory);

// Route to get booking history filtered by status
router.get('/history/completed', bookingController.getBookingComplete);
router.get('/history/upcoming', bookingController.getBookingUpcoming);
router.get('/history/cancel', bookingController.getBookingCancelled);

module.exports = router;
