const mongoose = require('mongoose');

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
        default: 'default-profile-pic.jpg'
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
            required: true // Assumed to be fetched via an API
        },
        longitude: {
            type: Number,
            required: true // Assumed to be fetched via an API
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
            type: String, // e.g., "Curly", "Straight", "Wavy"
            trim: true
        }
    },
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
    timestamps: true // Adds createdAt and updatedAt timestamps
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
