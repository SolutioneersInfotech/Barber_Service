const Review = require('../models/reviews_model')



const create= async(req, res)=> {
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

}


module.exports= {create};