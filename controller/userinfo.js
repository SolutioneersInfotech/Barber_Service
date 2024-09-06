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

// Create a new user
const createUser = async (req, res) => {
  const { firstName, lastName, email, phone, DOB, gender, address } = req.body;

  // Check if all fields are provided
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
    
    const newUser = new User({ firstName, lastName, email, phone, DOB, gender, address });
    await newUser.save();

    // Generate token for the user
    const token = newUser.generateToken();

    res.status(201).json({
      message: 'User created successfully',
      token,
      userId: newUser._id.toString(),
    });
  } catch (error) {
    console.error('Error creating user:', error);
    // res.status(500).json({ message: 'Internal Server Error' });
    sendGeneralResponse(res, false, error, 500, 'Internal Server Error');
  }
};

// Update user by ID
const updateUserById = async (req, res) => {
  const { firstName, lastName, email, phone, DOB, gender, address } = req.body;

  try {
    const updatedData = { firstName, lastName, email, phone, DOB, gender, address };
    
    const updatedUser = await User.findByIdAndUpdate(req.params.id, updatedData, { new: true, runValidators: true });
    if (!updatedUser) {
      // return res.status(404).json({ message: 'User not found' });
      sendGeneralResponse(res, true, 'Message', 404, 'user not found');
    }

    // res.json(updatedUser);
    sendGeneralResponse(res, true, "updated user", 200, updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);

    let errorMessage = 'An error occurred while updating the user ';

    if (error.name === 'ValidationError') {
      errorMessage = 'Invalid input data';
    } else if (error.name === 'CastError') {
      errorMessage = 'Invalid User ID format';
    }

    // return res.status(500).json({ message: errorMessage });
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

module.exports = { getAllUsers, getUserById, searchUsers, updateUserById, deleteUserById, createUser}