const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User_model');
const Otp = require('../models/otp_model');
const Shop = require('../models/shop_model');
const otpGenerator = require('otp-generator');
const { sendGeneralResponse } = require('../utils/responseHelper');
const { validateRequiredFields } = require('../utils/validators');

// Function to verify OTP
const verifyOtp = async (phone, otp) => {
    try {
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
            message: 'Verified successfully',
            data: []
        };
    } catch (error) {
        console.error('OTP verification error:', error);
        return {
            status: false,
            message: 'Internal server error',
            data: []
        };
    }
};

// Login route
const login = async (req, res) => {
    const { phone, otp } = req.body;

    if (!phone) {
        return sendGeneralResponse(res, false, "Phone number field is required", 400);
    }

    if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
        return sendGeneralResponse(res, false, "Invalid phone number", 400);
    }

    if (!otp) {
        return sendGeneralResponse(res, false, "OTP field is required", 400);
    }

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
        return sendGeneralResponse(res, false, "Invalid OTP", 400);
    }

    try {
        const verificationResult = await verifyOtp(phone, otp);

        if (verificationResult.status) {
            const user = await User.findOne({ phone });

            if (user) {
                return sendGeneralResponse(res, true, 'Login successful', 200, user);
            } else {
                return sendGeneralResponse(res, false, 'User not registered', 400);
            }
        } else {
            return sendGeneralResponse(res, false, verificationResult.message, 400);
        }
    } catch (error) {
        console.error('Login error:', error);
        return sendGeneralResponse(res, false, "Internal server error", 500);
    }
};

// Register route
const register = async (req, res) => {
    const { firstName, lastName, email, phone, DOB, gender, address, profile_img } = req.body;

    const requiredFields = { firstName, lastName, email, phone, DOB, gender, address, profile_img };

    const validationResult = validateRequiredFields(res, requiredFields);
    if (validationResult !== true) return;

    if (!validateEmail(email)) {
        return sendGeneralResponse(res, false, 'Invalid email', 400);
    }

    if (!validatePhoneNumber(phone)) {
        return sendGeneralResponse(res, false, 'Invalid phone number', 400);
    }

    try {
        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            let message = '';
            if (existingUser.email === email) message += 'Email already registered. ';
            if (existingUser.phone === phone) message += 'Phone number already registered.';
            return sendGeneralResponse(res, false, message.trim(), 400);
        }

        const user = new User({ firstName, lastName, email, phone, DOB, gender, address, profile_img });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
        user.token = token;
        await user.save();

        sendGeneralResponse(res, true, 'Registered successfully', 200, user);
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return sendGeneralResponse(res, false, messages.join('. '), 400);
        }
        console.error('Registration error:', error);
        sendGeneralResponse(res, false, 'Internal server error', 500);
    }
};

// Create a new shop
const createShop = async (req, res) => {
    try {
        const {
            name, owner, contactNumber, email, website, address,
            operatingHours, barbers, services, socialMediaLinks
        } = req.body;

        const newShop = new Shop({
            name, owner, contactNumber, email, website, address,
            operatingHours, barbers, services, socialMediaLinks
        });

        const savedShop = await newShop.save();

        res.status(201).json({
            message: 'Shop created successfully',
            shop: savedShop
        });
    } catch (error) {
        console.error('Shop creation error:', error);
        res.status(500).json({
            message: 'An error occurred while creating the shop',
            error: error.message
        });
    }
};

// Helper function to calculate distance using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon1 - lon2) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Controller to get nearby shops
const getNearbyShops = async (req, res) => {
    try {
        const customerId = req.body; // Assuming req.user is set after authentication

        const customer = await User.findById(customerId);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        if (!customer.address || customer.address.latitude === undefined || customer.address.longitude === undefined) {
            return res.status(400).json({ success: false, message: 'Customer location data is incomplete' });
        }

        const { latitude, longitude } = customer.address;
        const maxDistance = req.query.maxDistance || 5; // Max distance in km (default 5 km)

        const shops = await Shop.find();

        const nearbyShops = shops.filter(shop => {
            const distance = calculateDistance(latitude, longitude, shop.address.latitude, shop.address.longitude);
            return distance <= maxDistance;
        });

        res.status(200).json({ success: true, data: nearbyShops });
    } catch (error) {
        console.error('Error fetching nearby shops:', error);
        res.status(500).json({ success: false, message: 'Error fetching nearby shops', error: error.message });
    }
};

// Controller to get popular shops
const getPopularShops = async (req, res) => {
    try {
        const minRating = req.query.minRating || 4;
        const minBookings = req.query.minBookings || 20;

        const popularShops = await Shop.find({
            "ratings.rating": { $gte: minRating },
            "appointmentHistory.0": { $exists: true }
        }).populate('barbers');

        const filteredPopularShops = popularShops.filter(shop => {
            const totalBookings = shop.ratings.length;
            return totalBookings >= minBookings;
        });

        res.status(200).json({ success: true, data: filteredPopularShops });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching popular shops', error: error.message });
    }
};

// Helper functions for validation
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
const validatePhoneNumber = (phone) => /^\+?[1-9]\d{9}$/.test(String(phone));

module.exports = { login, register, createShop, getPopularShops, getNearbyShops };
