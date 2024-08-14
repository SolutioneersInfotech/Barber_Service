const Barber = require('../models/barber_model');

// Create a new barber
exports.createBarber = async (req, res) => {
    try {
        const barber = new Barber(req.body);
        await barber.save();
        res.status(201).json(barber);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all barbers
exports.getAllBarbers = async (req, res) => {
    try {
        const barbers = await Barber.find();
        res.status(200).json(barbers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a barber by ID
exports.getBarberById = async (req, res) => {
    try {
        const barber = await Barber.findById(req.params.id);
        if (!barber) {
            return res.status(404).json({ message: 'Barber not found' });
        }
        res.status(200).json(barber);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a barber by ID
exports.updateBarberById = async (req, res) => {
    try {
        const barber = await Barber.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!barber) {
            return res.status(404).json({ message: 'Barber not found' });
        }
        res.status(200).json(barber);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a barber by ID
exports.deleteBarberById = async (req, res) => {
    try {
        const barber = await Barber.findByIdAndDelete(req.params.id);
        if (!barber) {
            return res.status(404).json({ message: 'Barber not found' });
        }
        res.status(200).json({ message: 'Barber deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
