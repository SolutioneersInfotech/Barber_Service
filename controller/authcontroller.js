// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// const User = require('../models/User_model');
// const Otp = require('../models/otp_model'); // Assuming this is the model for storing OTPs
// const { validateEmail, validatePhoneNumber } = require('../utils/validators');
// const { sendotp, verifyotp } = require('./otp_controller');

// // Home route for testing
// const home = async (req, res) => {
//     try {
//         res.status(200).send('Welcome to the barber home page');
//     } catch (error) {
//         console.error('Home route error:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

// // Register route logic
// const register = async (req, res) => {
//     const { firstName, lastName, email, phone, DOB, gender, address } = req.body;

//     // Check if all fields are provided
//     if (!firstName || !lastName || !email || !phone || !DOB || !gender || !address) {
//         return res.status(400).json({ error: 'All fields are required' });
//     }

//     // Validate email and phone number
//     if (!validateEmail(email)) {
//         return res.status(400).json({ error: 'Invalid email format' });
//     }

//     if (!validatePhoneNumber(phone)) {
//         return res.status(400).json({ error: 'Invalid phone number' });
//     }

//     try {
//         // Check if the user with the same email or phone already exists
//         const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
//         if (existingUser) {
//             let message = '';
//             if (existingUser.email === email) {
//                 message += 'Email already registered. ';
//             }
//             if (existingUser.phone === phone) {
//                 message += 'Phone number already registered.';
//             }
//             return res.status(400).json({ error: message.trim() });
//         }
        
//         // Create and save the new user
//         const user = new User({ firstName, lastName, email, phone, DOB, gender, address });
//         const token = user.generateToken();  // Token generation should be after user initialization
//         user.token = token;  // Assign the generated token to the user object
//         await user.save();

//         res.status(201).json({
//             success: 'true',
//             message: 'Registered',
//             data: user
//         });
//     } catch (error) {
//         console.error('Registration error:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

// // Login route with OTP verification
// const login = async (req, res) => {
//     const { phone, otp } = req.body;

//     // Check if phone is provided
//     if (!phone) {
//         return res.status(400).json({ error: 'Phone and OTP are required' });
//     }

//     if (!validatePhoneNumber(phone)) {
//         return res.status(400).json({ error: 'Invalid phone number' });
//     }

//     try {

//         const existingUser = await User.findOne({phone});     
//         if(existingUser){
//             send
//         }
        
//         // Verify OTP
//         const otpRecord = await Otp.findOne({ phone });

//         if (!otpRecord) {
//             return res.status(400).json({ error: 'Register Please ! You are not registered' });
//         }

//         const { otp: storedOtp, otpExpiration } = otpRecord;

//         if (storedOtp !== otp) {
//             return res.status(400).json({ error: 'Incorrect OTP' });
//         }

//         if (new Date() > otpExpiration) {
//             return res.status(400).json({ error: 'OTP expired' });
//         }

//         // Find the user by phone
//         const user = await User.findOne({ phone });
//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }

//         res.status(200).json({
//             status: 'true',
//             message: 'Login',
//             data: user
//         });
//     } catch (error) {
//         console.error('Login error:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

// module.exports = { register, login, home };

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User_model');
const Otp = require('../models/otp_model');
const otpGenerator = require('otp-generator');

// Function to send OTP
const sendOtp = async (phone) => {
    const otp = otpGenerator.generate(6, {
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false
    });

    const cDate = new Date();
    const otpExpiration = new Date(cDate.getTime() + 15 * 60 * 1000);

    await Otp.findOneAndUpdate(
        { phone },
        { otp, otpExpiration },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`OTP sent to ${phone}: ${otp}`);

    return { success: true, msg: 'OTP sent successfully' };
};

// Function to verify OTP
const verifyOtp = async (phone, otp) => {
    const otpRecord = await Otp.findOne({ phone });

    if (!otpRecord) {
        return { success: false, msg: 'Phone number not found' };
    }

    const { otp: storedOtp, otpExpiration } = otpRecord;

    if (storedOtp !== otp) {
        return { success: false, msg: 'Incorrect OTP' };
    }

    if (new Date() > otpExpiration) {
        return { success: false, msg: 'OTP expired' };
    }

    return { success: true, msg: 'OTP verified successfully' };
};

// Login route
const login = async (req, res) => {
    const { phone, otp } = req.body;

    if (!phone || phone.length !== 10) {
        return res.status(400).json({ error: 'Phone number is required and must be 10 digits long' });
    }

    try {
        if (otp) {
            // If OTP is provided, verify it
            const verificationResult = await verifyOtp(phone, otp);

            if (verificationResult.success) {
                const user = await User.findOne({ phone });

                if (user) {
                  //  User found, log in and return token
                    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
                    return res.status(200).json({
                        success: true,
                        message: 'Login successful',
                        token,
                        action: 'home'
                    });
                } else {
                    // User not found, redirect to registration
                    return res.status(400).json({
                        success: false,
                        message: 'OTP verified but user not found. Please register.',
                        action: 'register'
                    });
                }
            } else {
                return res.status(400).json({ error: verificationResult.msg });
            }
        } else {
            // If OTP is not provided, send OTP
            const sendResult = await sendOtp(phone);

            if (sendResult.success) {
                return res.status(200).json({
                    success: true,
                    message: 'OTP sent. Please enter the OTP to complete login.',
                    action: 'verify'
                });
            } else {
                return res.status(500).json({ error: sendResult.msg });
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Register route
const register = async (req, res) => {
    const { firstName, lastName, email, phone, DOB, gender, address } = req.body;

    if (!firstName || !lastName || !email || !phone || !DOB || !gender || !address) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate email and phone number
    if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!validatePhoneNumber(phone)) {
        return res.status(400).json({ error: 'Invalid phone number' });
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

        res.status(201).json({
            success: true,
            message: 'Registered successfully',
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Helper functions for validation
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};

const validatePhoneNumber = (phone) => {
    const re = /^\d{10}$/; // Assuming phone number is 10 digits
    return re.test(String(phone));
};

module.exports = { login, register };
