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
const { verifyPhoneOtp } = require('./otp_controller');
const { sendMail } = require('../utils/mailer');

const upload = multer({ storage: multer.memoryStorage() });

 



// user  Login 
const login = async (req, res) => {
    const { phone, otp } = req.body;
    console.log("asasas");

    if (!phone) {
        return sendGeneralResponse(res, false, "Phone number field is required", 400);
    }
 



    if (!validatePhoneNumber(phone)) {
        return sendGeneralResponse(res, false, 'Invalid phone number', 400);
    }

    if (!otp) {
        return sendGeneralResponse(res, false, "OTP field is required", 400);
    }
 
    const trimmedOtp = otp.trim();

    if (trimmedOtp.length !== 6 || !/^\d{6}$/.test(trimmedOtp)) {
        return sendGeneralResponse(res, false, "Invalid OTP", 400);
    }
 
    try {
        const verificationResult = await verifyPhoneOtp(phone, otp);

        if (verificationResult.status) {
            const user = await User.findOne({ phone });
            if (!user) {
                return sendGeneralResponse(res, false, 'User not registered', 400);
            }

            const accessToken = generateAccessToken(user._id);
            const refreshToken = generateRefreshToken(user._id);
            
    
    
            user.refreshToken = refreshToken;
            await user.save();
     
           
            return sendGeneralResponse(res, true, 'Login successful', 200, { user,accessToken });
        } else {
            return sendGeneralResponse(res, false, verificationResult.message, 400);
        }
    } catch (error) {
        console.error('Login error:', error);
        return sendGeneralResponse(res, false, "Internal server error", 500);
    }
};


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
        const user = new User({firstName,
                lastName,
                email,
                phone,
                DOB,
                gender,
                profile_img: profile_img_url,
                address: {
                    houseNo: address.houseNo,
                    street: address.street,
                    city: address.city,
                    state: address.state,
                    pin: address.pin,
                    country: address.country,
                },
                device_token, });
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);
        


        user.refreshToken = refreshToken;
        await user.save();

        const subject = 'Welcome to Solutioneers Infotech!';

    const html = `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
        <div style="background-color: white; max-width: 600px; margin: 20px auto; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
            <div style="background-color: rgb(255, 151, 5); padding: 10px; color: white; text-align: center; border-radius: 10px 10px 0 0;">
                <h1>Welcome to Our Service!</h1>
            </div>
            <div style="padding: 20px; background-color: rgba(247, 177, 79, 0.1); border-radius: 10px;">
                <h2 style="color: #333;">Hello, ${firstName} ${lastName}!</h2>
                <p>We are thrilled to have you on board. Thank you for registering with us!</p>
                <p>You can now start using all the services we offer. If you have any questions, feel free to reach out to our support team.</p>
                <p>We hope you have a great experience with us!</p>
                <a href="https://www.linkedin.com/company/solutioneers-infotech" style="margin: 0 5px; display: inline-block;">
                    <img src="https://img.icons8.com/color/48/000000/linkedin.png" alt="LinkedIn" style="width: 30px;" />
                </a>
                <a href="https://www.facebook.com/profile.php?id=61562639168028&ref=xav_ig_profile_web" style="margin: 0 5px; display: inline-block;">
                    <img src="https://img.icons8.com/color/48/000000/facebook-new.png" alt="Facebook" style="width: 30px;" />
                </a>
                <a href="https://www.instagram.com/solutioneersinfotech" style="margin: 0 5px; display: inline-block;">
                    <img src="https://img.icons8.com/color/48/000000/instagram-new.png" alt="Instagram" style="width: 30px;" />
                </a>
                <a href="https://solutioneersinfotech.in" style="margin: 0 5px; display: inline-block;">
                    <img src="https://img.icons8.com/color/48/000000/domain.png" alt="Website" style="width: 30px;" />
                </a>
                 <a href="mailto:info@solutioneers.in">
                        <img src="https://img.icons8.com/ios-filled/24/FF69B4/support.png" alt="Support" />
                    </a>
                </div>
                <div style="margin-top: 20px; text-align: center; color: #777; font-size: 12px;">
                    <p>&copy; 2024 Our Service. All Rights Reserved.</p>
                </div>
            </div>
        </div>
    </div>
`;


// const html = `
//         <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
//             <div style="background-color: white; max-width: 600px; margin: 20px auto; padding: 20px; border-radius: 15px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); transition: box-shadow 0.3s ease;">
//                 <div style="background-color: rgb(255, 151, 5); padding: 15px; color: white; text-align: center; border-radius: 15px 15px 0 0; transition: background-color 0.3s ease;">
//                     <h1 style="font-size: 28px; font-weight: bold;">Welcome to Our Service!</h1>
//                 </div>
//                 <div style="padding: 25px; background-color: rgba(247, 177, 79, 0.1); border-radius: 0 0 15px 15px;">
//                     <h2 style="color: #333; font-size: 22px;">Hello, ${firstName} ${lastName}!</h2>
//                     <p style="font-size: 16px; color: #555;">We are thrilled to have you on board. Thank you for registering with us!</p>
//                     <p style="font-size: 16px; color: #555;">You can now start using all the services we offer. If you have any questions, feel free to reach out to our support team.</p>
//                     <p style="font-size: 16px; color: #555;">We hope you have a great experience with us!</p>
//                     <a href="https://solutioneersinfotech.in" 
//                         style="display: inline-block; background-color: rgb(255, 151, 5); color: white; padding: 12px 18px; 
//                         text-decoration: none; border-radius: 6px; font-size: 16px; margin-top: 20px; transition: background-color 0.3s ease;">
//                         Visit Our Website
//                     </a>
//                     <p style="margin-top: 30px; font-size: 16px; color: #777;">Follow us on social media:</p>
//                     <div style="text-align: center; margin-top: 15px;"> 
//                         <a href="https://www.facebook.com/profile.php?id=61562639168028&ref=xav_ig_profile_web" 
//                             style="margin-right: 15px; transition: transform 0.3s ease;">
//                             <img src="https://img.icons8.com/ios-filled/30/FF69B4/facebook-new.png" alt="Facebook" style="filter: drop-shadow(0 2px 3px rgba(0,0,0,0.2));" />
//                         </a>
//                         <a href="https://www.instagram.com/solutioneersinfotech" 
//                             style="margin-right: 15px; transition: transform 0.3s ease;">
//                             <img src="https://img.icons8.com/ios-filled/30/FF69B4/instagram-new.png" alt="Instagram" style="filter: drop-shadow(0 2px 3px rgba(0,0,0,0.2));" />
//                         </a>
//                         <a href="mailto:info@solutioneers.in" style="margin-right: 15px; transition: transform 0.3s ease;">
//                             <img src="https://img.icons8.com/ios-filled/30/FF69B4/support.png" alt="Support" style="filter: drop-shadow(0 2px 3px rgba(0,0,0,0.2));" />
//                         </a>
//                         <a href="https://www.linkedin.com/company/solutioneers-infotech" 
//                             style="transition: transform 0.3s ease;">
//                             <img src="https://img.icons8.com/ios-filled/30/FF69B4/linkedin.png" alt="LinkedIn" style="filter: drop-shadow(0 2px 3px rgba(0,0,0,0.2));" />
//                         </a>
//                     </div>
//                     <div style="margin-top: 25px; text-align: center; color: #777; font-size: 12px;">
//                         <p>&copy; 2024 Our Service. All Rights Reserved.</p>
//                     </div>
//                 </div>
//             </div>
//         </div>
//         <style>
//             div:hover {
//                 box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
//             }
//             a:hover {
//                 background-color: rgb(255, 120, 5);
//             }
//             img:hover {
//                 transform: scale(1.1);
//             }
//         </style>
//     `;
         await sendMail(email, subject, ``, html);
        


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
 