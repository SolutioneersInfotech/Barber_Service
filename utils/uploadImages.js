const { v2: cloudinary } = require('cloudinary');

// Configuration
cloudinary.config({ 
    cloud_name: 'di3jsead7', 
    api_key: '964556388875982', 
    api_secret: 'uzuCfsfMcOo1QYE5jhGUm7siEFQ' 
});

/**
 * Uploads an image to Cloudinary.
 * @param {Buffer} imageBuffer - The image file buffer.
 * @param {string} publicId - Optional public ID for the image.
 * @returns {Promise<string>} - The URL of the uploaded image.
 */

const uploadImage = async (imageBuffer, publicId) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { public_id: publicId, resource_type: 'image' },
            (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result.secure_url);
            }
        ).end(imageBuffer);
    });
};


module.exports = { uploadImage };