const express = require('express');
const router = express.Router(); 
const authRoutes = require('./authRoutes');
const vehicleRoutes = require('./vehicleRoutes');
const makeRoutes = require('./makeRoutes');

router.use('/auth', authRoutes);

router.use('/vehicle', vehicleRoutes);

router.use('/makes', makeRoutes);

module.exports = router;