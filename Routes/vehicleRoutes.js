const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
// const upload = require('../middleware/upload');
const multer = require('multer');

const upload = new multer({
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

router.post('/add', upload.none(), vehicleController.createVehicle);

router.get('/', vehicleController.getVehicles);
router.get('/:id', vehicleController.getVehicleById);
router.put('/:id', vehicleController.updateVehicle);
router.delete('/:id', vehicleController.deleteVehicle);
router.post('/search', vehicleController.searchVehicles);
router.post('/bus', vehicleController.getBusVehicles);
router.post('/bus-spare', vehicleController.getBusSpareVehicles);


module.exports = router;
