const Shop = require('../models/shop_model')
const barber = require('../models/barber_model')


const mongoose = require('mongoose'); 
const { sendGeneralResponse } = require('../utils/responseHelper');

const shopdetails = async (req, res) => {
    try {
        const shopId = req.params.id;

            if (!mongoose.Types.ObjectId.isValid(shopId)) {

            return sendGeneralResponse(res , false , "Invalid Shop ID", 400)

        }
         const shop = await Shop.findById(shopId)
        //  .populate({
        //     path: 'barbers', // Populate barbers field
        //     select: 'fullName profilePic servicesOffered', // Select specific fields from Barber model
        //   })
          .populate({
            path: 'services.subServices', // Populate nested subServices field if necessary
            select: 'subServiceName price duration',
          });
        if (!shop) {

            return sendGeneralResponse(res , false , "Shop not found", 404)

         }
       // Response with the shop details
       const shops = 
       {
       images: shop.images,
       barbers: shop.barbers.map(barber => ({
         id: barber._id,
         name: barber.fullName,
         servicesOffered: barber.servicesOffered,
         profile : barber.profilePic // Assuming `servicesOffered` is a field in Barber model
       })),
       about : `${shop.name} is a premier salon owned by ${shop.owner}. We are located at ${shop.address.houseNo}, ${shop.address.street}, ${shop.address.city}, ${shop.address.state}, ${shop.address.pin}, ${shop.address.country}. For appointments or inquiries, please contact us at ${shop.contactNumber} or email us at ${shop.email}. Visit our website at ${shop.website} to learn more about our services and offerings.`,
       services: shop.services,
       packages: shop.services.flatMap(service => service.subServices), // Flattening sub-services into packages
       reviews: shop.rating || [], // Assuming reviews are stored in the shop document
       gallery: shop.gallery ,
       
     }
      return sendGeneralResponse(res, true, 'data', 200, shops)
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