const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User_model');
const Otp = require('../models/otp_model');
const otpGenerator = require('otp-generator');
const { sendGeneralResponse } = require('../utils/responseHelper');
const { validateRequiredFields } = require('../utils/validateRequiredFields');


// Function to verify OTP
const verifyOtp = async (phone, otp) => {
    const otpRecord = await Otp.findOne({ phone });

    if (!otpRecord) {
        return {
            status: false,
            message: 'Phone number not found',
            data: []
        };
    }

    const { otp: storedOtp, otpExpiration } = otpRecord;

    if (storedOtp !== otp) {
        return {
            status: false,
            message: 'Incorrect OTP',
            data: []

        };
    }

    if (new Date() > otpExpiration) {
        return {
            status: false,
            message: 'OTP expired',
            data: []
        };
    }

     

        return {
        status: true,
        message: 'verified successfully',
        data: []
    };
 };

// Login route
const login = async (req, res) => {

    const { phone, otp } = req.body;

    if (!phone) {
        return sendGeneralResponse(res, false, "Phone number field is required", 400)
    }

    if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
        return sendGeneralResponse(res, false, "invalid phone Number", 400)
    }

    if (!otp) {
        return sendGeneralResponse(res, false, "OTP field is required", 400)
    }

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
        return sendGeneralResponse(res, false, "invalid OTP", 400)
    }


    try {
        if (otp) {
            // verify otp
            const verificationResult = await verifyOtp(phone, otp);

            if (verificationResult.status) {
                const user = await User.findOne({ phone });

                if (user) {
                    return sendGeneralResponse(res, true, 'Login successful', 200, user)
                } else {
                    return sendGeneralResponse(res, false, 'Unregister', 400)

                }
            } else {
                return sendGeneralResponse(res, false, verificationResult.message, 400)
            }
        } 
    } catch (error) {
        console.error('Login error:', error);
        return sendGeneralResponse(res, false, "Internal Server Error", 500)
    }
};




// Register route
const register = async (req, res) => {
    const { firstName, lastName, email, phone, DOB, gender, address } = req.body;


    const requiredFields = {
        firstName,
        lastName,
        email,
        phone,
        DOB,
        gender,
        address
    };

 
     const validationResult = validateRequiredFields(res, requiredFields);

    if (validationResult !== true) {
        return ;
    }
  
    if (!validateEmail(email)) {
        return sendGeneralResponse(res, false, 'Invalid email', 400);
    }

    if (!validatePhoneNumber(phone)) {
        console.log("asasasas")
        return sendGeneralResponse(res, false, 'Invalid phone number', 400);
    }

    try {
        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            let message = '';
            if (existingUser.email === email) {
                message += 'Email already registered. ';
            }
            if (existingUser.phone === phone) {
                message += 'Phone number already registered.';
            }
            return res.status(400).json({ error: message.trim() });
        }

        const user = new User({ firstName, lastName, email, phone, DOB, gender, address });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
        user.token = token;
        await user.save();




         sendGeneralResponse(res, true, 'Registered successfully', 200 , user);

        // res.status(201).json({
        //     success: true,
        //     message: 'Registered successfully',
        //     token
        // });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
         return sendGeneralResponse(res, false, messages.join('. '), 400 );

        }
        console.error('Registration error:', error);
        res.status(500).json({ error: error });
     sendGeneralResponse(res, false, error, 500 ,);

    }
};



// Helper functions for validation
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};

const validatePhoneNumber = (phone) => {
    const re = /^\+?[1-9]\d{1,14}$/; // Assuming phone number is 10 digits
    return re.test(String(phone));
};

module.exports = { login, register };
