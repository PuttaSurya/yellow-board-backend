const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const vehicleController = require('../controllers/vehicleController');
const passport = require('passport');


const ensureAuthenticated = passport.authenticate('jwt', { session: false });

// Use the S3 upload middleware when expecting files
router.post('/add', upload.uploadS3,ensureAuthenticated, vehicleController.createVehicle);

// Use uploadNone for non-file data (if needed)
router.post('/add-non-file', upload.uploadNone.none(), vehicleController.createVehicle);


router.get('/make-counts', vehicleController.getMakeCounts);
router.get('/all',ensureAuthenticated, vehicleController.getVehicles);
router.get('/:id', vehicleController.getVehicleById);
router.put('/:id', vehicleController.updateVehicle);
router.delete('/:id', vehicleController.deleteVehicle);
router.post('/search', vehicleController.searchVehicles);
router.post('/bus', vehicleController.getBusVehicles);
router.post('/bus-spare', vehicleController.getBusSpareVehicles);


module.exports = router;
