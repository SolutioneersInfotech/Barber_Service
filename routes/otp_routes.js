// const express = require('express');
// const router = express.Router();
// const otpController = require('../controller/otp_controller'); 

// router.post('/send-otp', otpController.sendotp);
// router.post('/verify-otp', otpController.verifyotp);

// module.exports = router;
const express = require("express");
const { validateSendOtp, validateVerifyOtp } = require("../utils/otpvalidator.js");
const { sendotp, verifyotp } = require("../controller/otp_controller.js");

const router = express.Router();

router.post('/send-otp', validateSendOtp, sendotp);
router.post('/verify-otp', validateVerifyOtp, verifyotp);

module.exports = router;
