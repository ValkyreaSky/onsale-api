const express = require('express');
const router = express.Router();
const NotFoundError = require('../../errors/NotFoundError');

// Last route which responses with 404 Not Found error
router.use((req, res) => {
  res.status(404).json(new NotFoundError());
});

module.exports = router;
