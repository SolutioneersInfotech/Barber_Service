const Otp = require('../models/otp_model');
const User = require('../models/User_model');
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
         // Fetch the user details using the email
         const user = await User.findOne( {email } );
         if (!user) {
             return sendGeneralResponse(res, false, 'User not found', 404);
         }

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
    <div style="background-color: white; max-width: 600px; margin: 20px auto; padding: 20px; border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); text-align: center;">
        
        <!-- Header Section with OTP title -->
        <div style="background-color: rgb(255, 151, 5); padding: 15px; color: white; border-radius: 12px 12px 0 0;">
            <h1 style="font-size: 24px; font-weight: bold;">Your OTP Code</h1>
        </div>
        
        <!-- Body Section with OTP and message -->
        <div style="padding: 20px; background-color: rgba(247, 177, 79, 0.15);">
            <h2 style="color: #333; font-size: 20px;">Hello, ${user.firstName}!</h2>
            <p style="font-size: 15px; color: #555;">Your One-Time Password (OTP) is:</p>
            <h1 style="font-size: 32px; color: rgb(255, 151, 5); letter-spacing: 2px;">${otp}</h1>
            <p style="font-size: 14px; color: #555;">This OTP is valid for the next 15 minutes. Please enter it on the verification page to proceed.</p>
            <p style="font-size: 14px; color: #555;">If you did not request this OTP, please ignore this email.</p>
        </div>

        <!-- Social Media Section -->
        <div style="margin-top: 20px;">
            <p style="color: #777; font-size: 14px;">Follow us:</p>
            <div style="display: inline-block;">
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
        </div>

        <!-- Footer Section -->
        <div style="margin-top: 20px; color: #777; font-size: 12px;">
            <p>&copy; 2024 Salon. All Rights Reserved.</p>
        </div>
    </div>
</div>

<!-- Style for email -->
<style>
    img:hover { transform: scale(1.1); }
</style>


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
