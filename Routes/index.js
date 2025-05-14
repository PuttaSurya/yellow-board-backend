const express = require('express');
const router = express.Router(); 
const authRoutes = require('./authRoutes');
const vehicleRoutes = require('./vehicleRoutes');
const makeRoutes = require('./makeRoutes');
const userRoutes = require('./userRoutes');
const spareRoutes = require('./spareRoutes');

router.use('/auth', authRoutes);

router.use('/user', userRoutes);

router.use('/vehicle', vehicleRoutes);

router.use('/makes', makeRoutes);

router.use('/spare', spareRoutes);

module.exports = router;