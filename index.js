const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./utils/db');
const errorHandler = require('./middleware/errorHandling');
const authRoutes = require('./routes/auth');
const otpRoutes = require('./routes/otp_routes');
const userInfoRoutes = require('./routes/Info_user_route');
const session = require('express-session');
const passport = require('passport');
const path = require('path');

dotenv.config();
connectDB();

const app = express();

// Middleware for parsing request bodies
app.use(express.json()); // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded bodies

// Serve static files from the "public" directory
app.use(express.static('public'));

// CORS configuration
app.use(cors({
    origin: 'http://localhost:5173',
    methods: 'GET, POST, PUT, DELETE, PATCH, HEAD',
    credentials: true,
}));

// // Routes
app.get('/home', (req, res) => {
    res.send('Hello world');
});

app.use('/api/auth', authRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/users', userInfoRoutes);

// Middleware for error handling
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});