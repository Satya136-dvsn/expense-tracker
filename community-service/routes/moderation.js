const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const CommunityUser = require('../models/User');
const { authenticateToken, requireModerator } = require('../middleware/auth');
const { validatePagination, validateObjectId } = require('../middleware/validation');

// Report content (post or comment)
router.post('/report', authenticateToken, async (req, res) => {
  try {
    const { contentType, contentId, reason, description } = req.body;
    
    if (!['post', 'comment'].includes(contentType)) {
      return res.status(400).json({ error: 'Invalid content type' });
    }

    let content;
    if (contentType === 'post') {
      content = await Post.findById(contentId);
    } else {
      content = await Comment.findById(contentId);
    }

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Increment report count
    content.reportCount = (content.reportCount || 0) + 1;
    
    // Auto-flag content if it receives multiple reports
    if (content.reportCount >= 3) {
      content.moderationStatus = 'FLAGGED';
    }

    await content.save();

    // In a real implementation, you would also save the report details
    // to a separate reports collection for moderator review

    res.json({ 
      message: 'Content reported successfully',
      reportCount: content.reportCount
    });
  } catch (error) {
    console.error('Error reporting content:', error);
    res.status(500).json({ error: 'Failed to report content' });
  }
});

// Get flagged content for moderation (moderators only)
router.get('/flagged', authenticateToken, requireModerator, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const contentType = req.query.type || 'all'; // 'post', 'comment', or 'all'

    let flaggedContent = [];

    if (contentType === 'all' || contentType === 'post') {
      const flaggedPosts = await Post.find({ 
        moderationStatus: { $in: ['PENDING', 'FLAGGED'] }
      })
      .sort({ reportCount: -1, createdAt: -1 })
      .skip(contentType === 'all' ? 0 : skip)
      .limit(contentType === 'all' ? limit / 2 : limit)
      .lean();

      const postsWithAuthors = await Promise.all(flaggedPosts.map(async (post) => {
        const author = await CommunityUser.findOne({ userId: post.userId }).lean();
        return {
          ...post,
          contentType: 'post',
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

      flaggedContent = flaggedContent.concat(postsWithAuthors);
    }

    if (contentType === 'all' || contentType === 'comment') {
      const flaggedComments = await Comment.find({ 
        moderationStatus: { $in: ['PENDING', 'FLAGGED'] }
      })
      .sort({ reportCount: -1, createdAt: -1 })
      .skip(contentType === 'all' ? 0 : skip)
      .limit(contentType === 'all' ? limit / 2 : limit)
      .populate('postId', 'title')
      .lean();

      const commentsWithAuthors = await Promise.all(flaggedComments.map(async (comment) => {
        const author = await CommunityUser.findOne({ userId: comment.userId }).lean();
        return {
          ...comment,
          contentType: 'comment',
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

      flaggedContent = flaggedContent.concat(commentsWithAuthors);
    }

    // Sort combined results by report count and creation date
    flaggedContent.sort((a, b) => {
      if (b.reportCount !== a.reportCount) {
        return b.reportCount - a.reportCount;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // Apply pagination to combined results if showing all content types
    if (contentType === 'all') {
      flaggedContent = flaggedContent.slice(skip, skip + limit);
    }

    const totalPosts = contentType !== 'comment' ? await Post.countDocuments({ 
      moderationStatus: { $in: ['PENDING', 'FLAGGED'] }
    }) : 0;

    const totalComments = contentType !== 'post' ? await Comment.countDocuments({ 
      moderationStatus: { $in: ['PENDING', 'FLAGGED'] }
    }) : 0;

    const total = contentType === 'all' ? totalPosts + totalComments : 
                  contentType === 'post' ? totalPosts : totalComments;

    res.json({
      flaggedContent,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching flagged content:', error);
    res.status(500).json({ error: 'Failed to fetch flagged content' });
  }
});

// Moderate content (approve, reject, or delete)
router.post('/moderate', authenticateToken, requireModerator, async (req, res) => {
  try {
    const { contentType, contentId, action, reason } = req.body;
    
    if (!['post', 'comment'].includes(contentType)) {
      return res.status(400).json({ error: 'Invalid content type' });
    }

    if (!['approve', 'reject', 'delete'].includes(action)) {
      return res.status(400).json({ error: 'Invalid moderation action' });
    }

    let content;
    if (contentType === 'post') {
      content = await Post.findById(contentId);
    } else {
      content = await Comment.findById(contentId);
    }

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    if (action === 'delete') {
      // Delete content and associated data
      if (contentType === 'post') {
        // Delete all comments associated with the post
        await Comment.deleteMany({ postId: contentId });
        await Post.findByIdAndDelete(contentId);
        
        // Update user statistics
        await CommunityUser.findOneAndUpdate(
          { userId: content.userId },
          { $inc: { 'statistics.postsCount': -1 } }
        );
      } else {
        // Delete comment and update post comment count
        await Comment.findByIdAndDelete(contentId);
        await Post.findByIdAndUpdate(
          content.postId,
          { $inc: { commentsCount: -1 } }
        );
        
        // Update user statistics
        await CommunityUser.findOneAndUpdate(
          { userId: content.userId },
          { $inc: { 'statistics.commentsCount': -1 } }
        );
      }

      // Apply reputation penalty for deleted content
      await CommunityUser.findOneAndUpdate(
        { userId: content.userId },
        { $inc: { reputation: -10 } }
      );

    } else {
      // Update moderation status
      content.moderationStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
      content.moderationReason = reason || '';
      content.isModerated = true;
      
      await content.save();

      // Apply reputation changes
      if (action === 'approve') {
        await CommunityUser.findOneAndUpdate(
          { userId: content.userId },
          { $inc: { reputation: 1 } }
        );
      } else if (action === 'reject') {
        await CommunityUser.findOneAndUpdate(
          { userId: content.userId },
          { $inc: { reputation: -5 } }
        );
      }
    }

    res.json({ 
      message: `Content ${action}d successfully`,
      action,
      contentType,
      contentId
    });
  } catch (error) {
    console.error('Error moderating content:', error);
    res.status(500).json({ error: 'Failed to moderate content' });
  }
});

// Get moderation statistics
router.get('/stats', authenticateToken, requireModerator, async (req, res) => {
  try {
    const stats = {
      posts: {
        pending: await Post.countDocuments({ moderationStatus: 'PENDING' }),
        flagged: await Post.countDocuments({ moderationStatus: 'FLAGGED' }),
        approved: await Post.countDocuments({ moderationStatus: 'APPROVED' }),
        rejected: await Post.countDocuments({ moderationStatus: 'REJECTED' })
      },
      comments: {
        pending: await Comment.countDocuments({ moderationStatus: 'PENDING' }),
        flagged: await Comment.countDocuments({ moderationStatus: 'FLAGGED' }),
        approved: await Comment.countDocuments({ moderationStatus: 'APPROVED' }),
        rejected: await Comment.countDocuments({ moderationStatus: 'REJECTED' })
      },
      users: {
        total: await CommunityUser.countDocuments({ isActive: true }),
        highReputation: await CommunityUser.countDocuments({ reputation: { $gte: 100 } }),
        lowReputation: await CommunityUser.countDocuments({ reputation: { $lt: 0 } })
      }
    };

    // Calculate totals
    stats.totals = {
      pendingReview: stats.posts.pending + stats.comments.pending,
      flaggedContent: stats.posts.flagged + stats.comments.flagged,
      totalContent: stats.posts.approved + stats.posts.rejected + stats.comments.approved + stats.comments.rejected
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching moderation stats:', error);
    res.status(500).json({ error: 'Failed to fetch moderation statistics' });
  }
});

// Bulk moderation actions
router.post('/bulk-moderate', authenticateToken, requireModerator, async (req, res) => {
  try {
    const { items, action, reason } = req.body;
    
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array is required' });
    }

    if (!['approve', 'reject', 'delete'].includes(action)) {
      return res.status(400).json({ error: 'Invalid moderation action' });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (const item of items) {
      try {
        const { contentType, contentId } = item;
        
        let content;
        if (contentType === 'post') {
          content = await Post.findById(contentId);
        } else if (contentType === 'comment') {
          content = await Comment.findById(contentId);
        }

        if (!content) {
          results.failed++;
          results.errors.push(`${contentType} ${contentId} not found`);
          continue;
        }

        if (action === 'delete') {
          if (contentType === 'post') {
            await Comment.deleteMany({ postId: contentId });
            await Post.findByIdAndDelete(contentId);
          } else {
            await Comment.findByIdAndDelete(contentId);
            await Post.findByIdAndUpdate(
              content.postId,
              { $inc: { commentsCount: -1 } }
            );
          }
        } else {
          content.moderationStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
          content.moderationReason = reason || '';
          content.isModerated = true;
          await content.save();
        }

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Error processing ${item.contentType} ${item.contentId}: ${error.message}`);
      }
    }

    res.json({
      message: `Bulk moderation completed`,
      results
    });
  } catch (error) {
    console.error('Error in bulk moderation:', error);
    res.status(500).json({ error: 'Failed to perform bulk moderation' });
  }
});

module.exports = router;