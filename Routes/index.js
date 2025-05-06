const express = require('express');
const router = express.Router(); 
const authRoutes = require('./authRoutes');
const vehicleRoutes = require('./vehicleRoutes');

router.use('/auth', authRoutes);

router.use('/vehicle', vehicleRoutes);

module.exports = router;