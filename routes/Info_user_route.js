
const express = require('express');
const {
  getUserById,
  createUser,
  updateUserById,
  deleteUserById,
  getAllUsers,
  searchUsers,
  bookmark
} = require('../controller/userinfo');
// const multer = require('multer');
const path = require('path');
const router = express.Router();

//Set up multer storage
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, './public/uploads'); // Directory to save the uploaded files
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
//   }
// });
// const upload = multer({ storage: storage });

// Routes

// User routes
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUserById);
router.delete('/:id', deleteUserById);
router.get('/', getAllUsers);
router.get('/search', searchUsers);
router.get('/bookmark/:id', bookmark)
// router.post('/bookmark/:id', bookmark)

module.exports = router;