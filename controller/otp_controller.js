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

           sendGeneralResponse(res, true, "OTP sent successfully",  200,  {
            otp:otp,
         })
        
       
    } catch (error) {
        console.error('Error in sending OTP:', error);
        sendGeneralResponse(res, false, "Error in sending OTP",  500,)
     }
};
module.exports = { sendotp };
