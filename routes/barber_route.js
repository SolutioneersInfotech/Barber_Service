const express = require("express");
const barberController = require('../controller/barber_controller');

const router = express.Router(); // Use router for defining routes

// Barber Routes
router.post('/', barberController.createBarber);
router.get('/', barberController.getAllBarbers);
router.get('/:id', barberController.getBarberById);
router.put('/:id', barberController.updateBarberById);
router.delete('/:id', barberController.deleteBarberById);

module.exports = router;
