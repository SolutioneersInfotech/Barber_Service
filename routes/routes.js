const express = require('express');
const multer = require('multer');
const { register, finduser, updateDeviceToken, login, createShop, getAccessToken,  } = require('../controller/authcontroller.js');
const verifyToken  = require('../middleware/authmiddleware.js');
const { getNearbyShops } = require('../controller/shop_near_by.js');
const { getPopularShops } = require('../controller/popular_shops.js');
const {  sendPhoneOtp, sendEmailOtp, verifyEmailOtp } = require("../controller/otp_controller.js");
const getAdds = require('../controller/adds.js');
const { shopdetails} = require('../controller/shops_controller.js');
const { addBookmark,getBookmarkedShops, removeBookmark } = require('../controller/bookmark.js');


const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();


// auth route
router.post('/register', upload.single('profile_img'), register);
router.post('/login',login);
router.post('/getNewAccessToken', getAccessToken); 
router.post("/sendEmailOtp", sendEmailOtp);
router.post("/verifyEmailOtp", verifyEmailOtp);
router.post("/sendPhoneOtp", sendPhoneOtp);


// find user through device token
router.get('/finduser', finduser); 
router.put('/update_device_token', updateDeviceToken);  


// get shops
router.get('/shops/nearBy', verifyToken, getNearbyShops);  
router.get('/shops/mostPopular', getPopularShops); 
 


//shop routes
router.get('/shopDetail/:id', shopdetails);
router.post('/createshop', createShop);
router.get('/getAdds', getAdds); 



//bookmark routes
router.post('/bookmark/:shopId', addBookmark);
router.delete('/bookmark/:shopId', removeBookmark);
router.get('/bookmark', getBookmarkedShops);



module.exports = router;
