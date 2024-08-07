const express = require('express');
const multer = require('multer');
const path = require('path');
const { getPersonalInfo, createOrUpdatePersonalInfo, deletePersonalInfo } = require('../controller/userinfo');

const router = express.Router();

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory to save the uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  }
});
const upload = multer({ storage: storage });

// Routes
router.get('/personal-info/:id', getPersonalInfo);
router.post('/personal-info/:id?', upload.single('profilePic'), createOrUpdatePersonalInfo);
router.delete('/personal-info/:id', deletePersonalInfo);

module.exports = router;
