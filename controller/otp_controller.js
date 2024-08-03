const express = require("express");
const dotenv = require('dotenv');
const otp_model = require("../models/otp_model.js");
const otpgenerator = require("otp-generator");
dotenv.config();

const sendotp = async (req, res) => {
    try {
        const otp = otpgenerator.generate(6, {
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false
        });

        const { phone } = req.body;
        
        const cDate = new Date();

        await otp_model.findOneAndUpdate(
            { phone },
            { otp, otpExpiration: new Date(cDate.getTime() + 15 * 60 * 1000) }, // 15 minutes expiration
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // If Twilio integration is needed:
        // await twilioClient.messages.create({
        //     from: process.env.TWILIO_PHONE_NUMBER,
        //     to: phone,
        //     body: `Your OTP is ${otp} sent from Barber_shop for verification.`
        // });

        return res.status(200).json({
            success: true,
            msg: `OTP sent successfully ${otp}`
        });

    } catch (error) {
        console.error(error);
        return res.status(400).json({
            success: false,
            msg: "Error in sending OTP"
        });
    }
};

const verifyotp = async (req, res) => {
    try {
        const { phone, otp } = req.body;

        const otpRecord = await otp_model.findOne({ phone });

        if (!otpRecord) {
            return res.status(404).json({
                success: false,
                msg: "Phone number not found"
            });
        }

        const { otp: storedOtp, otpExpiration } = otpRecord;

        if (storedOtp !== otp) {
            return res.status(400).json({
                success: false,
                msg: "Incorrect OTP"
            });
        }

        if (new Date() > otpExpiration) {
            return res.status(400).json({
                success: false,
                msg: "OTP expired"
            });
        }

        return res.status(200).json({
            success: true,
            msg: "OTP verified successfully"
        });

    } catch (error) {
        console.error(error);
        return res.status(400).json({
            success: false,
            msg: "Error in verifying OTP"
        });
    }
};

module.exports = {
    sendotp,
    verifyotp
};
