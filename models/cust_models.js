const mongoose = require('mongoose');
const Shop = require('./shop_model');
const Barber = require('./barber_model'); // Add the required Barber model

// Customer schema
const customerSchema = new mongoose.Schema({
    fullName: {
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        lastName: {
            type: String,
            required: true,
            trim: true
        }
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        match: [/^\d{10}$/, 'Phone number must be 10 digits long']
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/.+@.+\..+/, 'Invalid email format']
    },
    profilePic: {
        type: String, // URL or path to the profile picture
        default: 'https://avatar.iran.liara.run/public/boy?username=Ash'
    },
    address: {
        houseNo: {
            type: String,
            required: true
        },
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        pin: {
            type: Number,
            required: true
        },
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        },
        country: {
            type: String,
            required: true
        }
    },
    dob: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },
    preferences: {
        hairType: {
            type: String,
            trim: true
        }
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'review' // Reference to the Review model
    }],
    appointmentHistory: [{
        barber: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Barber'
        },
        date: {
            type: Date,
            required: true
        },
        service: {
            type: String,
            required: true
        },
        notes: {
            type: String
        },
        bookingTime: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['Booked', 'Completed', 'Cancelled'],
            default: 'Booked'
        },
        paymentStatus: {
            type: String,
            enum: ['Pending', 'Paid'],
            default: 'Pending'
        },
        paymentMode: {
            type: String,
            enum: ['Credit Card', 'Debit Card', 'Cash', 'UPI', 'Net Banking'],
            default: 'Cash'
        }
    }]
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps to the Customer schema
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
