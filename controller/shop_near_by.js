 
 
// const Shop = require('../models/shop_model');
//  const { sendGeneralResponse } = require('../utils/responseHelper');
 

// const getNearbyShops = async (req, res) =>  {
//     const { latitude, longitude } = req.query;


//     if (!latitude || !longitude) {
//         return sendGeneralResponse(res, false, 'Latitude and Longitude are required', 400, null);
//     }

//     try { 
//         const lat = parseFloat(latitude);
//         const lng = parseFloat(longitude);

//         const shops = await Shop.find({})
//             .select('name  ratings  address.houseNo address.street address.city address.state address.pin  address.latitude address.longitude address.country');
//         sendGeneralResponse(res, true, 'Nearby Shops', 200, shops);
//     } catch (error) {
//         sendGeneralResponse(res, false, 'Error fetching nearby shops', 500, error.message);
//     }
// };


// module.exports = {getNearbyShops};






const Shop = require('../models/shop_model');
const { sendGeneralResponse } = require('../utils/responseHelper');

const getNearbyShops = async (req, res) => {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
        return sendGeneralResponse(res, false, 'Latitude and Longitude are required', 400, null);
    }

    try {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        // Fetch all shops
        const shops = await Shop.find({})
            .select('name ratings address.houseNo address.street address.city address.state address.pin address.latitude address.longitude address.country');

        // Calculate distance and sort the shops
        const sortedShops = shops.map(shop => {
            const shopLat = shop.address.latitude;
            const shopLng = shop.address.longitude;

            // Calculate the Haversine distance
            const distance = getDistanceFromLatLonInKm(lat, lng, shopLat, shopLng);

            return { ...shop._doc, distance }; // Add distance to the shop object
        }).sort((a, b) => a.distance - b.distance); // Sort by distance

        sendGeneralResponse(res, true, 'Nearby Shops', 200, sortedShops);
    } catch (error) {
        sendGeneralResponse(res, false, 'Error fetching nearby shops', 500, error.message);
    }
};

// Haversine formula to calculate distance between two lat/lng points in km
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

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

module.exports = { getNearbyShops };


