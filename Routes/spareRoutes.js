const express = require('express');
const router = express.Router();
const passport = require('passport');
const spareController = require('../controllers/spareController');
const upload = require('../middleware/upload');

const authenticate = passport.authenticate('jwt', { session: false });

router.post('/add', authenticate, upload.uploadSpareImages, spareController.createSpare);
router.put('/:id', authenticate, spareController.updateSpare);
router.get('/',  authenticate,  spareController.getAllSparesByUserId);
router.get('/all-spares', spareController.getAllSpares);
router.get('/:id', spareController.getSpareById);
router.delete('/:id', authenticate, spareController.deleteSpare);
router.post('/search', authenticate, spareController.searchSpares);

module.exports = router;