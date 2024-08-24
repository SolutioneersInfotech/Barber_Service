const express = require("express");
const customerController = require('../controller/cust_controller');

const router = express.Router(); // Use router for defining routes

// Customer Routes
router.post('/', customerController.createCustomer);
router.get('/', customerController.getAllCustomers);
router.get('/:id', customerController.getCustomerById);
router.put('/:id', customerController.updateCustomerById);
router.delete('/:id', customerController.deleteCustomerById);
router.get('/phone/:phone', customerController.getCustomerByPhone);
router.post('/:id/appointments', customerController.addAppointmentToCustomer);
router.put('/:id/preferences', customerController.updateCustomerPreferences);

module.exports = router;
