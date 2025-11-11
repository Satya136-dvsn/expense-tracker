const express = require('express');
const router = express.Router();
const CommunityUser = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { authenticateToken } = require('../middleware/auth');
const { validateUserProfile, validatePagination } = require('../middleware/validation');
const ReputationService = require('../services/reputationService');
const NotificationService = require('../services/notificationService');

// Get current user's community profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    let user = await CommunityUser.findOne({ userId: req.user.id });
    
    if (!user) {
      // Create community profile if it doesn't exist
      user = new CommunityUser({
        userId: req.user.id,
        displayName: req.user.username || req.user.email || 'User',
        bio: '',
        reputation: 0
      });
      await user.save();
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update current user's community profile
router.put('/profile', authenticateToken, validateUserProfile, async (req, res) => {
  try {
    const { displayName, bio, avatar } = req.body;
    
    let user = await CommunityUser.findOne({ userId: req.user.id });
    
    if (!user) {
      user = new CommunityUser({
        userId: req.user.id,
        displayName,
        bio: bio || '',
        avatar: avatar || '',
        reputation: 0
      });
    } else {
      user.displayName = displayName;
      user.bio = bio || '';
      if (avatar !== undefined) user.avatar = avatar;
    }

    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// Get user profile by ID
router.get('/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const user = await CommunityUser.findOne({ userId }).lean();
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's recent posts
    const recentPosts = await Post.find({ 
      userId,
      moderationStatus: 'APPROVED'
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('title createdAt category likeCount commentsCount')
    .lean();

    // Get user's recent comments
    const recentComments = await Comment.find({ 
      userId,
      moderationStatus: 'APPROVED'
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('postId', 'title')
    .lean();

    const userProfile = {
      ...user,
      recentPosts,
      recentComments
    };

    res.json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Follow/Unfollow user
router.post('/:userId/follow', authenticateToken, async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.userId);
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    // Check if target user exists
    const targetUser = await CommunityUser.findOne({ userId: targetUserId });
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get or create current user
    let currentUser = await CommunityUser.findOne({ userId: currentUserId });
    if (!currentUser) {
      currentUser = new CommunityUser({
        userId: currentUserId,
        displayName: req.user.username || req.user.email || 'User'
      });
    }

    const isFollowing = currentUser.isFollowing(targetUserId);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(f => f.userId !== targetUserId);
      targetUser.followers = targetUser.followers.filter(f => f.userId !== currentUserId);
    } else {
      // Follow
      currentUser.following.push({ userId: targetUserId });
      targetUser.followers.push({ userId: currentUserId });
    }

    await currentUser.save();
    await targetUser.save();

    // Send notification and update reputation
    if (!isFollowing) {
      // User started following
      await ReputationService.addReputation(currentUserId, 'FOLLOWED');
      await NotificationService.notifyNewFollower(targetUserId, currentUserId);
    }

    res.json({
      following: !isFollowing,
      followerCount: targetUser.followerCount,
      followingCount: currentUser.followingCount
    });
  } catch (error) {
    console.error('Error following/unfollowing user:', error);
    res.status(500).json({ error: 'Failed to follow/unfollow user' });
  }
});

// Get user's followers
router.get('/:userId/followers', validatePagination, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await CommunityUser.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const followerIds = user.followers.map(f => f.userId);
    const followers = await CommunityUser.find({ userId: { $in: followerIds } })
      .select('userId displayName avatar reputation')
      .skip(skip)
      .limit(limit)
      .lean();

    const total = followerIds.length;

    res.json({
      followers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalFollowers: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ error: 'Failed to fetch followers' });
  }
});

// Get user's following
router.get('/:userId/following', validatePagination, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await CommunityUser.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const followingIds = user.following.map(f => f.userId);
    const following = await CommunityUser.find({ userId: { $in: followingIds } })
      .select('userId displayName avatar reputation')
      .skip(skip)
      .limit(limit)
      .lean();

    const total = followingIds.length;

    res.json({
      following,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalFollowing: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ error: 'Failed to fetch following' });
  }
});

// Bookmark/Unbookmark post
router.post('/bookmarks/:postId', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.postId;
    
    // Verify post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    let user = await CommunityUser.findOne({ userId: req.user.id });
    if (!user) {
      user = new CommunityUser({
        userId: req.user.id,
        displayName: req.user.username || req.user.email || 'User'
      });
    }

    const isBookmarked = user.bookmarks.some(b => b.postId.toString() === postId);

    if (isBookmarked) {
      // Remove bookmark
      user.bookmarks = user.bookmarks.filter(b => b.postId.toString() !== postId);
    } else {
      // Add bookmark
      user.bookmarks.push({ postId });
    }

    await user.save();

    res.json({
      bookmarked: !isBookmarked,
      bookmarkCount: user.bookmarks.length
    });
  } catch (error) {
    console.error('Error bookmarking post:', error);
    res.status(500).json({ error: 'Failed to bookmark post' });
  }
});

// Get user's bookmarks
router.get('/bookmarks', authenticateToken, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await CommunityUser.findOne({ userId: req.user.id });
    if (!user) {
      return res.json({ bookmarks: [], pagination: { currentPage: 1, totalPages: 0, totalBookmarks: 0 } });
    }

    const bookmarkIds = user.bookmarks.map(b => b.postId);
    const bookmarkedPosts = await Post.find({ 
      _id: { $in: bookmarkIds },
      moderationStatus: 'APPROVED'
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

    // Add author information
    const postsWithAuthors = await Promise.all(bookmarkedPosts.map(async (post) => {
      const author = await CommunityUser.findOne({ userId: post.userId }).lean();
      return {
        ...post,
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
    }));

    const total = bookmarkIds.length;

    res.json({
      bookmarks: postsWithAuthors,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalBookmarks: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
});

// Get leaderboard
router.get('/leaderboard', validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const users = await CommunityUser.find({ isActive: true })
      .sort({ reputation: -1 })
      .skip(skip)
      .limit(limit)
      .select('userId displayName avatar reputation statistics badges')
      .lean();

    const total = await CommunityUser.countDocuments({ isActive: true });

    res.json({
      leaderboard: users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;