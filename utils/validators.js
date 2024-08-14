const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validator for phone number
const validatePhoneNumber = (phone) => {
    // Example: phone number should be exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
};

module.exports = {
    validateEmail,
    validatePhoneNumber
};
