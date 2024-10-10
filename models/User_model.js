
// const mongoose = require('mongoose');
// const { Schema } = mongoose;
// const jwt = require('jsonwebtoken');

// const userSchema = new Schema({
//   firstName: {
//     type: String,
//     required: [true, 'First name is required'],
//     trim: true,
//     maxlength: [50, 'First name cannot be more than 50 characters']
//   },
//   lastName: {
//     type: String,
//     required: [true, 'Last name is required'],
//     trim: true,
//     maxlength: [50, 'Last name cannot be more than 50 characters']
//   },
//   email: {
//     type: String,
//     required: [true, 'Email is required'],
//     trim: true,
//     lowercase: true,
//     unique: true,
//     match: [/.+\@.+\..+/, 'Please fill a valid email address']
//   },
//   phone: {
//     type: String,
//     required: [true, 'Phone number is required'],
//     unique: true,
//     match: [/^\+?[1-9]\d{1,14}$/, 'Please fill a valid phone number']
//   },
//   DOB: {
//     type: Date,
//     required: [true, 'Date of Birth is required'],
//     validate: {
//       validator: function (v) {
//         const today = new Date();
//         const age = today.getFullYear() - v.getFullYear();
//         const m = today.getMonth() - v.getMonth();
//         if (m < 0 || (m === 0 && today.getDate() < v.getDate())) {
//           age--;
//         }
//         return age >= 18;
//       },
//       message: 'User must be at least 18 years old'
//     }
//   },
//   gender: {
//     type: String,
//     required: [true, 'Gender is required'],
//     enum: {
//       values: ['Male', 'Female', 'Other'],
//       message: 'Gender must be Male, Female, or Other'
//     }
//   },
//   address: {
//     type: String,
//     required: [true, 'Address is required'],
//     trim: true,
//     maxlength: [200, 'Address cannot be more than 200 characters']
//   },
//   profile_img: {
//     type: String,
//      required: true,
//    },
//    refreshToken:{
//     type:String,
//     required: [true],
//     trim: true,
//   },
//   device_token:{
//     type:String,
//     required: [true],
//     trim: true,
//   },
//   bookmarkedShops: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Shop' }]
// }, {
//   timestamps: true
// });

// // // Token generation method
// // userSchema.methods.generateToken = function () {
// //   const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
// //   return token;
// // };

// const User = mongoose.model('User', userSchema);

// module.exports = User;

const mongoose = require('mongoose');
const { Schema } = mongoose;
const jwt = require('jsonwebtoken');

// User schema
const userSchema = new Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot be more than 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    unique: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please fill a valid phone number']
  },
  DOB: {
    type: Date,
    required: [true, 'Date of Birth is required'],
    validate: {
      validator: function (v) {
        const today = new Date();
        const age = today.getFullYear() - v.getFullYear();
        const m = today.getMonth() - v.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < v.getDate())) {
          age--;
        }
        return age >= 18;
      },
      message: 'User must be at least 18 years old'
    }
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: {
      values: ['Male', 'Female', 'Other'],
      message: 'Gender must be Male, Female, or Other'
    }
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
    },
    longitude: {
      type: Number,
    },
    country: {
      type: String,
      required: true
    }
  },
  profile_img: {
    type: String,
    required: true,
    default: 'https://avatar.iran.liara.run/public/boy?username=Ash'
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
      required: false
    },
    service: {
      type: String,
      required: false
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
  }],
  refreshToken: {
    type: String,
    required: [],
    trim: true
  },
  device_token: {
    type: String,
    required: [],
    trim: true
  },
  bookmarkedShops: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Shop' }]
}, {
  timestamps: true
});

// // Token generation method (if needed)
// userSchema.methods.generateToken = function () {
//   const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
//   return token;
// };

const User = mongoose.model('User', userSchema);

module.exports = User;
