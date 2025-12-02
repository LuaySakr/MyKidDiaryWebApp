const { validationResult } = require('express-validator');
const Post = require('../models/Post');
const User = require('../models/User');

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, privacy, sharedWith } = req.body;

    const post = new Post({
      title,
      content,
      author: req.userId,
      privacy: privacy || 'private',
      sharedWith: privacy === 'specific' ? sharedWith : []
    });

    await post.save();
    await post.populate('author', 'username');

    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error while creating post' });
  }
};

// Get all posts accessible to the user
exports.getPosts = async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    
    // Find posts that the user can see:
    // 1. Their own posts
    // 2. Public posts
    // 3. Posts from users they follow (with 'followers' privacy)
    // 4. Posts specifically shared with them
    const posts = await Post.find({
      $or: [
        { author: req.userId },
        { privacy: 'public' },
        { 
          privacy: 'followers',
          author: { $in: currentUser.following }
        },
        {
          privacy: 'specific',
          sharedWith: req.userId
        }
      ]
    })
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific post
exports.getPost = async (req, res) => {
  try {
    const { postId } = req.params;
    
    const post = await Post.findById(postId)
      .populate('author', 'username')
      .populate('sharedWith', 'username');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user has permission to view this post
    const currentUser = await User.findById(req.userId);
    const canView = 
      post.author._id.toString() === req.userId ||
      post.privacy === 'public' ||
      (post.privacy === 'followers' && currentUser.following.some(id => id.toString() === post.author._id.toString())) ||
      (post.privacy === 'specific' && post.sharedWith.some(user => user._id.toString() === req.userId));

    if (!canView) {
      return res.status(403).json({ message: 'You do not have permission to view this post' });
    }

    res.json(post);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a post
exports.updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, content, privacy, sharedWith } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'You can only update your own posts' });
    }

    // Update fields
    if (title) post.title = title;
    if (content) post.content = content;
    if (privacy) post.privacy = privacy;
    if (privacy === 'specific' && sharedWith) {
      post.sharedWith = sharedWith;
    } else if (privacy !== 'specific') {
      post.sharedWith = [];
    }

    await post.save();
    await post.populate('author', 'username');

    res.json(post);
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }

    await Post.findByIdAndDelete(postId);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's own posts
exports.getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.userId })
      .populate('author', 'username')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error('Get my posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
