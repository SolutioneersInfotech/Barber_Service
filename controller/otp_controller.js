const express = require("express");
const dotenv = require('dotenv');
const otp_model = require("../models/otp_model.js");
const otpgenerator = require("otp-generator");
dotenv.config();
// const twilio = require("twilio");

// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const twilioClient = new twilio(accountSid, authToken);

const sendotp = async (req, res) => {
    try {
        const otp = otpgenerator.generate(6, {
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false
        });

        const { phoneNumber } = req.body;
        const cDate = new Date();

        await otp_model.findOneAndUpdate(
            { phoneNumber },
            { otp, otpExpiration: new Date(cDate.getTime() + 15 * 60 * 1000) }, // Set expiration to 15 minutes from now
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // // Send OTP via Twilio
        // await twilioClient.messages.create({
        //     from: process.env.TWILIO_PHONE_NUMBER,
        //     to: phoneNumber,
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
        const { phoneNumber, otp } = req.body;
        const otpRecord = await otp_model.findOne({ phoneNumber });

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


// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
// const express = require("express");
// const dotenv = require('dotenv');
// const otp_model = require("../models/otp_model.js");
// const otpgenerator = require("otp-generator");
// dotenv.config();
// const twilio = require('twilio');

// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const verifyServiceSid = 'VA5b1a3b8b4955b78904888f7943fb6f16'; // Replace with your Twilio Verify Service SID
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = require('twilio')(accountSid, authToken);

// const client = twilio(accountSid, authToken);

// const sendotp = async (req, res) => {
//     try {
//         const { phoneNumber } = req.body;
//         const otp = otpgenerator.generate(6, {
//             lowerCaseAlphabets: false,
//             upperCaseAlphabets: false,
//             specialChars: false
//         });

//         // Store OTP in the database with expiration
//         const cDate = new Date();
//         await otp_model.findOneAndUpdate(
//             { phoneNumber },
//             { otp, otpExpiration: new Date(cDate.getTime() + 15 * 60 * 1000) }, // 15 minutes expiration
//             { upsert: true, new: true, setDefaultsOnInsert: true }
//         );

//         // Send OTP using Twilio Verify API
//         // await client.verify.v2.services(verifyServiceSid)
//         //     .verifications
//         //     .create({ to: phoneNumber, channel: 'sms' });

        
//         // client.messages
//         //       .create({from: process.env.TWILIO_PHONE_NUMBER, body: `Hi there your ${otp}`, to: phoneNumber })
//         //       .then(message => console.log(message.sid));


//         // await client.messages.create({
//         //   body:`Your OTP is: ${otp}`,
//         //   to: phoneNumber,
//         //   from: process.env.TWILIO_PHONE_NUMBER,
//         // });

//         return res.status(200).json({
//             success: true,
//             msg: `OTP sent successfully`
//         });

//     } catch (error) {
//         console.error('Error sending OTP:', error);
//         return res.status(400).json({
//             success: false,
//             msg: "Error in sending OTP"
//         });
//     }
// };

// const verifyotp = async (req, res) => {
//     try {
//         const { phoneNumber, otp } = req.body;

//         // Check if OTP exists in the database
//         const otpRecord = await otp_model.findOne({ phoneNumber });
//         if (!otpRecord) {
//             return res.status(404).json({
//                 success: false,
//                 msg: "OTP record not found"
//             });
//         }

//         const { otp: storedOtp, otpExpiration } = otpRecord;

//         // Verify the OTP
//         if (storedOtp !== otp) {
//             return res.status(400).json({
//                 success: false,
//                 msg: "Incorrect OTP"
//             });
//         }

//         if (new Date() > otpExpiration) {
//             return res.status(400).json({
//                 success: false,
//                 msg: "OTP expired"
//             });
//         }

//         return res.status(200).json({
//             success: true,
//             msg: "OTP verified successfully"
//         });

      

//     } catch (error) {
//         console.error('Error verifying OTP:', error);
//         return res.status(400).json({
//             success: false,
//             msg: "Error in verifying OTP"
//         });
//     }
// };

// module.exports = {
//     sendotp,
//     verifyotp
// };
