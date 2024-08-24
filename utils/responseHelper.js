/**
 * Sends a custom error response.
 *
 * @param {Object} res - Express response object.
 * @param {string} message - Error message to be sent.
 * @param {boolean} status - Error message to be sent.
 * @param {number} statusCode - HTTP status code (default is 400).
 *  * @param {Object|Array} [data=[]] - Optional data to be included in the response.

 * @returns {Object} - JSON response with the error message.
 */
function sendGeneralResponse(res, status, message, statusCode, data=[]) {
    return res.status(statusCode).json({
        status: status,
        message: message,
        data: data
    });
}

module.exports = {
    sendGeneralResponse: sendGeneralResponse
};
