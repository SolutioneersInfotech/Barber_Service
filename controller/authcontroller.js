const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User_model');
const Otp = require('../models/otp_model');
const Shop = require('../models/shop_model');
const otpGenerator = require('otp-generator');
const { sendGeneralResponse } = require('../utils/responseHelper');
const { validateRequiredFields } = require('../utils/validators');
const multer = require('multer');
const { uploadImage } = require('../utils/uploadImages');

const upload = multer({ storage: multer.memoryStorage() });

// Function to verify OTP
const verifyOtp = async (phone, otp) => {
    try {
        const otpRecord = await Otp.findOne({ phone });

        if (!otpRecord) {
            return {
                status: false,
                message: 'Again send OTP',
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



// user  Login 
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
            if (!user) {
                return sendGeneralResponse(res, false, 'User not registered', 400);
            }

            const accessToken = generateAccessToken(user._id);
            const refreshToken = generateRefreshToken(user._id);
            
    
    
            user.refreshToken = refreshToken;
            await user.save();
    
            // // Set the refresh token in a cookie
            // res.cookie('Auth_Token', auth_token, {
            //     httpOnly: true, // Prevents client-side access
            //     secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            //     sameSite: 'Strict', // CSRF protection
            //     maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            // });

            // Send response with JWT token
            return sendGeneralResponse(res, true, 'Login successful', 200, { user,accessToken });
        } else {
            return sendGeneralResponse(res, false, verificationResult.message, 400);
        }
    } catch (error) {
        console.error('Login error:', error);
        return sendGeneralResponse(res, false, "Internal server error", 500);
    }
};




 
// // user register 
// const register = async (req, res) => {
//     const { firstName, lastName, email, phone, DOB, gender, address, profile_img , device_token } = req.body;

//     const requiredFields = { firstName, lastName, email, phone, DOB, gender, address, profile_img, device_token };

    // const validationResult = validateRequiredFields(res, requiredFields);
    // if (validationResult !== true) return;

//     if (!validateEmail(email)) {
//         return sendGeneralResponse(res, false, 'Invalid email', 400);
//     }

//     if (!validatePhoneNumber(phone)) {
//         return sendGeneralResponse(res, false, 'Invalid phone number', 400);
//     }

//     if (!req.file) {
//         return sendGeneralResponse(res, false, 'Profile image is required', 400);
//     }

//     try {
//         const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
//         if (existingUser) {
//             let message = '';
//             if (existingUser.email === email) message += 'Email already registered. ';
//             if (existingUser.phone === phone) message += 'Phone number already registered.';
//             return sendGeneralResponse(res, false, message.trim(), 400);
//         }

//         let profile_img_url = null;

//         if (req.file) {
//             profile_img_url = await uploadImage(req.file.buffer, 'profile_img_' + Date.now());
//         }

//         const user = new User({ firstName, lastName, email, phone, DOB, gender, address,  profile_img: profile_img_url , device_token });
//         const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
//         user.token = token;
//         await user.save();

//         sendGeneralResponse(res, true, 'Registered successfully', 200, user);
//     } catch (error) {
//         if (error.name === 'ValidationError') {
//             const messages = Object.values(error.errors).map(err => err.message);
//             return sendGeneralResponse(res, false, messages.join('. '), 400);
//         }
//         console.error('Registration error:', error);
//         sendGeneralResponse(res, false, 'Internal server error', 500);
//     }
// };
 

const register = async (req, res) => {


    if (!req.body) {
        return sendGeneralResponse(res, false, 'Request body is missing', 400);
    }
 
    const { firstName, lastName, email, phone, DOB, gender, address, device_token } = req.body;
    const requiredFields = { firstName, lastName, email, phone, DOB, gender, address, device_token };


    const validationResult = validateRequiredFields(res, requiredFields);
    if (validationResult !== true) return;

     if (!validateEmail(email)) {
        return sendGeneralResponse(res, false, 'Invalid email', 400);
    }

    if (!validatePhoneNumber(phone)) {
        return sendGeneralResponse(res, false, 'Invalid phone number', 400);
    }

     if (!req.file) {
        return sendGeneralResponse(res, false, 'Profile image is required', 400);
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            let message = '';
            if (existingUser.email === email) message += 'Email already registered. ';
            if (existingUser.phone === phone) message += 'Phone number already registered.';
            return sendGeneralResponse(res, false, message.trim(), 400);
        }

        // Upload profile image
        let profile_img_url = null;
        if (req.file) {
            profile_img_url = await uploadImage(req.file.buffer, 'profile_img_' + Date.now());
        }

        // Create and save the user
        const user = new User({ firstName, lastName, email, phone, DOB, gender, address, profile_img: profile_img_url, device_token });
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);
        


        user.refreshToken = refreshToken;
        await user.save();

        sendGeneralResponse(res, true, 'Registered successfully', 200,  { user, accessToken});
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return sendGeneralResponse(res, false, messages.join('. '), 400);
        }
        console.error('Registration error:', error);
        sendGeneralResponse(res, false, 'Internal server error', 500);
    }
};



// find user through token
const finduser = async (req, res) => {
    const { device_token } = req.query;

    // Check if the device_token is provided
    if (!device_token) {
        return sendGeneralResponse(res, false, "Device token is required", 400);
    }

    try {
        // Find the user using the device_token
        const user = await User.findOne({ device_token });

        // Check if the user is found
        if (user) {
            return sendGeneralResponse(res, true, "User found", 200, user);
        } else {
            return sendGeneralResponse(res, false, "User not found", 404); // 404 for not found
        }

    } catch (error) {
        return sendGeneralResponse(res, false, "Error finding user", 500, error); // 500 for server error
    }
};



// update device token
const updateDeviceToken = async (req, res) => {
    const { userId, device_token } = req.body;
  
    try {
        const user = await User.findById(userId);
        if (!user) {
         return sendGeneralResponse(res, false, "User not found", 404);
        }
        user.device_token = device_token;
        const updatedUser = await user.save();
         return sendGeneralResponse(res, true, "Device token updated successfully", 200, updatedUser);

     } catch (error) {
         return sendGeneralResponse(res, false, "Internal Server Error", 500, error);
     }
};





// Create a new shop
const createShop = async (req, res) => {
    try {
        const newShop = new Shop(
            req.body
        );

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



const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
const validatePhoneNumber = (phone) => /^\+?[1-9]\d{9}$/.test(String(phone));











const getAccessToken = async (req, res) => {
    const { refreshToken } = req.body;

   
    if (!refreshToken) {
      return sendGeneralResponse(res, false, 'Refresh token is missing', 400);
    }
  
    try {
       
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY);
  
      const user = await User.findById(decoded.id);
   
      if (!user || user.refreshToken !== refreshToken) {
        return sendGeneralResponse(res, false, 'Invalid refresh token', 403);
      }
  
      
      const newAccessToken = generateAccessToken(user._id);
      const newRefreshToken = generateRefreshToken(user._id);
  
      // Update user's refresh token in the database
      user.refreshToken = newRefreshToken;
      await user.save();
  
      // Return new access token
      sendGeneralResponse(res, true, 'Token refreshed successfully', 200, { accessToken: newAccessToken , refreshToken: newRefreshToken });
    } catch (error) {
      console.error('Error refreshing token:', error);
      sendGeneralResponse(res, false, 'Invalid or expired refresh token', 403);
    }
  };
  

const generateAccessToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
  };
  
  const generateRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET_KEY, { expiresIn: '7d' });  
  };



module.exports = { login, register, finduser , updateDeviceToken, createShop, getAccessToken };
 