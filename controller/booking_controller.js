// const Booking = require('../models/booking_model');
// const Service = require('../models/shop_model');
// const { body, validationResult } = require('express-validator');
// const mongoose = require('mongoose');
// const { v4: uuidv4 } = require('uuid');

// // Create a new booking
// exports.createBooking = async (req, res) => {
//     try {
//         // Extract user ID from the request params
//         const { userId } = req.params;

//         // Extract other booking data from the request body
//         const { service_id, provider_id, booking_date, booking_status, payment, details, appointment_time, appointment_date } = req.body;

//         // Validate required fields
//         if (!appointment_time || !appointment_date) {
//             return res.status(400).json({ success: false, message: 'appointment_time and appointment_date are required.' });
//         }

//         // Validate service_id and provider_id
//         if (!Array.isArray(service_id) || service_id.some(id => !mongoose.Types.ObjectId.isValid(id))) {
//             return res.status(400).json({ success: false, message: 'Invalid service ID(s)' });
//         }

//         if (!mongoose.Types.ObjectId.isValid(provider_id)) {
//             return res.status(400).json({ success: false, message: 'Invalid provider ID' });
//         }

//         // Create new booking
//         const newBooking = new Booking({
//             user_id: userId,
//             service_id: service_id, // Assuming service_id is an array
//             provider_id,
//             booking_date,
//             booking_status,
//             payment,
//             details,
//             appointment_time,  // Include appointment_time in booking
//             appointment_date   // Include appointment_date in booking
//         });

//         await newBooking.save();
//         return res.status(201).json({ success: true, message: 'Booking created successfully', booking: newBooking });
//     } catch (error) {
//         console.error(error); // Log the error for debugging
//         return res.status(500).json({ success: false, message: 'An error occurred while creating the booking' });
//     }
// };

// // Get all bookings and populate sub-service names
// exports.getAllBookings = async (req, res) => {
//     try {
//         const bookings = await Booking.find()
//             .populate({
//                 path: 'service_id.',
//                 model: 'Shop',
//                 populate: {
//                     path: 'services.subServices',
//                     model: 'SubService',
//                     select: 'subServiceName',
//                 },
//             })
//             .populate('provider_id user_id', 'name email'); // Optionally populate provider and user details

//         res.status(200).json({ success: true, bookings });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// // Get a booking by ID
// exports.getBookingById = async (req, res) => {
//     try {
//         const booking = await Booking.findById(req.params.id)
//             .populate('user_id service_id provider_id', ' firstName lastName email name ');
//         if (!booking) {
//             return res.status(404).json({ success: false, message: 'Booking not found' });
//         }
//         res.status(200).json({ success: true, booking });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// // Update a booking by ID
// exports.updateBooking = [
//     // Validation rules for status update
//     body('booking_status').optional().isIn(['confirmed', 'completed', 'cancelled', 'pending']).withMessage('Invalid booking status'),

//     async (req, res) => {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({ errors: errors.array() });
//         }

//         try {
//             const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
//             if (!updatedBooking) {
//                 return res.status(404).json({ success: false, message: 'Booking not found' });
//             }
//             res.status(200).json({ success: true, booking: updatedBooking });
//         } catch (error) {
//             res.status(500).json({ success: false, message: error.message });
//         }
//     }
// ];

// // Delete a booking by ID
// exports.deleteBooking = async (req, res) => {
//     try {
//         const deletedBooking = await Booking.findByIdAndDelete(req.params.id).populate('service_id.');
//         if (!deletedBooking) {
//             return res.status(404).json({ success: false, message: 'Booking not found' });
//         }
//         res.status(204).json();
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// // Get all booking history for a user
// exports.getBookingHistory = async (req, res) => {
//     try {
//         // Extract user ID from the request params
//         const { userId } = req.params; 
        
//         // Fetch booking history for the user
//         const bookingHistory = await Booking.find({ userId }) 
//         .populate('user_id', 'firstName lastName email')
//         .populate('provider_id', 'name')
//             .populate({
//                 path: 'service_id.',
//                 model: 'Shop',
//                 populate: {
//                     path: 'services.subServices',
//                     model: 'SubService'
//                 }
//             })
//             .sort({ booking_date: -1 }); // Sort by booking date in descending order

//         if (!bookingHistory || bookingHistory.length === 0) {
//             return res.status(404).json({ success: false, message: 'No booking history found' });
//         }

//         // Format the response to include service names
//         const formattedBookings = bookingHistory.map(booking => {
//             const services = booking.service_id?.services || []; // Safe access to services
//             const serviceNames = services.flatMap(service =>
//                 service.subServices ? service.subServices.map(subService => subService.subServiceName) : []
//             ); // Safe access to subServices

//             return {
//                 ...booking.toObject(), // Convert mongoose object to plain JS object
//                 service_names: serviceNames // Extract subServiceNames
//             };
//         });

//         return res.status(200).json({ success: true, bookings: formattedBookings });
//     } catch (error) {
//         console.error(error); // Log the error for debugging
//         return res.status(500).json({ success: false, message: 'An error occurred while fetching booking history' });
//     }
// };



// // Utility function to handle response formatting
// const handleResponse = (res, statusCode, success, message, data = null) => {
//     return res.status(statusCode).json({ success, message, bookings: data });
// };

// // Get booking history filtered by 'cancelled' status
// exports.getBookingCancelled = async (req, res) => {
//     try {
//         const bookingStatus = 'cancelled'; // Define booking status
        
//         // Fetch bookings with the specified status
//         const bookingHistory = await Booking.find({ booking_status: bookingStatus })
//             .populate('service_id provider_id', 'name') // Populate service_id and provider_id fields
//             .sort({ booking_date: -1 }); // Sort bookings by booking date in descending order

//         // Check if no bookings were found
//         if (!bookingHistory || bookingHistory.length === 0) {
//             return handleResponse(res, 404, false, 'No bookings with status "cancelled" found');
//         }

//         // Return the found bookings
//         handleResponse(res, 200, true, 'Bookings retrieved successfully', bookingHistory);
//     } catch (error) {
//         // Log the error for debugging
//         console.error(`Error fetching cancelled bookings: ${error.message}`);
        
//         // Return a generic error response
//         handleResponse(res, 500, false, 'An error occurred while fetching cancelled bookings');
//     }
// };


// // Get booking history filtered by 'completed' status
// exports.getBookingComplete = async (req, res) => {
//     try { 
//         const bookingHistory = await Booking.find({ booking_status: 'completed' })
//             .populate('service_id provider_id', 'name') // Corrected populate syntax
//             .sort({ booking_date: -1 });

//         if (!bookingHistory.length) {
//             return handleResponse(res, 404, false, 'No bookings with status "completed" found');
//         }

//         handleResponse(res, 200, true, 'Bookings retrieved successfully', bookingHistory);
//     } catch (error) {
//         console.error(`Error fetching completed bookings: ${error.message}`); // Log the error for debugging
//         handleResponse(res, 500, false, 'An error occurred while fetching completed bookings');
//     }
// };

// // Get all upcoming bookings filtered by 'confirmed' and 'pending' statuses
// exports.getBookingUpcoming = async (req, res) => {
//     try {
//         const validStatuses = ['confirmed', 'pending'];

//         const bookingHistory = await Booking.find({ booking_status: { $in: validStatuses } }) // Use $in to filter for confirmed and pending bookings
//             .populate('service_id provider_id', 'name') // Corrected populate syntax
//             .sort({ booking_date: -1 }); // Sort by booking date in descending order

//         if (!bookingHistory.length) {
//             return handleResponse(res, 404, false, 'No upcoming bookings found');
//         }

//         handleResponse(res, 200, true, 'Upcoming bookings retrieved successfully', bookingHistory);
//     } catch (error) {
//         console.error(`Error fetching upcoming bookings: ${error.message}`); // Log the error for debugging
//         handleResponse(res, 500, false, 'An error occurred while fetching upcoming bookings');
//     }
// };



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

// Function to get upcoming bookings
exports.getUpcomingBookings = async (req, res) => {
  try {
    const userId = req.params.userId;

    const upcomingBookings = await Booking.find({
      user_id: userId,
      appointment_date: { $gte: new Date() },
      booking_status: { $in: ['pending', 'confirmed'] },
    }).populate('service_id provider_id', 'name');

    return sendGeneralResponse(res, true, 'Upcoming bookings retrieved successfully', 200, upcomingBookings);
  } catch (error) {
    return sendGeneralResponse(res, false, 'Error retrieving upcoming bookings', 500, error.message);
  }
};

// Function to get completed bookings
exports.getCompletedBookings = async (req, res) => {
  try {
    const userId = req.params.userId;

    const completedBookings = await Booking.find({
      user_id: userId,
      booking_status: 'completed',
    }).populate('service_id provider_id');

    return sendGeneralResponse(res, true, 'Completed bookings retrieved successfully', 200, completedBookings);
  } catch (error) {
    return sendGeneralResponse(res, false, 'Error retrieving completed bookings', 500, error.message);
  }
};

// Function to get canceled bookings
exports.getCanceledBookings = async (req, res) => {
  try {
    const userId = req.params.userId;

    const canceledBookings = await Booking.find({
      user_id: userId,
      booking_status: 'cancelled',
    }).populate('service_id provider_id');

    return sendGeneralResponse(res, true, 'Canceled bookings retrieved successfully', 200, canceledBookings);
  } catch (error) {
    return sendGeneralResponse(res, false, 'Error retrieving canceled bookings', 500, error.message);
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

    return sendGeneralResponse(res, true, 'Booking status updated successfully', 200, updatedBooking);
  } catch (error) {
    return sendGeneralResponse(res, false, 'Error updating booking status', 500, error.message);
  }
};
