const express = require('express');
const controller = require('../controllers/users');
const { requireAuth } = require('../../config/passport');
const router = express.Router();

/**
 * Create a new account
 * @method  POST
 * @access  Public
 * @example POST /users/register
 */
router.post('/register', controller.registerUser);

/**
 * Get the JWT
 * @method  POST
 * @access  Public
 * @example POST /users/login
 */
router.post('/login', controller.loginUser);

/**
 * Update account
 * @method  PATCH
 * @access  Private
 * @example PATCH /users
 */
router.patch('/', requireAuth, controller.updateUser);

/**
 * Remove account
 * @method  DELETE
 * @access  Private
 * @example DELETE /users
 */
router.delete('/', requireAuth, controller.removeUser);

module.exports = router;
