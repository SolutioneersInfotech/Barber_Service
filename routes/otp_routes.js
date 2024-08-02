const express = require('express');
const router = express.Router();
const otpController = require('../controller/otp_controller'); 

router.post('/send-otp', otpController.sendotp);
router.post('/verify-otp', otpController.verifyotp);

module.exports = router;
