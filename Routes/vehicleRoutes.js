const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const vehicleController = require('../controllers/vehicleController');
const passport = require('passport');


const ensureAuthenticated = passport.authenticate('jwt', { session: false });

// Use the S3 upload middleware when expecting files
router.post('/add', upload.uploadVehicleImages,ensureAuthenticated, vehicleController.createVehicle);

// Use uploadNone for non-file data (if needed)
router.post('/add-non-file', upload.uploadNone.none(), vehicleController.createVehicle);

router.get('/locations', vehicleController.getAllLocations);
router.get('/make-counts', vehicleController.getMakeCounts);
router.get('/user/all',ensureAuthenticated, vehicleController.getAllVehiclesByUserId);
router.get('/all-vehicles', vehicleController.getAllVehicles);
router.get('/:id', vehicleController.getVehicleById);
router.put('/:id', vehicleController.updateVehicle);
router.delete('/:id', vehicleController.deleteVehicle);
router.post('/search', vehicleController.searchVehicles);





module.exports = router;
