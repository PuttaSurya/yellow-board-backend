const express = require('express');
const router = express.Router();
const makeController = require('../controllers/makeController');

router.get('/', makeController.getMakes);

module.exports = router;
