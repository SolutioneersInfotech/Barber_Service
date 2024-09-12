const express = require('express');
const { register, finduser, updateDeviceToken, login, createShop,  } = require('../controller/authcontroller.js');
const verifyToken = require('../middleware/authmiddleware.js');
const { getNearbyShops } = require('../controller/shop_near_by.js');
const { getPopularShops } = require('../controller/popular_shops.js');
const { sendotp } = require("../controller/otp_controller.js");
const getAdds = require('../controller/adds.js');
const { shopdetails } = require('../controller/shops_controller.js');
const { addBookmark,getBookmarkedShops, removeBookmark } = require('../controller/bookmark.js');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login',login);
router.get('/shops/nearBy', getNearbyShops);  
router.get('/shops/mostPopular', getPopularShops); 
router.put('/update_device_token', updateDeviceToken);  
router.post('/send-otp', sendotp);
router.get('/finduser', finduser); 
router.get('/getAdds', getAdds); 

//bookmark routes

router.post('/bookmark/:shopId', addBookmark);

// Route to remove a bookmark
router.delete('/bookmark/:shopId', removeBookmark);

// Route to get all bookmarked shops
router.get('/bookmark', getBookmarkedShops);

router.get('/shopDetail/:id', shopdetails);



 router.post('/createshop', createShop);

 
 
// Protected profile route
// router.get('/profile', verifyToken, (req, res) => {
//     res.json({ message: 'This is a protected route', user: req.user });
// });

module.exports = router;
