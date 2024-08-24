const { sendGeneralResponse } = require('./responseHelper');

function validateRequiredFields(res, fields) {
     for (const [key, value] of Object.entries(fields)) {
        if (!value) {
            return sendGeneralResponse(res, false, `${key} field is required`, 400);
        }
    }
    return true;
}

module.exports = {
    validateRequiredFields
};

