const Otp = require('../models/otp_model');
const otpGenerator = require('otp-generator');
const { sendGeneralResponse } = require('../utils/responseHelper');
const { validatePhoneNumber } = require('../utils/validators');



 const sendotp = async (req, res) => {
     try {
        const { phone } = req.body;


         if (!phone) {
            return  sendGeneralResponse(res, false, "Phone number is required",  400,)
        }


        if (!validatePhoneNumber(phone)) {
          return  sendGeneralResponse(res, false, "Invalid phone number",  400,)
          }

        // Generate a 6-digit OTP
        const otp = otpGenerator.generate(6, {
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false
        });

        // Set OTP expiration time (15 minutes)
        const cDate = new Date();
        const otpExpiration = new Date(cDate.getTime() + 15 * 60 * 1000);

        // Update or insert OTP for the phone number
        await Otp.findOneAndUpdate(
            { phone },
            { otp, otpExpiration },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

console.log("hello");
          sendGeneralResponse(res, true, "OTP sent successfully",  200,  {
            otp:otp,
         })
        
       
    } catch (error) {
        console.error('Error in sending OTP:', error);
        sendGeneralResponse(res, false, "Error in sending OTP",  500,)
     }
};

// // verify OTP
// const verifyotp = async (req, res) => {
//     try {
//         const { phone, otp } = req.body;

//         if (!phone || !otp) {
//             res.status(400).json({
//                 success: false, msg: 'Phone number and OTP are required', data:[]})
//          }

//         // Find the OTP record for the provided phone number
//         const otpRecord = await Otp.findOne({ phone });

//         if (!otpRecord) {
         
//             res.status(400).json({
//                 success: false, msg: 'Phone number not found', data:[]})
//         }

//         const { otp: storedOtp, otpExpiration } = otpRecord;

//         // Check if the OTP matches
//         if (storedOtp !== otp) {
//             res.status(400).json({
//                 success: false, msg: 'Incorrect OTP', data:[]})
//         }

//         // Check if the OTP has expired
//         if (new Date() > otpExpiration) {
//             res.status(400).json({
//                 success: false, msg: 'OTP expired', data:[]})
           
//         }

//         // Respond with success message
//         return { success: true, status: 200, msg: 'OTP verified successfully' };

//     } catch (error) {
//         console.error('Error in verifying OTP:', error);

//         // Respond with an error message
//         return { success: false, status: 500, msg: 'Error in verifying OTP' };
//     }
// };

module.exports = { sendotp };
