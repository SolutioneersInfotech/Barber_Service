
const { sendGeneralResponse } = require('./responseHelper');

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validator for phone number
const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;

    return phoneRegex.test(phone);
};

// validate empety fields
function validateRequiredFields(res, fields) {
     for (const [key, value] of Object.entries(fields)) {
        if (!value) {
            return sendGeneralResponse(res, false, `${key} field is required`, 400);
        }
    }
    return true;
}

module.exports = {
    validateEmail,
    validatePhoneNumber,
    validateRequiredFields
};
9