const mongoose = require('mongoose');

// Review schema
const reviewSchema = new mongoose.Schema({
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    },
    customer: {  // Changed from array to single reference
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    barber: {  // Optionally add if reviews can be linked to barbers
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Barber'
    },
    rating: {  // Changed from array to single value
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    review: {
        type: String,
        minlength: 5
    },
    likes: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const review = mongoose.model('review', reviewSchema);

module.exports = review;
