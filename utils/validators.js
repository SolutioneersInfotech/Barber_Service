// /**
//  * Validate email format
//  * @param {string} email
//  * @returns {boolean}
//  */
// const validateEmail = (email) => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
// };

// /**
//  * Validate phone number format
//  * @param {string} phone
//  * @returns {boolean}
//  */
// const validatePhoneNumber = (phone) => {
//     const phoneRegex = /^[0-9]{10}$/; // Adjust regex as needed
//     return phoneRegex.test(phone);
// };

// module.exports = { validateEmail, validatePhoneNumber };
// Validator for email
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validator for phone number
const validatePhoneNumber = (phone) => {
    // const phoneRegex = /^\d{10}$/;
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;

    return phoneRegex.test(phone);
};




module.exports = {
    validateEmail,
    validatePhoneNumber
};
9