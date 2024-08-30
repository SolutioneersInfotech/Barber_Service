const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./utils/db');
const errorHandler = require('./middleware/errorhandling');

//routes

const authRoutes = require('./routes/auth');
const otpRoutes = require('./routes/otp_routes'); 
const shopsdetail = require('./routes/shopdetail_route')
const userInfoRoutes = require('./routes/Info_user_route');

//model

const User= require('./models/User_model')

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
app.get('/', (req, res) => {
    res.send('Welcome to Barber App');
});

app.get('/findusers', async (req, res) => {
    const { device_token } = req.query;
  
    try {
      // Find the user by device token
      const user = await User.findOne({ device_token });
  
      // If user is found and device token matches
      if (user) {
        console.log('Device token found for user:', user);
        return res.status(200).json({ message: 'Device token found for user' });
      }
  
      // If user is not found
      return res.status(404).json({ message: 'User never logged in' });
    } catch (error) {
      console.error('Error finding user by device token:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
  app.put('/devicetoken', async (req, res)=> {
    const { userId, device_token } = req.body;
  
    try {
      // Find the user by their ID
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Check if the new device token matches the existing one
      if (user.device_token === device_token) {
        return res.status(400).json({ message: 'Device token is already up to date' });
      }
  
      // Update the device token
      user.device_token = device_token;
  
      // Save the updated user
      const updatedUser = await user.save();
  
      console.log('Device token updated for user:', updatedUser);
      return res.status(200).json({ message: 'Device token updated successfully', user: updatedUser });
    } catch (error) {
      console.error('Error updating device token:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
  
app.use('/auth', authRoutes);
app.use('/otp', otpRoutes);
app.use('/users', userInfoRoutes);
app.use('/shopdetails', shopsdetail);

// Middleware for error handling
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});