// const jwt = require('jsonwebtoken');
// require('dotenv').config(); // Load environment variables

// const verifyToken = (req, res, next) => {
//     // Get token from headers
//     const token = req.headers['authorization']?.split(' ')[1]; // Assumes Bearer token format

//     if (!token) {
//         return res.status(401).json({ error: 'No token provided' });
//     }

//     jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//         if (err) {
//             return res.status(401).json({ error: 'Invalid token' });
//         }
        
//         // Add user info to request object
//         req.user = decoded;
//         next();
//     });
// };

// module.exports = verifyToken;

const jwt = require('jsonwebtoken');
const User = require('../models/User_model'); // Adjust the path as necessary
require('dotenv').config(); // Load environment variables

const verifyToken = async (req, res, next) => {
    try {
        // Get token from headers
        const token = req.headers['authorization']?.split(' ')[1]; // Assumes Bearer token format

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        // Decode the token without verification to extract the user ID
        const decoded = jwt.decode(token);

        if (!decoded) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Find the user by ID
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the token matches the one stored in the user model
        if (user.token !== token) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Verify the token using the secret
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ error: 'Invalid token' });
            }

            // Add user info to request object
            req.user = decoded;
            next();
        });

    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = verifyToken;
