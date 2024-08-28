const express = require('express');
const { register, login, createShop, getNearbyShops, getPopularShops } = require('../controller/authcontroller.js');
const verifyToken = require('../middleware/authmiddleware.js');
const  { updateUserById } = require('../controller/userinfo.js')

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/login/update', updateUserById);

// Protected routes
router.post('/createshop', createShop); // Protect shop creation
router.get('/shops/nearby', getNearbyShops); // Protect fetching nearby shops
router.get('/shops/popular', getPopularShops); // Protect fetching popular shops



// Protected profile route
router.get('/profile', verifyToken, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});

module.exports = router;
