const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const CommunityUser = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { validatePost, validatePagination, validateObjectId } = require('../middleware/validation');
const ReputationService = require('../services/reputationService');
const NotificationService = require('../services/notificationService');
const ModerationService = require('../services/moderationService');

// Get all posts with filtering and pagination
router.get('/', validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    // Category filter
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    // Tag filter
    if (req.query.tag) {
      filter.tags = { $in: [req.query.tag] };
    }
    
    // Search filter
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { content: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Only show approved posts for regular users
    filter.moderationStatus = 'APPROVED';
    
    // Sort options
    let sort = { lastActivity: -1 }; // Default: most recent activity
    if (req.query.sort === 'popular') {
      sort = { reputation: -1, createdAt: -1 };
    } else if (req.query.sort === 'newest') {
      sort = { createdAt: -1 };
    } else if (req.query.sort === 'oldest') {
      sort = { createdAt: 1 };
    }

    const posts = await Post.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Post.countDocuments(filter);

    // Add user information for each post
    const postsWithUserInfo = await Promise.all(posts.map(async (post) => {
      try {
        const user = await CommunityUser.findOne({ userId: post.userId }).lean();
        return {
          ...post,
          author: user ? {
            displayName: user.displayName,
            reputation: user.reputation,
            avatar: user.avatar
          } : {
            displayName: 'Unknown User',
            reputation: 0,
            avatar: ''
          }
        };
      } catch (error) {
        return {
          ...post,
          author: {
            displayName: 'Unknown User',
            reputation: 0,
            avatar: ''
          }
        };
      }
    }));

    res.json({
      posts: postsWithUserInfo,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get single post by ID
router.get('/:id', validateObjectId('id'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Increment view count
    post.views += 1;
    await post.save();

    // Get author information
    const author = await CommunityUser.findOne({ userId: post.userId }).lean();
    
    const postWithAuthor = {
      ...post.toObject(),
      author: author ? {
        displayName: author.displayName,
        reputation: author.reputation,
        avatar: author.avatar
      } : {
        displayName: 'Unknown User',
        reputation: 0,
        avatar: ''
      }
    };

    res.json(postWithAuthor);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Create new post
router.post('/', authenticateToken, validatePost, async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    
    // Check user behavior before creating post
    const userBehavior = await ModerationService.analyzeUserBehavior(req.user.id);
    
    if (userBehavior.rateLimit) {
      return res.status(429).json({ error: 'You are posting too frequently. Please wait before posting again.' });
    }

    const post = new Post({
      userId: req.user.id,
      title,
      content,
      category,
      tags: tags || [],
      moderationStatus: 'PENDING' // Will be updated by auto-moderation
    });

    await post.save();

    // Auto-moderate the post
    const moderationResult = await ModerationService.autoModerate(post, 'post');
    
    // Apply penalties if needed
    if (moderationResult.status === 'REJECTED') {
      await ModerationService.applyAutoPenalty(req.user.id, 'inappropriate');
    } else if (moderationResult.status === 'FLAGGED') {
      await ModerationService.applyAutoPenalty(req.user.id, 'spam');
    }

    // Update user statistics and reputation
    await ReputationService.updateStatistics(req.user.id, { postsCount: 1 });
    await ReputationService.addReputation(req.user.id, 'POST_CREATED');

    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Update post
router.put('/:id', authenticateToken, validateObjectId('id'), validatePost, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user owns the post
    if (post.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to edit this post' });
    }

    const { title, content, category, tags } = req.body;
    
    post.title = title;
    post.content = content;
    post.category = category;
    post.tags = tags || [];
    post.moderationStatus = 'PENDING'; // Re-moderate after edit

    await post.save();

    res.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Delete post
router.delete('/:id', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user owns the post
    if (post.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    // Delete all comments associated with the post
    await Comment.deleteMany({ postId: req.params.id });

    // Delete the post
    await Post.findByIdAndDelete(req.params.id);

    // Update user statistics
    await CommunityUser.findOneAndUpdate(
      { userId: req.user.id },
      { $inc: { 'statistics.postsCount': -1 } }
    );

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Like/Unlike post
router.post('/:id/like', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const userId = req.user.id;
    const isLiked = post.isLikedBy(userId);
    const isDisliked = post.isDislikedBy(userId);

    if (isLiked) {
      // Remove like
      post.likes = post.likes.filter(like => like.userId !== userId);
    } else {
      // Add like and remove dislike if exists
      if (isDisliked) {
        post.dislikes = post.dislikes.filter(dislike => dislike.userId !== userId);
      }
      post.likes.push({ userId });
    }

    await post.save();

    // Update reputation and send notifications
    if (!isLiked) {
      // User liked the post
      await ReputationService.addReputation(post.userId, 'POST_LIKED');
      await ReputationService.updateStatistics(req.user.id, { likesGiven: 1 });
      await ReputationService.updateStatistics(post.userId, { likesReceived: 1 });
      
      // Send notification to post author
      await NotificationService.notifyPostLiked(post.userId, req.user.id, post._id, post.title);
    }

    res.json({
      liked: !isLiked,
      likeCount: post.likeCount,
      dislikeCount: post.dislikeCount
    });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

// Dislike/Remove dislike post
router.post('/:id/dislike', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const userId = req.user.id;
    const isLiked = post.isLikedBy(userId);
    const isDisliked = post.isDislikedBy(userId);

    if (isDisliked) {
      // Remove dislike
      post.dislikes = post.dislikes.filter(dislike => dislike.userId !== userId);
    } else {
      // Add dislike and remove like if exists
      if (isLiked) {
        post.likes = post.likes.filter(like => like.userId !== userId);
      }
      post.dislikes.push({ userId });
    }

    await post.save();

    res.json({
      disliked: !isDisliked,
      likeCount: post.likeCount,
      dislikeCount: post.dislikeCount
    });
  } catch (error) {
    console.error('Error disliking post:', error);
    res.status(500).json({ error: 'Failed to dislike post' });
  }
});

// Get post comments
router.get('/:id/comments', validateObjectId('id'), validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ 
      postId: req.params.id,
      parentCommentId: null, // Only top-level comments
      moderationStatus: 'APPROVED'
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('replies')
    .lean();

    const total = await Comment.countDocuments({ 
      postId: req.params.id,
      parentCommentId: null,
      moderationStatus: 'APPROVED'
    });

    // Add user information for each comment
    const commentsWithUserInfo = await Promise.all(comments.map(async (comment) => {
      const user = await CommunityUser.findOne({ userId: comment.userId }).lean();
      return {
        ...comment,
        author: user ? {
          displayName: user.displayName,
          reputation: user.reputation,
          avatar: user.avatar
        } : {
          displayName: 'Unknown User',
          reputation: 0,
          avatar: ''
        }
      };
    }));

    res.json({
      comments: commentsWithUserInfo,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalComments: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

module.exports = router;