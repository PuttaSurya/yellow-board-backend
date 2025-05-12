const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const passport = require('passport');


router.get('/all', userController.getAllUsers);
router.get('/:id', userController.getUserById);

module.exports = router;
