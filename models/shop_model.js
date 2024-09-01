const mongoose = require('mongoose');

// Sub-service schema
const subServiceSchema = new mongoose.Schema({
  subServiceName: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  duration: {
    type: Number, 
    required: true
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
    ref: 'Barber',
    required: true
  }],
  services: [serviceSchema],  

  ratings: {
    type: String,
    required: true,
    trim: true
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
  }
}, {
  timestamps: true
});

shopSchema.index({ 'address.location': '2dsphere' });

const Shop = mongoose.model('Shop', shopSchema);

module.exports = Shop;
