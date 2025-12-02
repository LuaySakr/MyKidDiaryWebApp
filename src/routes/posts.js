const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');

// All routes are protected - require authentication

// Create a new post
router.post('/',
  auth,
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 200 })
      .withMessage('Title must not exceed 200 characters'),
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Content is required')
      .isLength({ max: 10000 })
      .withMessage('Content must not exceed 10000 characters'),
    body('privacy')
      .optional()
      .isIn(['private', 'followers', 'specific', 'public'])
      .withMessage('Invalid privacy setting')
  ],
  postController.createPost
);

// Get all accessible posts
router.get('/', auth, postController.getPosts);

// Get user's own posts
router.get('/my-posts', auth, postController.getMyPosts);

// Get a specific post
router.get('/:postId', auth, postController.getPost);

// Update a post
router.put('/:postId', 
  auth,
  [
    body('title')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Title must not exceed 200 characters'),
    body('content')
      .optional()
      .trim()
      .isLength({ max: 10000 })
      .withMessage('Content must not exceed 10000 characters'),
    body('privacy')
      .optional()
      .isIn(['private', 'followers', 'specific', 'public'])
      .withMessage('Invalid privacy setting')
  ],
  postController.updatePost
);

// Delete a post
router.delete('/:postId', auth, postController.deletePost);

module.exports = router;
