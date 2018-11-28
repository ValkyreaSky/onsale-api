const express = require('express');
const controller = require('../controllers/favourites');
const { requireAuth } = require('../../config/passport');
const router = express.Router();

/**
 * Get favourites
 * @method  GET
 * @access  Private
 * @example GET /favourites
 */
router.get('/', requireAuth, controller.getFavourites);

/**
 * Add an ad to favourites
 * @method  POST
 * @access  Private
 * @example POST /favourites/5b903b85d6a6d5b77cfc804f
 */
router.post('/:id', requireAuth, controller.addFavourite);

/**
 * Remove an ad from favourites
 * @method  DELETE
 * @access  Private
 * @example DELETE /favourites/5b903b9b205687b04bbc0015
 */
router.delete('/:id', requireAuth, controller.removeFavourite);

module.exports = router;
