const Shop = require('../models/shop_model');
const { sendGeneralResponse } = require('../utils/responseHelper');

const getPopularShops = async (req, res) => {
    try {
        const shops = await Shop.find({})
            .sort({ ratings: -1 }) 
            .select('name rating address.houseNo address.street address.city address.state address.pin address.latitude address.longitude address.country');
        sendGeneralResponse(res, true, 'Popular shops', 200, shops);
    } catch (err) {
        console.error(err);
        sendGeneralResponse(res, false, 'Error fetching popular shops', 500, err.message);
    }
};

module.exports = { getPopularShops };
