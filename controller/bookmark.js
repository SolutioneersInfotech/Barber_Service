const mongoose = require('mongoose');
const User = require("../models/User_model");
const Shop = require('../models/shop_model');
const { sendGeneralResponse } = require('../utils/responseHelper');

// Add a shop to the user's bookmarks
const addBookmark = async (req, res) => {
    try {
        const userId = req.body.userId; // User ID should come from the request body or authentication middleware
        const shopId = req.params.shopId;

        // Validate shop ID
        if (!mongoose.Types.ObjectId.isValid(shopId)) {
            return sendGeneralResponse(res, false, "Invalid Shop ID", 400);
        }

        // Check if the shop exists
        const shop = await Shop.findById(shopId);
        if (!shop) {
            return sendGeneralResponse(res, false, "Shop not found", 404);
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return sendGeneralResponse(res, false, "User not found", 404);
        }

        // Check if the shop is already bookmarked
        if (user.bookmarkedShops.includes(shopId)) {
            return sendGeneralResponse(res, false, "Shop is already bookmarked", 400);
        }

        // Add the shop to the user's bookmarks
        user.bookmarkedShops.push(shopId);
        await user.save();

        return sendGeneralResponse(res, true, "Shop bookmarked successfully", 200, user.bookmarkedShops);
    } catch (error) {
        return sendGeneralResponse(res, false, "Error bookmarking shop", 500, error.message);
    }
};

// Remove a shop from the user's bookmarks
const removeBookmark = async (req, res) => {
    try {
        const userId = req.body.userId;
        const shopId = req.params.shopId;

        // Validate shop ID
        if (!mongoose.Types.ObjectId.isValid(shopId)) {
            return sendGeneralResponse(res, false, "Invalid Shop ID", 400);
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return sendGeneralResponse(res, false, "User not found", 404);
        }

        // Check if the shop is in the user's bookmarks
        const bookmarkIndex = user.bookmarkedShops.indexOf(shopId);
        if (bookmarkIndex === -1) {
            return sendGeneralResponse(res, false, "Shop is not in bookmarks", 400);
        }

        // Remove the shop from the user's bookmarks
        user.bookmarkedShops.splice(bookmarkIndex, 1);
        await user.save();

        return sendGeneralResponse(res, true, "Shop removed from bookmarks successfully", 200, user.bookmarkedShops);
    } catch (error) {
        return sendGeneralResponse(res, false, "Error removing shop from bookmarks", 500, error.message);
    }
};

// Get all bookmarked shops for a user
const getBookmarkedShops = async (req, res) => {
    try {
        const userId = req.body.userId;

        // Find the user and populate the bookmarked shops
        const user = await User.findById(userId).populate({
            path: 'bookmarkedShops',
            select: 'name address rating shop_profile'
        });

        if (!user) {
            return sendGeneralResponse(res, false, "User not found", 404);
        }

        const userEmail = user.email;

        // Query the customer using the email
        const customer = await User.findOne({ email: userEmail });

        if (!customer) {
            return sendGeneralResponse(res, false, "Complete your details to proceed", 404);
        }

        // Ensure that the customer has an address with latitude and longitude
        if (!customer.address || !customer.address.latitude || !customer.address.longitude) {
            return sendGeneralResponse(res, false, "Customer address is incomplete", 400);
        }

        // Assuming the customer's latitude and longitude are stored in their profile
        const userLat = customer.address.latitude;
        const userLng = customer.address.longitude;

        const shops = user.bookmarkedShops;

        // Calculate distance for each shop and sort by nearest
        const sortedShops = shops.map(shop => {
            const shopLat = shop.address.latitude;
            const shopLng = shop.address.longitude;

            // Calculate the distance using the Haversine formula
            const distance = getDistanceFromLatLonInKm(userLat, userLng, shopLat, shopLng);

            // Return shop data along with the calculated distance
            return { ...shop._doc, distance };
        }).sort((a, b) => a.distance - b.distance); // Sort by distance in ascending order

        // Return the sorted shops with their distances
        return sendGeneralResponse(res, true, "Bookmarks fetched successfully", 200, sortedShops);

    } catch (error) {
        return sendGeneralResponse(res, false, "Error fetching bookmarks", 500, error.message);
    }
};

// Haversine formula to calculate the distance between two lat/lng points in km
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
}

// Helper function to convert degrees to radians
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

module.exports = {
    addBookmark,
    removeBookmark,
    getBookmarkedShops,
};

