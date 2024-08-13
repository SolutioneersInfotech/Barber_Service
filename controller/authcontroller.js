const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User_model');
const Otp = require('../models/otp_model'); // Assuming this is the model for storing OTPs
const { validateEmail, validatePhoneNumber } = require('../utils/validators');
const { sendotp, verifyotp } = require('./otp_controller');

// Home route for testing
const home = async (req, res) => {
    try {
        res.status(200).send('Welcome to the barber home page');
    } catch (error) {
        console.error('Home route error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Register route logic
const register = async (req, res) => {
    const { firstName, lastName, email, phone, DOB, gender, address } = req.body;

    // Check if all fields are provided
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
        // Check if the user with the same email or phone already exists
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

        const token = user.generateToken();
        // Create and save the new user
        const user = new User({ firstName, lastName, email, phone, DOB, gender, address, token });
        await user.save();

        // Generate token for the user

        res.status(201).json({
            success:'true',
            message: 'Registered',
            data: user
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Login route with OTP verification
const login = async (req, res) => {
    const { phone, otp } = req.body;

    // Check if phone is provided
    if (!phone || !otp) {
        return res.status(400).json({ error: 'Phone and OTP are required' });
    }

    if (!validatePhoneNumber(phone)) {
        return res.status(400).json({ error: 'Invalid phone number' });
    }

    try {
        // Verify OTP
        const otpRecord = await Otp.findOne({ phone });

        if (!otpRecord) {
            return res.status(400).json({ error: 'Phone number not found' });
        }

        const { otp: storedOtp, otpExpiration } = otpRecord;

        if (storedOtp !== otp) {
            return res.status(400).json({ error: 'Incorrect OTP' });
        }

        if (new Date() > otpExpiration) {
            return res.status(400).json({ error: 'OTP expired' });
        }

        // Find the user by phone
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            status:'true',
            message: 'Login',
            // userId: user._id.toString(),
            data: user
        });
    } catch (error) {
        console.error('Login error:', error);
        // res.send({
        //      status:'false',
        //     message: 'Login unsuccessful',
        //     data: []} )
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { register, login, home };