const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Register route
router.post('/register',
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please enter a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
  ],
  authController.register
);

// Login route
router.post('/login',
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  authController.login
);

// Get current user profile (protected)
router.get('/profile', auth, authController.getProfile);

// Update profile (protected)
router.put('/profile', auth, authController.updateProfile);

// Follow user (protected)
router.post('/follow/:userId', auth, authController.followUser);

// Unfollow user (protected)
router.delete('/follow/:userId', auth, authController.unfollowUser);

// Search users (protected)
router.get('/search', auth, authController.searchUsers);

module.exports = router;
