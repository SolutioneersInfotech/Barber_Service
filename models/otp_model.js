
const mongoose = require('mongoose');
// const validator = require('validator');

// Custom Phone Validator
// const validatePhone = (phone) => {
//     const phoneRegex = /^[+]?[0-9]{10,15}$/;
//     return phoneRegex.test(phone);
// };

// Define the schema for OTPs
// const otpSchema = new mongoose.Schema({
//     phone: {
//         type: String,
//         required: true,
//         validate: {
//             validator: validatePhone,
//             message: 'Invalid phone number'
//         }
//     },
//     otp: {
//         type: String,
//         required: true,
//     },
//     otpExpiration: {                                       
//         type: Date,
//         default: () => Date.now() + 15 * 60 * 1000, // Default expiration of 15 minutes .
//     },
// }, {
//     timestamps: true,  // Automatically add createdAt and updatedAt fields
// });

// // Create and export the OTP model
// const OtpModel = mongoose.model('Otp', otpSchema);

// module.exports = OtpModel;




const otpSchema = new mongoose.Schema({
    phone: { type: String, required: false, }, // Make phone optional
    email: { type: String, required: false, }, // Add email field
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
 });

const Otp = mongoose.model('Otp', otpSchema);
module.exports = Otp;