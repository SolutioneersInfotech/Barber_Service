const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./utils/db');
const errorHandler = require('./middleware/errorhandling');


//routes
const chats = require('./routes/message')
const authRoutes = require('./routes/routes');
const payment= require('./routes/payment') 
const userInfoRoutes = require('./routes/Info_user_route');
const bookingRoute=require('./routes/booking_route')

//model
// const Review= require('./models/reviews_model')
// const User= require('./models/User_model')
// const Customer = require('./models/cust_models')
// const Shop = require('./models/shop_model')

const customer= require('./controller/customer_controller')
const review= require('./controller/review_controller')

const session = require('express-session');
const passport = require('passport');
const path = require('path');
const verifyToken = require('./middleware/authmiddleware');

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
app.get('', (req, res) => {
    res.send('Welcome to Barber App');
});

 
  
app.use('', authRoutes);
app.use('/chats', chats);
app.use('/payment', payment);
  app.use('/users', userInfoRoutes);
 app.use('/bookings', bookingRoute );    // booking is in build 

// Middleware for error handling
app.use(errorHandler);

app.post('/customer', customer.create )

app.post('/review', review.create  )



const PORT = process.env.PORT || 3001; 
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});