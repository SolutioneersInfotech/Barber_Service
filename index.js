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

        // Validate required fields
        if (!shop || !customer || !rating || !review) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required: shop, customer, rating, and review'
            });
        }

        // Validate rating (should be between 1 and 5)
        if (typeof rating !== 'number' || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be a number between 1 and 5'
            });
        }

        // Check if the customer has already reviewed the shop
        const existingReview = await Review.findOne({ shop, customer });
        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'Customer has already submitted a review for this shop'
            });
        }

        // Create a new review
        const newReview = new Review({
            shop,
            customer,
            barber,
            rating,
            review,
            likes: likes || 0 // Default likes to 0 if not provided
        });

        // Save the review to the database
        await newReview.save();

        // Send a success response
        return res.status(201).json({
            success: true,
            message: 'Review created successfully',
            review: newReview
        });

    } catch (error) {
        // Send an error response
        return res.status(500).json({
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