const Shop = require('../models/shop_model')
const barber = require('../models/barber_model')
const Customer = require('../models/cust_models')
const Review = require('../models/reviews_model')
const mongoose = require('mongoose'); 
const { sendGeneralResponse } = require('../utils/responseHelper');

const shopdetails = async (req, res) => {
    try {
        const shopId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(shopId)) {
            return sendGeneralResponse(res, false, "Invalid Shop ID", 400);
        }

        const shop = await Shop.findById(shopId)
            .populate("barbers") // Populate barbers field
            .populate({
                path: 'reviews',
                select: '_id review customer likes rating',
                populate: {
                    path: 'customer', // Populate the customer field
                    select: 'fullName profilePic', // Select only the fullName of the customer
                }
            })
            .exec();

        if (!shop) {
            return sendGeneralResponse(res, false, "Shop not found", 404);
        }

        // Constructing the shop details response
        const shops = {
            images: shop.shop_images,
            barbers: shop.barbers.map(barber => ({
                id: barber._id,
                name: barber.fullName,
                profile: barber.profilePic,
            })),
            title: `${shop.name} is a premier salon owned by ${shop.owner}. We are located at ${shop.address.houseNo}, ${shop.address.street}, ${shop.address.city}, ${shop.address.state}, ${shop.address.pin}, ${shop.address.country}. For appointments or inquiries, please contact us at ${shop.contactNumber} or email us at ${shop.email}. Visit our website at ${shop.website} to learn more about our services and offerings.`,
            About: {
                Shop_Name: shop.name,
                Location: shop.address,
                Time: shop.time,
                Rating: shop.rating,
                Contact: shop.contactNumber,
                Working_Days_Time: shop.operatingHours,
                Email: shop.email,
            },
            services: shop.services.map(service => ({
                serviceName: service.serviceName,
                subServiceCount: service.subServices.length, // Count the number of sub-services
                subServices: service.subServices, // Include sub-services if needed
            })),
            packages: shop.services.flatMap(service => service.subServices), // Flattening sub-services into packages
            reviews: shop.reviews.map(re => ({
                id: re._id,
                Customer: re.customer.fullName,
                Customer_pic: re.customer.profilePic,
                Comment: re.review,
                Rating: re.rating,
                Likes: re.likes,
            })) || [], // Assuming reviews are stored in the shop document
            gallery: shop.gallery,
        };

        return sendGeneralResponse(res, true, 'data', 200, shops);
    } catch (error) {
        sendGeneralResponse(res, false, 'Error fetching shop details', 500, error.message);
    }
};








const about = async (req, res) => {
    try {
        const shopId = req.params.id;
        const shop = await Shop.findById(shopId, 'name owner contactNumber email website');
        if (!shop) {
            return res.status(404).json({ success: false, message: 'Shop not found' });
        }
        res.status(200).json({ success: true, data: shop });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching shop details', error: error.message });
    }
};


const services = async (req, res) => {
    try {
        const shopId = req.params.id;
        const shop = await Shop.findById(shopId, 'services');
        if (!shop) {
            return res.status(404).json({ success: false, message: 'Shop not found' });
        }
        res.status(200).json({ success: true, data: shop.services });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching shop services', error: error.message });
    }
};


const packages = async (req, res) => {
    try {
        const shopId = req.params.id;
        // Assuming packages are stored within services or a separate collection
        const shop = await Shop.findById(shopId, 'services');
        if (!shop) {
            return res.status(404).json({ success: false, message: 'Shop not found' });
        }
        // Example: filter services to return only packages (if they are stored separately)
        const packages = shop.services.filter(service => service.isPackage);
        res.status(200).json({ success: true, data: packages });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching shop packages', error: error.message });
    }
};


const gallery = async (req, res) => {
    try {
        const shopId = req.params.id;
        const shop = await shop.findById(shopId, 'gallery');
        if (!shop) {
            return res.status(404).json({ success: false, message: 'Shop not found' });
        }
        res.status(200).json({ success: true, data: shop.gallery });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching shop gallery', error: error.message });
    }
};


const review = async (req, res) => {
    try {
        const shopId = req.params.id;
        const shop = await shop.findById(shopId, 'ratings').populate('ratings.customer');
        if (!shop) {
            return res.status(404).json({ success: false, message: 'Shop not found' });
        }
        res.status(200).json({ success: true, data: shop.ratings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching shop reviews', error: error.message });
    }
};



module.exports = {  shopdetails ,services ,about,packages,gallery,review};