const mongoose = require('mongoose');
const User = require("../models/User_model");
const Shop = require('../models/shop_model');
const Customer = require('../models/cust_models');

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
            select: 'name address rating shop_profile'
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const userEmail = user.email;

        // Query Customer using the email
        const customer = await Customer.findOne({ email: userEmail });

        if (!customer) {
            return res.status(404).json({ 
                success: false, 
                message: "Complete your details to proceed" 
            });
        }

        // Ensure that the customer has an address with latitude and longitude
        if (!customer.address || !customer.address.latitude || !customer.address.longitude) {
            return res.status(400).json({
                success: false,
                message: 'Customer address is incomplete'
            });
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
        return res.status(200).json({
            success: true,
            bookmarks: sortedShops
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching bookmarks',
            error: error.message
        });
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
    const distance = R * c; // Distance in km
    return distance;
}

// Convert degrees to radians
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

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
    const distance = R * c; // Distance in km
    return distance;
}

// Convert degrees to radians
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

module.exports = { addBookmark, removeBookmark, getBookmarkedShops };
