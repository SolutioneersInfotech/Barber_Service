 const mongoose = require('mongoose');

// Payment Schema
const paymentSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        default: 'INR',
    },
    payment_method: {
        type: String,
        required: true,
    },
    payment_status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
    },
    transaction_id: {
        type: String,
        required: true,
    },
    payment_date: {
        type: Date,
        default: Date.now,
    },
    payment_id: {
        type: String,
        required: true,
    },
    booking_id: {
        type: String,
        required: true,
    },
}, { _id: false }); // Disable automatic id creation for the payment sub-document

// Booking Schema
const bookingSchema = new mongoose.Schema({
    service_id: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop', // Reference to the Shop model
        required: true,
    }],
    provider_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop', // Reference to the Shop (as provider)
        required: true,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true,
    },
    booking_date: {
        type: Date,
        required: true,
    },
    appointment_date: {
        type: Date,
        required: true,
    },
    appointment_time: {
        type: String, // Store time as a string (e.g., "15:00")
        required: true,
    },
    booking_status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending',
    },
    payment: paymentSchema, // Embedded payment schema
    details: {
        additional_info: {
            type: String,
            default: '',
        },
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Export the Booking model
const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
