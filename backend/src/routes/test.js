const express = require('express');
const { Category } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Test database connection
router.get('/db', asyncHandler(async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json({
      success: true,
      message: 'Database connection successful',
      data: {
        categoriesCount: categories.length,
        categories: categories
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
}));

// Test simple response
router.get('/ping', (req, res) => {
  res.json({
    success: true,
    message: 'pong',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
