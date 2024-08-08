const Otp = require('../models/otp_model');
const otpGenerator = require('otp-generator');

const sendotp = async (req,res) => {
    try {

        const {phone}=req.body
        const otp = otpGenerator.generate(6, {
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false
        });

        const cDate = new Date();

        await Otp.findOneAndUpdate(
            { phone },
            { otp, otpExpiration: new Date(cDate.getTime() + 15 * 60 * 1000) }, // 15 minutes expiration
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Simulate sending OTP (In a real app, you would send it via SMS or email)
        console.log(`OTP sent to ${phone}: ${otp}`);

        return { success: true, msg: 'OTP sent successfully' };
    } catch (error) {
        console.error(error);
        return { success: false, msg: 'Error in sending OTP' };
    }
};

const verifyotp = async ({ phone, otp }) => {
    try {
        const otpRecord = await Otp.findOne({ phone });

        if (!otpRecord) {
            return { success: false, msg: 'Phone number not found' };
        }

        const { otp: storedOtp, otpExpiration } = otpRecord;

        if (storedOtp !== otp) {
            return { success: false, msg: 'Incorrect OTP' };
        }

        if (new Date() > otpExpiration) {
            return { success: false, msg: 'OTP expired' };
        }

        return { success: true, msg: 'OTP verified successfully' };
    } catch (error) {
        console.error(error);
        return { success: false, msg: 'Error in verifying OTP' };
    }
};

module.exports = { sendotp, verifyotp };