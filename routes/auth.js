
const express = require('express');
const { register, login } = require('../controller/authcontroller.js');
const verifyToken = require('../middleware/authmiddleware.js');
const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected route
router.get('/profile', verifyToken, (req, res) => {
     res.json({ message: 'This is a protected route', user: req.user });
});

module.exports = router;