const Otp = require('../models/otp_model');
const otpGenerator = require('otp-generator');
const { sendGeneralResponse } = require('../utils/responseHelper');
const { validatePhoneNumber } = require('../utils/validators');
const { sendSMS } = require('../utils/sms');



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

        //    sendGeneralResponse(res, true, "OTP sent successfully",  200,  {
        //     otp:otp,
        //  })
        
       



         const otpMessage = `${otp}`;  
         const otpResult = await sendSMS(phone, otpMessage);
         
         
          
         if (!otpResult.success) {
             console.error('OTP sending failed:', otpResult.error);
             return sendGeneralResponse(res, false, 'Failed to send OTP', 500);
         }


         sendGeneralResponse(res, true, 'OTP sent to phone no', 200);


    } catch (error) {
        console.error('Error in sending OTP:', error);
        sendGeneralResponse(res, false, "Error in sending OTP",  500,)
     }
};






// const sendPhoneOtp = async (req, res) => {
//     const { phone } = req.body;

//     if (!phone) {
//         return res.status(400).json({ success: false, message: 'phone no is required' });
//     }




//     try {
//          const otp = crypto.randomInt(100000, 999999).toString();
//         otpStore[phone] = otp; 

//          // await sendMail(email, 'Your OTP Code', `Your OTP code is ${otp}`,``);
     



//         const otpMessage = `Hi welcome to our service! Your OTP is: ${otp}`;  
// const otpResult = await sendSMS(phone, otpMessage);


 
// if (!otpResult.success) {
//     console.error('OTP sending failed:', otpResult.error);
//     return sendGeneralResponse(res, false, 'Failed to send OTP', 500);
// }



// sendGeneralResponse(res, true, 'OTP sent to phone no', 200);
//         // res.status(200).json({ success: true, message: 'OTP sent to email' });
//     } catch (error) {
//         console.error('Error sending OTP:', error);
// sendGeneralResponse(res, false, 'Internal server error', 500);

//         // res.status(500).json({ success: false, message: 'Internal server error' });
//     }
// };



 



module.exports = { sendotp };
