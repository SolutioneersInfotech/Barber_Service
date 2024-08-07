// controllers/userController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const FormDataModel = require('../models/FormData.js');
const { validateEmail, validatePhoneNumber } = require('../utils/validators'); // Custom validators
const { sendotp, verifyotp } = require('./otp_controller.js');

// Home route for testing
const home = async (req, res) => {
    try {
        res.status(200).send('Welcome to the barber home page');
    } catch (error) {
        console.error('Home route error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Register route with OTP verification
const register = async (req, res) => {
    const { email, phone, password, otp } = req.body;

    // Check if all fields are provided
    if (!email || !phone || !password) {
        return res.status(400).json({ error: 'Email, phone, password, and OTP are required' });
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
        const existingUser = await FormDataModel.findOne({ $or: [{ email }, { phone }] });
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

        // Send OTP
        const otpResponse = await sendotp({ phone });
        if (!otpResponse.success) {
            
            return res.status(400).json({ error: otpResponse.msg });
        }
    

        // Verify OTP
        const otpVerification = await verifyotp({ phone });
        if (!otpVerification.success) {
            return res.status(400).json({ error: otpVerification.msg });
        }

        // Hash the password and save the user
        const hashedPassword = await bcrypt.hash(password, 10);
        const usercreate = new FormDataModel({ email, phone, password: hashedPassword });

        await usercreate.save();

        // Generate token for the user
        const token = await usercreate.generateToken();

        res.status(201).json({
            message: 'Registered successfully',
            token,
            userId: usercreate._id.toString(),
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Login route with OTP verification
const login = async (req, res) => {
    const { email, phone, password, otp } = req.body;

    // Check if all fields are provided
    if (!email || !phone || !password || !otp) {
        return res.status(400).json({ error: 'Email, phone, password, and OTP are required' });
    }

    // Validate email and phone number
    if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!validatePhoneNumber(phone)) {
        return res.status(400).json({ error: 'Invalid phone number' });
    }

    try {
        // Verify OTP
        const otpVerification = await verifyotp({ phone, otp });
        if (!otpVerification.success) {
            return res.status(400).json({ error: otpVerification.msg });
        }

        // Find the user by email and phone
        const user = await FormDataModel.findOne({ email, phone });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the password is correct
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Generate token for the user
        const token = await user.generateToken();

        res.status(200).json({
            message: 'Login successful',
            token,
            userId: user._id.toString(),
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { register, login, home };
