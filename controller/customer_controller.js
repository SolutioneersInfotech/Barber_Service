const Customer = require('../models/User_model')

const create= async(req,res)=>{
    try {
        const customer = new Customer(req.body);
        await customer.save();
        res.status(201).json({
            success: true,
            message: 'Customer created successfully',
            data: customer
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating customer',
            error: error.message
        });
    }
}

module.exports = { create }