// controllers/otp_controller.js

const otp_model = require("../models/otp_model.js");
const otpgenerator = require("otp-generator");

const sendotp = async ({ phone }) => {
    try {
        const otp = otpgenerator.generate(6, {
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false
        });

        const cDate = new Date();

        await otp_model.findOneAndUpdate(
            { phone },
            { otp, otpExpiration: new Date(cDate.getTime() + 15 * 60 * 1000) }, // 15 minutes expiration
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Simulate sending OTP (In a real app, you would send it via SMS or email)
        console.log(`OTP sent to ${phone}: ${otp}`);

        return { success: true, msg: `${otp}`};
    } catch (error) {
        console.error(error);
        return { success: false, msg: "Error in sending OTP" };
    }
};

const verifyotp= async(req,res,phone)=>
    {
    const {otp}=req.body
    try {
        const otpRecord = await otp_model.findOne({ phone });

        if (!otpRecord) {
            return { success: false, msg: "Phone number not found" };
        }
        
        const { otp: storedOtp, otpExpiration } = otpRecord;
        
        console.log(`msg  ${otp}  msg-store ${storedOtp}`)
        if (storedOtp !== otp) {
            
            return { success: false, msg: "Incorrect OTP" };
        }

        if (new Date() > otpExpiration) {
            return { success: false, msg: "OTP expired" };
        }
        
        return { success: true, msg: "OTP verified successfully" };
    } catch (error) {
        console.error(error);
        return { success: false, msg: "Error in verifying OTP" };
    }
};


module.exports = {
    sendotp,
    verifyotp
};
