const express = require('express');
const controller = require('../controllers/ads');
const { requireAuth } = require('../../config/passport');
const router = express.Router();

/**
 * Get user's ads
 * @method  GET
 * @access  Public
 * @example GET /ads/user/5b903ab8f82dcff71c91143c
 */
router.get('/user/:id', controller.showUserAds);

/**
 * Get category ads
 * @method  GET
 * @access  Public
 * @example GET /ads/category/2
 */
router.get('/category/:id', controller.showCategoryAds);

/**
 * Get last ads
 * @method  GET
 * @access  Public
 * @example GET /ads/last
 */
router.get('/last', controller.showLastAds);

/**
 * Get an ad
 * @method  GET
 * @access  Public
 * @example GET /ads/5b903b0275fc413ee8e05579
 */
router.get('/:id', controller.showAd);

/**
 * Delete an ad
 * @method  DELETE
 * @access  Private
 * @example DELETE /ads/5b903b0eb42139d9d4210c28
 */
router.delete('/:id', requireAuth, controller.removeAd);

/**
 * Create an ad
 * @method  POST
 * @access  Private
 * @example POST /ads
 */
router.post('/', requireAuth, controller.createAd);

/**
 * Search ads
 * @method  GET
 * @access  Public
 * @example GET /ads?title=title&location=location
 */
router.get('/', controller.searchAd);

module.exports = router;
