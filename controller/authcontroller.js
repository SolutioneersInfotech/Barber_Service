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
    const { firstName, lastName, email, phone, DOB, gender, address, profile_img , device_token } = req.body;

    const requiredFields = { firstName, lastName, email, phone, DOB, gender, address, profile_img, device_token };

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

        const user = new User({ firstName, lastName, email, phone, DOB, gender, address, profile_img, device_token });
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

const device = async(req,res)=>{

}




// Create a new shop
const createShop = async (req, res) => {
    try {
        const {
            name, owner, contactNumber, email, website, address,
            operatingHours, barbers, services, socialMediaLinks, ratings
        } = req.body;

        const newShop = new Shop({
            name, owner, contactNumber, email, website, address,
            operatingHours, barbers, services, socialMediaLinks, ratings
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
const getNearbyShops = async (req, res) =>  {
    try {
        // Find all shops and select only specific fields
        const shops = await Shop.find({})
            .select('name ratings address.houseNo address.street address.city address.state address.pin address.country');
        
        // Use sendGeneralResponse utility function to send a successful response
        sendGeneralResponse(res, true, 'Nearby Shops', 200, shops);

    } catch (error) {
        console.error('Error fetching nearby shops:', error);
        // Use sendGeneralResponse utility function to send an error response
        sendGeneralResponse(res, false, 'Error fetching nearby shops', 500, error.message);
    }
};
// due to some error it is not working
// Controller to get popular shops
const getPopularShops = async (req, res) => {
    try {
        // Fetch shops sorted by 'ratings' in descending order
        const shops = await Shop.find({})
            .sort({ ratings: -1 }) // Sort by ratings in decreasing order
            .select('name ratings address.houseNo address.street address.city address.state address.pin address.country'); // Select specific fields

        // res.status(200).json(shops);
        sendGeneralResponse(res, true, 'Popular shops', 200, shops);

    } catch (err) {
        console.error(err);
        // res.status(500).json({ error: 'Internal server error' });
        sendGeneralResponse(res, false, 'Error fetching Popular shops', 500, error.message);

    }
};

//image one by one display logic

const imageUrls = [
    'https://images.pexels.com/photos/2899097/pexels-photo-2899097.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
    'https://images.pexels.com/photos/213780/pexels-photo-213780.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
    'https://images.pexels.com/photos/2820884/pexels-photo-2820884.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
    'https://docs.flutter.dev/assets/images/dash/dash-fainting.gif',
    'https://picsum.photos/250?image=9',
    'https://flutter.github.io/assets-for-api-docs/assets/widgets/owl-2.jpg',
    'https://flutter.github.io/assets-for-api-docs/assets/widgets/owl.jpg',
    'https://blog.ippon.fr/content/images/2023/09/RGFzaGF0YXJfRGV2ZWxvcGVyX092ZXJJdF9jb2xvcl9QR19zaGFkb3c-.png',
    'https://picsum.photos/seed/picsum/200/300',
    'https://picsum.photos/200/300?grayscale',
    'https://picsum.photos/200/300?random=1',
    'https://picsum.photos/200/300?random=2',
  ];

const getImage = (req, res) => {
    const { index } = req.query;
    
    // Ensure index is a number and within bounds
    const imageIndex = parseInt(index, 10);
    
    if (isNaN(imageIndex) || imageIndex < 0 || imageIndex >= imageUrls.length) {
      return res.status(400).json({ message: 'Invalid index' });
    }
    
    const imageUrl = imageUrls[imageIndex];
    
    // Send the image URL
    res.json({ imageUrl });
  };



// Helper functions for validation
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
const validatePhoneNumber = (phone) => /^\+?[1-9]\d{9}$/.test(String(phone));

module.exports = { login, register, createShop, getPopularShops, getNearbyShops, getImage };
