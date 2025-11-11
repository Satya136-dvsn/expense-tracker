const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const CommunityUser = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { validateComment, validateObjectId } = require('../middleware/validation');
const ReputationService = require('../services/reputationService');
const NotificationService = require('../services/notificationService');
const ModerationService = require('../services/moderationService');

// Create new comment
router.post('/', authenticateToken, validateComment, async (req, res) => {
  try {
    const { postId, content, parentCommentId } = req.body;
    
    // Verify post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if post is locked
    if (post.isLocked) {
      return res.status(403).json({ error: 'Post is locked for comments' });
    }

    let depth = 0;
    
    // If replying to a comment, verify parent exists and calculate depth
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ error: 'Parent comment not found' });
      }
      
      // Verify parent comment belongs to the same post
      if (parentComment.postId.toString() !== postId) {
        return res.status(400).json({ error: 'Parent comment does not belong to this post' });
      }
      
      depth = parentComment.depth + 1;
      
      // Limit nesting depth
      if (depth > 5) {
        return res.status(400).json({ error: 'Maximum comment nesting depth reached' });
      }
    }

    // Check user behavior before creating comment
    const userBehavior = await ModerationService.analyzeUserBehavior(req.user.id);
    
    if (userBehavior.rateLimit) {
      return res.status(429).json({ error: 'You are commenting too frequently. Please wait before commenting again.' });
    }

    const comment = new Comment({
      postId,
      userId: req.user.id,
      content,
      parentCommentId: parentCommentId || null,
      depth,
      moderationStatus: 'PENDING' // Will be updated by auto-moderation
    });

    await comment.save();

    // Auto-moderate the comment
    const moderationResult = await ModerationService.autoModerate(comment, 'comment');
    
    // Apply penalties if needed
    if (moderationResult.status === 'REJECTED') {
      await ModerationService.applyAutoPenalty(req.user.id, 'inappropriate');
    } else if (moderationResult.status === 'FLAGGED') {
      await ModerationService.applyAutoPenalty(req.user.id, 'spam');
    }

    // Update parent comment's replies array if this is a reply
    if (parentCommentId) {
      await Comment.findByIdAndUpdate(
        parentCommentId,
        { $push: { replies: comment._id } }
      );
    }

    // Update post's comment count
    await Post.findByIdAndUpdate(
      postId,
      { 
        $inc: { commentsCount: 1 },
        $set: { lastActivity: new Date() }
      }
    );

    // Update user statistics and reputation
    await ReputationService.updateStatistics(req.user.id, { commentsCount: 1 });
    await ReputationService.addReputation(req.user.id, 'COMMENT_CREATED');

    // Send notifications
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      await NotificationService.notifyCommentReply(parentComment.userId, req.user.id, postId, comment._id);
    } else {
      await NotificationService.notifyNewComment(post.userId, req.user.id, postId, comment._id, post.title);
    }

    // Get author information for response
    const author = await CommunityUser.findOne({ userId: req.user.id }).lean();
    
    const commentWithAuthor = {
      ...comment.toObject(),
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

    res.status(201).json(commentWithAuthor);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Get comment by ID with replies
router.get('/:id', validateObjectId('id'), async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate({
        path: 'replies',
        options: { sort: { createdAt: 1 } }
      })
      .lean();
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Get author information
    const author = await CommunityUser.findOne({ userId: comment.userId }).lean();
    
    // Get reply authors information
    const repliesWithAuthors = await Promise.all(
      (comment.replies || []).map(async (reply) => {
        const replyAuthor = await CommunityUser.findOne({ userId: reply.userId }).lean();
        return {
          ...reply,
          author: replyAuthor ? {
            displayName: replyAuthor.displayName,
            reputation: replyAuthor.reputation,
            avatar: replyAuthor.avatar
          } : {
            displayName: 'Unknown User',
            reputation: 0,
            avatar: ''
          }
        };
      })
    );

    const commentWithAuthor = {
      ...comment,
      author: author ? {
        displayName: author.displayName,
        reputation: author.reputation,
        avatar: author.avatar
      } : {
        displayName: 'Unknown User',
        reputation: 0,
        avatar: ''
      },
      replies: repliesWithAuthors
    };

    res.json(commentWithAuthor);
  } catch (error) {
    console.error('Error fetching comment:', error);
    res.status(500).json({ error: 'Failed to fetch comment' });
  }
});

// Update comment
router.put('/:id', authenticateToken, validateObjectId('id'), validateComment, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to edit this comment' });
    }

    // Check if comment is too old to edit (24 hours)
    const hoursSinceCreation = (new Date() - comment.createdAt) / (1000 * 60 * 60);
    if (hoursSinceCreation > 24) {
      return res.status(403).json({ error: 'Comment is too old to edit' });
    }

    comment.content = req.body.content;
    comment.moderationStatus = 'PENDING'; // Re-moderate after edit

    await comment.save();

    res.json(comment);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

// Delete comment
router.delete('/:id', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    // Delete all replies recursively
    const deleteReplies = async (commentId) => {
      const replies = await Comment.find({ parentCommentId: commentId });
      for (const reply of replies) {
        await deleteReplies(reply._id);
        await Comment.findByIdAndDelete(reply._id);
      }
    };

    await deleteReplies(comment._id);

    // Remove from parent's replies array if this is a reply
    if (comment.parentCommentId) {
      await Comment.findByIdAndUpdate(
        comment.parentCommentId,
        { $pull: { replies: comment._id } }
      );
    }

    // Update post's comment count
    const deletedCount = await Comment.countDocuments({ 
      $or: [
        { _id: comment._id },
        { parentCommentId: comment._id }
      ]
    });

    await Post.findByIdAndUpdate(
      comment.postId,
      { $inc: { commentsCount: -deletedCount } }
    );

    // Delete the comment
    await Comment.findByIdAndDelete(req.params.id);

    // Update user statistics
    await CommunityUser.findOneAndUpdate(
      { userId: req.user.id },
      { $inc: { 'statistics.commentsCount': -1 } }
    );

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// Like/Unlike comment
router.post('/:id/like', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const userId = req.user.id;
    const isLiked = comment.isLikedBy(userId);
    const isDisliked = comment.isDislikedBy(userId);

    if (isLiked) {
      // Remove like
      comment.likes = comment.likes.filter(like => like.userId !== userId);
    } else {
      // Add like and remove dislike if exists
      if (isDisliked) {
        comment.dislikes = comment.dislikes.filter(dislike => dislike.userId !== userId);
      }
      comment.likes.push({ userId });
    }

    await comment.save();

    // Update reputation and send notifications
    if (!isLiked) {
      // User liked the comment
      await ReputationService.addReputation(comment.userId, 'COMMENT_LIKED');
      await ReputationService.updateStatistics(req.user.id, { likesGiven: 1 });
      await ReputationService.updateStatistics(comment.userId, { likesReceived: 1 });
      
      // Send notification to comment author
      await NotificationService.notifyCommentLiked(comment.userId, req.user.id, comment.postId, comment._id);
    }

    res.json({
      liked: !isLiked,
      likeCount: comment.likeCount,
      dislikeCount: comment.dislikeCount
    });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({ error: 'Failed to like comment' });
  }
});

// Dislike/Remove dislike comment
router.post('/:id/dislike', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const userId = req.user.id;
    const isLiked = comment.isLikedBy(userId);
    const isDisliked = comment.isDislikedBy(userId);

    if (isDisliked) {
      // Remove dislike
      comment.dislikes = comment.dislikes.filter(dislike => dislike.userId !== userId);
    } else {
      // Add dislike and remove like if exists
      if (isLiked) {
        comment.likes = comment.likes.filter(like => like.userId !== userId);
      }
      comment.dislikes.push({ userId });
    }

    await comment.save();

    res.json({
      disliked: !isDisliked,
      likeCount: comment.likeCount,
      dislikeCount: comment.dislikeCount
    });
  } catch (error) {
    console.error('Error disliking comment:', error);
    res.status(500).json({ error: 'Failed to dislike comment' });
  }
});

module.exports = router;