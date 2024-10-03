const User = require('../models/User_model');
const { validateEmail, validatePhoneNumber } = require('../utils/validators');
const { sendGeneralResponse } = require('../utils/responseHelper');


// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return
    // res.status(404).json({ message: 'User not found' });
    sendGeneralResponse(res, false, "user not found", 404,  'User not found');
     
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    // res.status(500).json({ message: 'Internal Server Error' });
    sendGeneralResponse(res, false, error, 500, 'Internal Server Error');
  }
};

/// Create a new user
const createUser = async (req, res) => {
  const { 
    firstName, 
    lastName, 
    email, 
    phone, 
    DOB, 
    gender, 
    address, 
    preferences = {},  // Default to an empty object if not provided
    appointmentHistory = [],  // Default to an empty array if not provided
    // Default to an empty array if not provided
    refreshToken="",
    device_token=""
  } = req.body;

  // Check if all required fields are provided
  if (!firstName || !lastName || !email || !phone || !DOB || !gender || !address) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Validate email and phone number
  if (!validateEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (!validatePhoneNumber(phone)) {
    return res.status(400).json({ message: 'Invalid phone number' });
  }

  try {
    // Check if the user with the same email or phone already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      let message = '';
      if (existingUser.email === email) {
        message += 'Email already registered. ';
      }
      if (existingUser.phone === phone) {
        message += 'Phone number already registered.';
      }
      return res.status(400).json({ message: message.trim() });
    }
    
    // Create a new user object
    const newUser = new User({
      firstName,
      lastName,
      email,
      phone,
      DOB,
      gender,
      address,
      preferences,
      appointmentHistory,
      refreshToken,  // Assuming this is provided and used appropriately
      device_token
    });

    // Save the user to the database
    await newUser.save();

    // Generate token for the user (make sure to uncomment this if you have the method defined)
 //   const token = newUser.generateToken();

    // Respond with the success message and user details
    res.status(201).json({
      message: 'User created successfully',
    
      userId: newUser._id.toString(),
    });
  } catch (error) {
    console.error('Error creating user:', error);
    // Send a generic error response
    sendGeneralResponse(res, false, error, 500, 'Internal Server Error');
  }
};


const updateUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    // Create an object to hold the fields that need to be updated
    const updatedData = {};

    // Add only the fields that are provided in the request body to the update object
    if (req.body.firstName) updatedData.firstName = req.body.firstName;
    if (req.body.lastName) updatedData.lastName = req.body.lastName;
    if (req.body.email) updatedData.email = req.body.email;
    if (req.body.phone) updatedData.phone = req.body.phone;
    if (req.body.DOB) updatedData.DOB = req.body.DOB;
    if (req.body.gender) updatedData.gender = req.body.gender;
    if (req.body.address) {
      updatedData.address = {
        ...req.body.address // Spread the address fields, which can include houseNo, street, etc.
      };
    }
    if (req.body.profile_img) updatedData.profile_img = req.body.profile_img;
    if (req.body.preferences) {
      updatedData.preferences = {
        ...req.body.preferences
      };
    }
    if (req.body.refreshToken) updatedData.refreshToken = req.body.refreshToken;
    if (req.body.device_token) updatedData.device_token = req.body.device_token;
    if (req.body.bookmarkedShops) updatedData.bookmarkedShops = req.body.bookmarkedShops;
    if (req.body.appointmentHistory) updatedData.appointmentHistory = req.body.appointmentHistory;

    // Find user by ID and update the fields that are provided
    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true, runValidators: true });

    if (!updatedUser) {
      return sendGeneralResponse(res, true, 'Message', 404, 'User not found');
    }

    // Send the updated user details as a response
    sendGeneralResponse(res, true, 'Updated user', 200, updatedUser);

  } catch (error) {
    console.error('Error updating user:', error);

    let errorMessage = 'An error occurred while updating the user';
    if (error.name === 'ValidationError') {
      errorMessage = 'Invalid input data';
    } else if (error.name === 'CastError') {
      errorMessage = 'Invalid User ID format';
    }

    sendGeneralResponse(res, false, 'Error', 500, errorMessage);
  }
};


// Delete user by ID
const deleteUserById = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: 'User not found' });

    // res.status(200).json({ message: 'User deleted successfully' });
    sendGeneralResponse(res, true, "updated user", 200, 'User deleted successfully');
  } catch (error) {
    console.error('Error deleting user:', error);
    // res.status(500).json({ message: "Internet server Error" });
    sendGeneralResponse(res, false, error, 500, 'Internal Server Error');
  }
};

// Get all users with pagination
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const users = await User.find()
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .exec();

    const count = await User.countDocuments();

    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Search users by email or phone
const searchUsers = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    const users = await User.find({
      $or: [
        { email: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } },
      ],
    });

    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    // res.status(500).json({ message: 'Internal Server Error' });
    sendGeneralResponse(res, false, error, 500, 'Internal Server Error');
  }
};


const bookmark = async( req, res)=>{
  try{
    const {user_id} = req.params;
    const bookmark = User.findById(user_id);
    console.log(bookmark);
  }
  catch(error){
    console.error('Error bookmarking user:', error);
  }
}

module.exports = { getAllUsers, getUserById, searchUsers, updateUserById, deleteUserById, createUser,bookmark}