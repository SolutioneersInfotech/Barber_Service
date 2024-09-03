const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./utils/db');
const errorHandler = require('./middleware/errorhandling');

//routes
 
const authRoutes = require('./routes/routes');
const otpRoutes = require('./routes/otp_routes'); 
const shopsdetail = require('./routes/shopdetail_route')
const userInfoRoutes = require('./routes/Info_user_route');

//model
const Review= require('./models/reviews_model')
const User= require('./models/User_model')
const Customer = require('./models/cust_models')
const Shop = require('./models/shop_model')

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
app.get('', (req, res) => {
    res.send('Welcome to Barber App');
});

 
  
app.use('', authRoutes);
  app.use('/users', userInfoRoutes);
 app.use('/shopdetails', shopsdetail);

// Middleware for error handling
app.use(errorHandler);

app.post('/customer', async(req,res)=>{
    try {
        const customer = new Customer(req.body);
        await customer.save();
        res.status(201).json({
            success: true,
            message: 'Customer created successfully',
            data: customer
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating customer',
            error: error.message
        });
    }
})

app.post('/review', async (req, res) => {
    try {
        const { shop, customer, barber, rating, review, likes } = req.body;

        // Create a new review
        const newReview = new Review({
            shop,
            customer,
            barber,
            rating,
            review,
            likes
        });

        // Save the review to the database
        await newReview.save();

        // Update Shop with the new review
        await Shop.findByIdAndUpdate(shop, { $push: { reviews: newReview._id } });

        // Update Customer with the new review
        await Customer.findByIdAndUpdate(customer, { $push: { reviews: newReview._id } });

        // Send a success response
        res.status(201).json({
            success: true,
            message: 'Review created successfully',
            review: newReview
        });

        console.log('Review created successfully');
    } catch (error) {
        // Send an error response
        res.status(400).json({
            success: false,
            message: 'Error creating review',
            error: error.message
        });
    }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});