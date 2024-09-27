const Otp = require('../models/otp_model');
const otpGenerator = require('otp-generator');
const { sendGeneralResponse } = require('../utils/responseHelper');
const { validatePhoneNumber, validateEmail } = require('../utils/validators');
const { sendSMS } = require('../utils/sms');
const { sendMail } = require('../utils/mailer');
const bcrypt = require('bcrypt');
  const crypto = require('crypto');
  



 
  const sendEmailOtp = async (req, res) => {
      const { email } = req.body;
  
      if (!email) {
           sendGeneralResponse(res, false, 'Email is required', 400);
       }


         
     if (!validateEmail(email)) {
        return sendGeneralResponse(res, false, 'Invalid email', 400);
    }

  
      try {
    
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpHash = await bcrypt.hash(otp, 10);
        const expiresAt = Date.now() + 15 * 60 * 1000;
     
 
        await Otp.deleteMany({ email });


        const otpEntry = await Otp.findOneAndUpdate(
            { email },
            { otpHash, expiresAt },
            { upsert: true, new: true } 
        );
    
          const subject = 'Your OTP Code';
      
        


        const html = `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
            <div style="background-color: white; max-width: 600px; margin: 20px auto; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                <div style="background-color: rgb(255, 151, 5); padding: 10px; color: white; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1>Your OTP Code</h1>
                </div>
                <div style="padding: 20px; background-color: rgba(247, 177, 79, 0.25); border-radius: 10px;">
                    <h2 style="color: #333;">Hello!</h2>
                    <p style="color: #333;">Your One-Time Password (OTP) is:</p>
                    <h1 style="font-size: 2em; color: rgb(255, 151, 5);">${otp}</h1>
                    <p style="color: #333;">This OTP is valid for the next 15 minutes. Please enter it on the verification page to proceed.</p>
                    <p style="color: #333;">If you did not request this OTP, please ignore this email.</p>
                </div>
                <div style="margin-top: 20px; text-align: center; color: #777; font-size: 12px;">
                    <p>&copy; 2024 Bostelly Salon. All Rights Reserved.</p>
                </div>
            </div>
        </div>
    `;
    
  
               await sendMail(email, subject, ``, html);
  
  
           sendGeneralResponse(res, true, 'OTP sent to email', 200);

      } catch (error) {
          console.error('Error sending OTP:', error);
          sendGeneralResponse(res, false, 'Internal server error', 500);
        }
  };
  
  
  
  
  
  
  
    
  
  const sendPhoneOtp = async (req, res) => {
      const { phone } = req.body;
  
      if (!phone) {
          return  sendGeneralResponse(res, false, "phone no is required",  400,)
      }
  
      if (!validatePhoneNumber(phone)) {
        return  sendGeneralResponse(res, false, "Invalid phone number",  400,)
        }

  
  
      try {
const otp = crypto.randomInt(100000, 999999).toString();
const otpHash = await bcrypt.hash(otp, 10);
const expiresAt = Date.now() + 15 * 60 * 1000; 



await Otp.deleteMany({ phone });


const otpEntry = await Otp.findOneAndUpdate(
    { phone },
    { otpHash, expiresAt , email: null},
    { upsert: true, new: true }  
);

 
// these line use when send otp in mobile phone

// const otpMessage = `${otp}`;  

// const otpResult = await sendSMS(phone, otpMessage);
//   if (!otpResult.success) {
//       console.error('OTP sending failed:', otpResult.error);
//       return sendGeneralResponse(res, false, 'Failed to send OTP', 500);
//   }


  console.log(otp);
  sendGeneralResponse(res, true, 'OTP sent to phone no ', 200 , {otp});
       } catch (error) {
          console.error('Error sending OTP:', error.message || error);
  sendGeneralResponse(res, false, 'Internal server error', 500);
  
       }
  };
  




const verifyEmailOtp = async (req, res) => {
    const { email, otp } = req.body;

    if (!email) {
        return sendGeneralResponse(res, false, 'email is required', 400);
     }

     if (!otp) {
        return sendGeneralResponse(res, false, 'OTP is required', 400);
     }


    if (!validateEmail(email)) {
        return sendGeneralResponse(res, false, 'Invalid email', 400);
    }


    try {
         const otpEntry = await Otp.findOne({ email });

        if (!otpEntry) {
            return sendGeneralResponse(res, false, 'Please request a new OTP', 400); 
         }

        const { otpHash, expiresAt } = otpEntry;

         
        if (Date.now() > expiresAt) {
            return sendGeneralResponse(res, false, 'The OTP has expired. Please request a new one.', 400);  
         }

         const isValid = await bcrypt.compare(otp, otpHash);
        if (isValid) {
            
             await Otp.deleteMany({ email });

            return sendGeneralResponse(res, true, 'OTP verified successfully', 200);    
 
        } else {
            return   sendGeneralResponse(res, false, 'Invalid OTP', 400); 
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
         sendGeneralResponse(res, false, 'Internal server error', 500); 
    }
};







const verifyPhoneOtp = async (phone, otp) => {
 
    const otpEntry = await Otp.findOne({ phone });

    if (!otpEntry) {
        return { status: false, message: 'Please request a new OTP' };
    }
    const { otpHash, expiresAt, isUsed } = otpEntry;

    
    if (Date.now() > expiresAt) {
        return sendGeneralResponse(res, false, 'The OTP has expired. Please request a new one.', 400);    
    }
 
    const isValid = await bcrypt.compare(otp, otpHash);

    if (!isValid) {
        return { status: false, message: 'Invalid OTP' };
    }

    await Otp.deleteMany({ phone });

    return { status: true };
};


module.exports = { sendEmailOtp   , sendPhoneOtp , verifyEmailOtp  , verifyPhoneOtp };
