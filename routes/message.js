const express = require('express');
const protectRoute = require("../middleware/authmiddleware.js");
const { getUsersForSidebar } = require("../controller/user_msg_controller.js");
const { sendMessage, getMessages } = require("../controller/message_controller.js");

const router = express.Router();

// Get users for sidebar
router.get("/", protectRoute, getUsersForSidebar);

// Get messages for a specific user
router.get("/:id", protectRoute, getMessages);

// Send a message to a specific user
router.post("/send/:id", protectRoute, sendMessage);

module.exports = router;
