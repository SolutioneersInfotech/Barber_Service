const mongoose = require('mongoose');

// Shop schema
const shopSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    owner: {
        type: String,
        required: true,
        trim: true
    },
    contactNumber: {
        type: String,
        required: true,
        unique: true,
        match: [/^\d{10}$/, 'Contact number must be 10 digits long']
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/.+@.+\..+/, 'Invalid email format']
    },
    website: {
        type: String, // URL to the shop's website
        match: [/^https?:\/\/[^\s$.?#].[^\s]*$/, 'Invalid URL format']
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
    operatingHours: [{
        day: {
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            required: true
        },
        openTime: {
            type: String, // e.g., '09:00 AM'
            required: true
        },
        closeTime: {
            type: String, // e.g., '09:00 PM'
            required: true
        },
        isClosed: {
            type: Boolean,
            default: false
        }
    }],
    barbers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Barber',
        required: true
    }],
    servicesOffered: [{
        serviceName: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        duration: {
            type: Number, // Duration in minutes
            required: true
        }
    }],
    ratings: [{
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
            required: true
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        },
        comment: {
            type: String
        }
    }],
    isActive: {
        type: Boolean,
        default: true // Indicates if the shop is currently active
    },
    socialMediaLinks: {
        facebook: {
            type: String,
            match: [/^https?:\/\/(www\.)?facebook\.com\/[A-Za-z0-9_.-]+$/, 'Invalid Facebook URL']
        },
        instagram: {
            type: String,
            match: [/^https?:\/\/(www\.)?instagram\.com\/[A-Za-z0-9_.-]+$/, 'Invalid Instagram URL']
        },
        twitter: {
            type: String,
            match: [/^https?:\/\/(www\.)?twitter\.com\/[A-Za-z0-9_.-]+$/, 'Invalid Twitter URL']
        }
    }
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps
});

const Shop = mongoose.model('Shop', shopSchema);

module.exports = Shop;
