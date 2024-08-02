const mongoose = require('mongoose');

// Define the schema for OTPs
const otpSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
        unique: true,  // Ensure that OTPs are unique per email
    },
    otp: {
        type: String,
        required: true,
    },
    otpExpiration: {
        type: Date,
        default:Date.now(),
        get: (otpExpiration)=>otpExpiration.getTime(),
    },
}, {
    timestamps: true,  // Automatically add createdAt and updatedAt fields
});

// Create and export the OTP model
const OtpModel = mongoose.model('Otp', otpSchema);

module.exports = OtpModel;
