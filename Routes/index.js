const express = require('express');
const router = express.Router(); 
const authRoutes = require('./authRoutes');
const vehicleRoutes = require('./vehicleRoutes');
const makeRoutes = require('./makeRoutes');
const userRoutes = require('./userRoutes');

router.use('/auth', authRoutes);

router.use('/user', userRoutes);

router.use('/vehicle', vehicleRoutes);

router.use('/makes', makeRoutes);

module.exports = router;