const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables

const verifyToken = (req, res, next) => {
    // Get token from headers
    const token = req.headers['authorization']?.split(' ')[1]; // Assumes Bearer token format

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        
        // Add user info to request object
        req.user = decoded;
        next();
    });
};

module.exports = verifyToken;
