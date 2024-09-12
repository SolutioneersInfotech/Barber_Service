const mongoose = require('mongoose');
const User = require("../models/User_model");
const Shop = require('../models/shop_model');

const addBookmark = async (req, res) => {
    try {
        const userId = req.body.userId; // User ID should come from the request body or use authentication middleware
        const shopId = req.params.shopId;

        // Validate shop ID
        if (!mongoose.Types.ObjectId.isValid(shopId)) {
            return res.status(400).json({ success: false, message: "Invalid Shop ID" });
        }

        // Check if the shop exists
        const shop = await Shop.findById(shopId);
        if (!shop) {
            return res.status(404).json({ success: false, message: "Shop not found" });
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Check if the shop is already bookmarked
        if (user.bookmarkedShops.includes(shopId)) {
            return res.status(400).json({ success: false, message: "Shop is already bookmarked" });
        }

        // Add the shop to the user's bookmarks
        user.bookmarkedShops.push(shopId);
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Shop bookmarked successfully",
            bookmarks: user.bookmarkedShops
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error bookmarking shop",
            error: error.message
        });
    }
};

const removeBookmark = async (req, res) => {
    try {
        const userId = req.body.userId; // User ID should come from the request body or use authentication middleware
        const shopId = req.params.shopId;

        // Validate shop ID
        if (!mongoose.Types.ObjectId.isValid(shopId)) {
            return res.status(400).json({ success: false, message: "Invalid Shop ID" });
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Check if the shop is in the user's bookmarks
        const bookmarkIndex = user.bookmarkedShops.indexOf(shopId);
        if (bookmarkIndex === -1) {
            return res.status(400).json({ success: false, message: "Shop is not in bookmarks" });
        }

        // Remove the shop from the user's bookmarks
        user.bookmarkedShops.splice(bookmarkIndex, 1);
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Shop removed from bookmarks successfully",
            bookmarks: user.bookmarkedShops
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error removing shop from bookmarks",
            error: error.message
        });
    }
};

const getBookmarkedShops = async (req, res) => {
    try {
        const userId = req.body.userId;

        // Find the user and populate the bookmarked shops
        const user = await User.findById(userId).populate({
            path: 'bookmarkedShops',
            select: 'name address rating '
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({
            success: true,
            bookmarks: user.bookmarkedShops
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching bookmarks",
            error: error.message
        });
    }
};

module.exports = { addBookmark, removeBookmark, getBookmarkedShops };
