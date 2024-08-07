const mongoose = require('mongoose');

// Define the schema for personal information
const personalInfoSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  nickname: {
    type: String,
    trim: true
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
  fatherName: {
    type: String,
    required: true,
    trim: true
  },
  profilePic: {
    type: String, // Store the URL or path to the profile picture
    trim: true
  }
}, { timestamps: true });

// Create and export the model
const PersonalInfo = mongoose.model('Personal_Info_users', personalInfoSchema);
module.exports = PersonalInfo;
