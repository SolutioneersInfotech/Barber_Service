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
                // Assuming the 'User' schema has a 'firstName' field
                }
            })
        //    .populate('services.subServices') // Populate subServices if they are references
            .exec();

        // If no shop is found
        if (!shop) {
            return sendGeneralResponse(res, false, "Shop not found", 404);
        }

        // Find reviews related to the shop and populate customer data
        const reviews = await Review.find({ shop: shopId })
            .populate('customer', "firstName lastName profile_img") // Ensure customer is populated
            .exec();

        // Aggregate reviews to count them
        const counts = await Review.aggregate([
            {
                $match: { shop: new mongoose.Types.ObjectId(shopId) }, // Ensure shop field is used in aggregation
            },
            {
                $group: {
                    _id: "$shop", // Group by the shop field
                    count: { $sum: 1 }, // Count the number of reviews
                }
            },
            {
                $project: {
                    _id: 0, // Exclude the _id field (i.e., shop)
                    count: 1 // Include only the count field
                }
            }
        ]);

        // Calculate total counts
        const totalCounts = counts.length > 0 ? counts[0].count : 0;

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
            packages: shop.services.map(service => ({
                serviceName: service.serviceName,
                description: service.description || "No Special offer",
                rate: service.rate
            })),
            booknow: shop.services.map(service => ({
                Shop_Name: shop.name,
                ServiceName: service.serviceName,
                fulldescription: service.fulldescription || "No Description",
                SubServices: service.subServices.map(subService => ({
                    SubServiceName: subService.subServiceName,
                }))
            })),
            reviews: reviews.map(review => ({
                id: review._id,
                customer: review.customer ,
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


module.exports = { shopdetails };