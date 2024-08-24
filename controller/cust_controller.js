const Customer = require('../models/cust_models');

// Create a new customer
exports.createCustomer = async (req, res) => {
    try {
        const customer = new Customer(req.body);
        await customer.save();
        res.status(201).json({ success: true, message: 'Customer created successfully', customer });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error creating customer', error: error.message });
    }
};

// Get all customers
exports.getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.find();
        res.status(200).json({ success: true, customers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching customers', error: error.message });
    }
};

// Get a single customer by ID
exports.getCustomerById = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        res.status(200).json({ success: true, customer });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching customer', error: error.message });
    }
};

// Update a customer by ID
exports.updateCustomerById = async (req, res) => {
    try {
        const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        res.status(200).json({ success: true, message: 'Customer updated successfully', customer });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error updating customer', error: error.message });
    }
};

// Delete a customer by ID
exports.deleteCustomerById = async (req, res) => {
    try {
        const customer = await Customer.findByIdAndDelete(req.params.id);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        res.status(200).json({ success: true, message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting customer', error: error.message });
    }
};

// Get a customer by phone number
exports.getCustomerByPhone = async (req, res) => {
    try {
        const customer = await Customer.findOne({ phone: req.params.phone });
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        res.status(200).json({ success: true, customer });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching customer by phone', error: error.message });
    }
};

// Add a new appointment to a customer's history
exports.addAppointmentToCustomer = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        customer.appointmentHistory.push(req.body);
        await customer.save();
        res.status(200).json({ success: true, message: 'Appointment added successfully', customer });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error adding appointment', error: error.message });
    }
};

// Update customer's preferences
exports.updateCustomerPreferences = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        customer.preferences = req.body.preferences;
        await customer.save();
        res.status(200).json({ success: true, message: 'Preferences updated successfully', customer });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error updating preferences', error: error.message });
    }
};
