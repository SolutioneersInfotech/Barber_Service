const express = require('express');
const shopController = require('../controller/shops_controller.js')
const verifyToken = require('../middleware/authmiddleware');


const router = express.Router();


// router.get('/:id', shopController.shopdetails);
router.get('/shop/:id', verifyToken , shopController.shopdetails);



// // Route for about shop
// router.get('/about/:id', shopController.about);

// // Route for services
// router.get('/services/:id', shopController.services);

// // Route for packages
// router.get('/packages/:id', shopController.packages);

// // Route for gallery
// router.get('/gallery/:id', shopController.gallery);

// // Route for reviews
// router.get('/review/:id', shopController.review);

module.exports = router;