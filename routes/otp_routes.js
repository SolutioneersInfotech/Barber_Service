
// const express = require('express');
// const router = express.Router();
// const otpController = require('../controller/otp_controller'); 

// router.post('/send-otp', otpController.sendotp);
// router.post('/verify-otp', otpController.verifyotp);

// module.exports = router;
const express = require("express");
 const { sendotp } = require("../controller/otp_controller.js");

const router = express.Router();

router.post('/send-otp', sendotp);
 
module.exports = router;