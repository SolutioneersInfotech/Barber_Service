const Shop = require('../models/shop_model')
const barber = require('../models/barber_model')
const Customer = require('../models/cust_models')
const Review = require('../models/reviews_model')
const User = require('../models/User_model')
const mongoose = require('mongoose');
const { sendGeneralResponse } = require('../utils/responseHelper');

const shopdetails = async (req, res) => {
    try {
        const shopId = req.params.id;

        // Validate shop ID
        if (!mongoose.Types.ObjectId.isValid(shopId)) {
            return sendGeneralResponse(res, false, "Invalid Shop ID", 400);
        }

        // Find the shop and populate necessary fields
        const shop = await Shop.findById(shopId)
            .populate("barbers")
            .populate({
                path: 'reviews',
                select: '_id review customer likes rating createdAt',
                populate: {
                    path: 'customer',
                   // select: 'profile_img',
                }
            })
            .populate('services.subServices') // Populate subServices if they are references
            .exec();
         console.log(shop.customer)
        // If no shop is found
        if (!shop) {
            return sendGeneralResponse(res, false, "Shop not found", 404);
        }

        const reviews = await Review.find({ shop: shopId })
            .populate('customer')
            .exec();

        const counts = await Review.aggregate([
            {
                $group: {
                    _id: "$shopId",   // Group by the field (e.g., shop ID)
                    count: { $sum: 1 }  // Count the number of occurrences
                }
            },
            {
                $project: {
                    _id: 0,   // Exclude the _id field (i.e., shopId)
                    count: 1   // Include only the count field
                }
            }
        ]);

        // Calculate total counts
        const totalCounts = counts.reduce((total, item) => total + item.count, 0);
        // Construct the response data
        const shopData = {
            images: shop.shop_images || [],
            barbers: shop.barbers.map(barber => ({
                id: barber._id,
                name: barber.fullName,
                profile: barber.profilePic,
            })),
            title: `${shop.name} is a premier salon owned by ${shop.owner}. We are located at ${shop.address.houseNo}, ${shop.address.street}, ${shop.address.city}, ${shop.address.state}, ${shop.address.pin}, ${shop.address.country}. For appointments or inquiries, please contact us at ${shop.contactNumber} or email us at ${shop.email}. Visit our website at ${shop.website} to learn more about our services and offerings.`,
            About: {
                Shop_Name: shop.name,
                Location: shop.address,
                Time: shop.operatingHours,
                Rating: shop.rating,
                Totalreviews: totalCounts,
                Contact: shop.contactNumber,
                Working_Days_Time: shop.operatingHours,
                Email: shop.email,
            },
            services: shop.services.map(service => ({
                serviceName: service.serviceName,
                subServiceCount: service.subServices.length,
                subServices: service.subServices.map(subService => ({
                    name: subService.name,
                    price: subService.price,
                    description: subService.description,
                    img: subService.img
                })),
            })),
            // Corrected packages section
            packages: shop.services.map(service => ({
                serviceName: service.serviceName,
                description: service.description || "No Special offer",
                rate: service.rate
            })),
            // Booknow section with corrected subService mapping
            booknow: shop.services.map(service => ({
                Shop_Name: shop.name,
                ServiceName: service.serviceName,
                fulldescription: service.fulldescription || "No Description",
                SubServices: service.subServices.map(subService => ({
                    SubServiceName: subService.subServiceName,
                }))
            })),
            // // Fetch related data

            reviews: reviews.map(review => ({
                id: review._id,
                customer: {
                  //  fullName: review.customer.firstName,
                    profilePic: review.customer.profile_img
                },
                rating: review.rating,
                review: review.review,
                likes: review.likes,
                createdAt: review.createdAt
            })),

            gallery: shop.gallery || [],
        };

        // Send the successful response
        return sendGeneralResponse(res, true, 'Shop details fetched successfully', 200, shopData);
    } catch (error) {
        // Catch any errors and respond
        return sendGeneralResponse(res, false, 'Error fetching shop details', 500, error.message);
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




module.exports = { shopdetails, services, about, packages, gallery, review };