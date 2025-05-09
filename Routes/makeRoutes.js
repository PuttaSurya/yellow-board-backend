const express = require('express');
const router = express.Router();
const makeController = require('../controllers/makeController');

router.get('/allowed-makes', makeController.getMakes);

module.exports = router;
