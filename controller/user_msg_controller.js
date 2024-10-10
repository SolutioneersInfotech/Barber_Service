const User = require("../models/User_model");
const { sendGeneralResponse } = require('../utils/responseHelper');
const getUsersForSidebar = async (req, res) => {
    try {
        //const loggedInUserId = req.user._id;
         const {loggedInUserId } = req.body;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("firstName");
        sendGeneralResponse(res, true, 'Chat with everyone', 200, filteredUsers)
    } catch (error) {
        console.error("Error in getUsersForSidebar: ", error.message);
        sendGeneralResponse(res, false, 'Error in getUsersforchats', 500, error.message)
    }
};

module.exports = {
    getUsersForSidebar,
};
