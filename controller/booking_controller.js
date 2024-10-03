
const mongoose = require('mongoose');
const Booking = require('../models/booking_model');
const Shop = require('../models/shop_model');
const { sendGeneralResponse } = require('../utils/responseHelper');


// Function to create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { service_id, provider_id, user_id, booking_date, appointment_date, appointment_time, additional_info, payment } = req.body;

    const newBooking = new Booking({
      service_id,
      provider_id,
      user_id,
      booking_date,
      appointment_date,
      appointment_time,
      details: {
        additional_info,
      },
      payment,
    });

    await newBooking.save();
    return sendGeneralResponse(res, true, 'Booking created successfully', 201, newBooking);
  } catch (error) {
    return sendGeneralResponse(res, false, 'Error creating booking', 500, error.message);
  }
};


// Function to update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    const { booking_status } = req.body;

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { booking_status },
      { new: true }
    );

    if (!updatedBooking) {
      return sendGeneralResponse(res, false, 'Booking not found', 404);
    }

    // Fetch all booking statuses after updating
    return await fetchAllBookingsStatus(updatedBooking.user_id, res);
  } catch (error) {
    return sendGeneralResponse(res, false, 'Error updating booking status', 500, error.message);
  }
};

// Function to fetch all booking statuses for a user
exports.fetchAllBookingsStatus = async (req, res) => {
  try {
    const userId = req.params.userId;
    const upcomingBookings = await Booking.find({
      user_id: userId,
      appointment_date: { $gte: new Date() },
      booking_status: { $in: ['pending', 'confirmed'] },
    }).populate('service_id provider_id', 'name');

    const completedBookings = await Booking.find({
      user_id: userId,
      booking_status: 'completed',
    }).populate('service_id provider_id');

    const canceledBookings = await Booking.find({
      user_id: userId,
      booking_status: 'cancelled',
    }).populate('service_id provider_id');

    return sendGeneralResponse(res, true, 'Booking status updated successfully', 200, {
      upcomingBookings,
      completedBookings,
      canceledBookings,
    });
  } catch (error) {
    return sendGeneralResponse(res, false, 'Error retrieving booking statuses', 500, error.message);
  }
};
