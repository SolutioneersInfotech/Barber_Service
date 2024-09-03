const mongoose = require('mongoose');
const { type } = require('os');

// Sub-service schema
const subServiceSchema = new mongoose.Schema({
  subServiceName: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0 // To ensure the price is not negative
  },
  duration: {
    type: Number, 
    required: true,
    min: 1 // Ensure at least 1 minute duration
  }
});

// Service schema
const serviceSchema = new mongoose.Schema({
  serviceName: {
    type: String,
    required: true,
    trim: true
  },
  subServices: [subServiceSchema]  
});

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
    type: String,
    match: [/^https?:\/\/[^\s$.?#].[^\s]*$/, 'Invalid URL format']
  },
  shop_profile: {
    type: String,
    default: "https://cdn.vectorstock.com/i/1000v/92/50/barber-salon-barbershop-logo-vintage-men-haircut-vector-42979250.avif",
    trim: true
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
  operatingHours: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true
    },
    openTime: {
      type: String,
      required: true
    },
    closeTime: {
      type: String,
      required: true
    },
    isClosed: {
      type: Boolean,
      default: false
    }
  }],
  barbers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Barber'
  }],
  services: [serviceSchema],
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'review' // Reference to the Review model
}],
  rating: {  
    type: String,
    min: 0,
    max: 5,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
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
  },
  shop_images: [{
    type:String
  }],
  gallery: [{
     type:String
  }],

}, {
  timestamps: true
});

// Assuming you want to use GeoJSON for geolocation:
shopSchema.index({ location: '2dsphere' });

const Shop = mongoose.model('Shop', shopSchema);

module.exports = Shop;
