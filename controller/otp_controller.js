const Otp = require('../models/otp_model');
const otpGenerator = require('otp-generator');

// Function to send OTP
const sendotp = async (req, res) => {
    try {
        const { phone } = req.body;

        // Check if the phone number is provided
        if (!phone) {
            return res.status(400).json({ success: false, msg: 'Phone number is required' });
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

        // Simulate sending OTP (In a real app, you would send it via SMS or email)
        console.log(`OTP sent to ${phone}: ${otp}`);

        // Respond with success message
        return res.status(200).json({ success: true, msg: 'OTP sent successfully' });

    } catch (error) {
        console.error('Error in sending OTP:', error);

        // Respond with an error message
        return res.status(500).json({ success: false, msg: 'Error in sending OTP' });
    }
};

// Function to verify OTP
const verifyotp = async (req, res) => {
    try {
        const { phone, otp } = req.body;

        // Check if phone number and OTP are provided
        if (!phone || !otp) {
            return res.status(400).json({ success: false, msg: 'Phone number and OTP are required' });
        }

        // Find the OTP record for the provided phone number
        const otpRecord = await Otp.findOne({ phone });

        if (!otpRecord) {
            return res.status(404).json({ success: false, msg: 'Phone number not found' });
        }

        const { otp: storedOtp, otpExpiration } = otpRecord;

        // Check if the OTP matches
        if (storedOtp !== otp) {
            return res.status(400).json({ success: false, msg: 'Incorrect OTP' });
        }

        // Check if the OTP has expired
        if (new Date() > otpExpiration) {
            return res.status(400).json({ success: false, msg: 'OTP expired' });
        }

        // Respond with success message
        return res.status(200).json({ success: true, msg: 'OTP verified successfully' });

    } catch (error) {
        console.error('Error in verifying OTP:', error);

        // Respond with an error message
        return res.status(500).json({ success: false, msg: 'Error in verifying OTP' });
    }
};

module.exports = { sendotp, verifyotp };
