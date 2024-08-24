const { check, validationResult } = require('express-validator');

const { sendGeneralResponse } = require('../utils/responseHelper');


// Middleware for validating OTP request
const validateSendOtp = [
    check('phone').isLength({ min: 10, max: 10 }).withMessage('Phone number must be 1qw0 digits long.'),
    (req, res, next) => {
        const errors = validationResult(req);
       

        // if (!phone) {
        //     console.log("hello {phone}");
        //     return { success: false, msg: 'Phone number is required', data : []};
        // }


        if (!errors.isEmpty()) {
            // return res.status(400).json({ errors: errors.array() });
            // console.log("sdsds")

                // const messages = Object.values(errors.errors).map(err => err.message);
                return sendGeneralResponse(res, false, errors, 400 );
            
        }
        next();
    }
];

// Middleware for validating OTP verification request
const validateVerifyOtp = [
    check('phone').isLength({ min: 10, max: 10 }).withMessage('Phone number must be 1qw0 digits long.'),
    check('otp').notEmpty().withMessage('OTP is required.'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateSendOtp,
    validateVerifyOtp
};