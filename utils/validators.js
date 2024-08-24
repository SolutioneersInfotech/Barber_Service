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
