// const { check, validationResult } = require('express-validator');
// const { sendGeneralResponse } = require('../utils/responseHelper');


// // Middleware for validating OTP request
// const validateSendOtp = [
//     check('phone').isLength({ min: 10, max: 10 }).withMessage('Phone number must be 10 digits long.'),
//     (req, res, next) => {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {

//             if (errors.name === 'ValidationError') {
//                 const messages = Object.values(error.errors).map(err => err.message);
//              return sendGeneralResponse(res, false, messages.join('. '), 400 );
//             }
//             // return res.status(400).json({ errors: errors.array() });
//         }
//         next();
//     }
// ];

// // Middleware for validating OTP verification request
// const validateVerifyOtp = [
//     check('phone').isLength({ min: 10, max: 10 }).withMessage('Phone number must be 1qwqw0 digits long.'),
//     check('otp').notEmpty().withMessage('OTP is required.'),
//     (req, res, next) => {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({ errors: errors.array() });
//         }
//         next();
//     }
// ];

// module.exports = {
//     validateSendOtp,
//     validateVerifyOtp
// };
