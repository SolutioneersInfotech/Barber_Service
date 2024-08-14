const mongoose = require('mongoose');

// Barber schema
const barberSchema = new mongoose.Schema({
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
        default: 'default-barber-pic.jpg'
    },
    location: {
        shopName: {
            type: String,
            required: true
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
        }
    },
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
    workSchedule: [{
        day: {
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            required: true
        },
        startTime: {
            type: String, // e.g., '09:00 AM'
            required: true
        },
        endTime: {
            type: String, // e.g., '05:00 PM'
            required: true
        },
        isAvailable: {
            type: Boolean,
            default: true
        }
    }],
    isActive: {
        type: Boolean,
        default: true // Indicates if the barber is currently active
    }
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps
});

const Barber = mongoose.model('Barber', barberSchema);

module.exports = Barber;
