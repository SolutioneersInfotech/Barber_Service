const Shop = require('../models/shop_model')



const shopdetails = async (req, res) => {
    try {
        const shopId = req.params.id;
        const shop = await Shop.findById(shopId).populate('barbers services ratings.customer');
        if (!shop) {
            return res.status(404).json({ success: false, message: 'Shop not found' });
        }
        res.status(200).json({ success: true, data: shop });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching shop details', error: error.message });
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