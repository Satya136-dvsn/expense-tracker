const Post = require('../models/Post');
const Comment = require('../models/Comment');
const CommunityUser = require('../models/User');

class ModerationService {
  // Spam detection keywords and patterns
  static SPAM_KEYWORDS = [
    'buy now', 'click here', 'free money', 'get rich quick', 'guaranteed profit',
    'make money fast', 'no risk', 'limited time', 'act now', 'special offer',
    'investment opportunity', 'double your money', 'risk-free', 'easy money'
  ];

  static INAPPROPRIATE_KEYWORDS = [
    // Add inappropriate words that should be flagged
    'scam', 'fraud', 'ponzi', 'pyramid scheme'
  ];

  static URL_PATTERN = /https?:\/\/[^\s]+/gi;
  static EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  static PHONE_PATTERN = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/gi;

  /**
   * Analyze content for potential spam or inappropriate material
   * @param {string} content - Content to analyze
   * @param {string} title - Title to analyze (optional)
   * @returns {Object} Analysis result
   */
  static analyzeContent(content, title = '') {
    const analysis = {
      isSpam: false,
      isInappropriate: false,
      hasLinks: false,
      hasContactInfo: false,
      spamScore: 0,
      flags: [],
      suggestions: []
    };

    const fullText = `${title} ${content}`.toLowerCase();

    // Check for spam keywords
    const spamMatches = this.SPAM_KEYWORDS.filter(keyword => 
      fullText.includes(keyword.toLowerCase())
    );
    
    if (spamMatches.length > 0) {
      analysis.spamScore += spamMatches.length * 10;
      analysis.flags.push(`Contains spam keywords: ${spamMatches.join(', ')}`);
    }

    // Check for inappropriate content
    const inappropriateMatches = this.INAPPROPRIATE_KEYWORDS.filter(keyword => 
      fullText.includes(keyword.toLowerCase())
    );
    
    if (inappropriateMatches.length > 0) {
      analysis.isInappropriate = true;
      analysis.flags.push(`Contains inappropriate keywords: ${inappropriateMatches.join(', ')}`);
    }

    // Check for excessive links
    const links = content.match(this.URL_PATTERN) || [];
    if (links.length > 2) {
      analysis.hasLinks = true;
      analysis.spamScore += links.length * 5;
      analysis.flags.push(`Contains ${links.length} links`);
    }

    // Check for contact information
    const emails = content.match(this.EMAIL_PATTERN) || [];
    const phones = content.match(this.PHONE_PATTERN) || [];
    
    if (emails.length > 0 || phones.length > 0) {
      analysis.hasContactInfo = true;
      analysis.spamScore += (emails.length + phones.length) * 15;
      analysis.flags.push('Contains contact information');
    }

    // Check for excessive capitalization
    const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
    if (capsRatio > 0.3 && content.length > 20) {
      analysis.spamScore += 10;
      analysis.flags.push('Excessive capitalization');
    }

    // Check for repetitive content
    const words = content.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    const repetitionRatio = 1 - (uniqueWords.size / words.length);
    
    if (repetitionRatio > 0.5 && words.length > 10) {
      analysis.spamScore += 15;
      analysis.flags.push('Repetitive content detected');
    }

    // Determine if content is spam
    analysis.isSpam = analysis.spamScore >= 25;

    // Generate suggestions
    if (analysis.hasLinks) {
      analysis.suggestions.push('Consider reducing the number of external links');
    }
    if (analysis.hasContactInfo) {
      analysis.suggestions.push('Avoid sharing personal contact information');
    }
    if (analysis.spamScore > 0) {
      analysis.suggestions.push('Review content for promotional language');
    }

    return analysis;
  }

  /**
   * Auto-moderate content based on analysis
   * @param {Object} content - Post or Comment document
   * @param {string} contentType - 'post' or 'comment'
   */
  static async autoModerate(content, contentType) {
    try {
      const analysis = this.analyzeContent(
        content.content, 
        contentType === 'post' ? content.title : ''
      );

      let moderationStatus = 'APPROVED';
      let moderationReason = '';

      if (analysis.isInappropriate) {
        moderationStatus = 'REJECTED';
        moderationReason = 'Contains inappropriate content';
      } else if (analysis.isSpam) {
        moderationStatus = 'FLAGGED';
        moderationReason = 'Flagged as potential spam';
      } else if (analysis.spamScore >= 15) {
        moderationStatus = 'PENDING';
        moderationReason = 'Requires manual review';
      }

      // Update content moderation status
      content.moderationStatus = moderationStatus;
      content.moderationReason = moderationReason;
      content.isModerated = true;

      await content.save();

      return {
        status: moderationStatus,
        reason: moderationReason,
        analysis
      };
    } catch (error) {
      console.error('Error in auto-moderation:', error);
      return {
        status: 'PENDING',
        reason: 'Auto-moderation failed',
        analysis: null
      };
    }
  }

  /**
   * Check user's posting behavior for potential spam patterns
   * @param {number} userId - User ID to check
   * @returns {Object} Behavior analysis
   */
  static async analyzeUserBehavior(userId) {
    try {
      const now = new Date();
      const oneHour = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDay = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Count recent posts and comments
      const recentPosts = await Post.countDocuments({
        userId,
        createdAt: { $gte: oneHour }
      });

      const recentComments = await Comment.countDocuments({
        userId,
        createdAt: { $gte: oneHour }
      });

      const dailyPosts = await Post.countDocuments({
        userId,
        createdAt: { $gte: oneDay }
      });

      const dailyComments = await Comment.countDocuments({
        userId,
        createdAt: { $gte: oneDay }
      });

      // Get user reputation
      const user = await CommunityUser.findOne({ userId });
      const reputation = user ? user.reputation : 0;

      const analysis = {
        isSpamming: false,
        rateLimit: false,
        trustLevel: 'normal',
        flags: []
      };

      // Check for rapid posting (rate limiting)
      if (recentPosts > 5 || recentComments > 10) {
        analysis.rateLimit = true;
        analysis.flags.push('Posting too frequently');
      }

      // Check for excessive daily activity
      if (dailyPosts > 20 || dailyComments > 50) {
        analysis.isSpamming = true;
        analysis.flags.push('Excessive daily activity');
      }

      // Determine trust level based on reputation
      if (reputation < 0) {
        analysis.trustLevel = 'low';
      } else if (reputation > 100) {
        analysis.trustLevel = 'high';
      } else if (reputation > 500) {
        analysis.trustLevel = 'trusted';
      }

      return analysis;
    } catch (error) {
      console.error('Error analyzing user behavior:', error);
      return {
        isSpamming: false,
        rateLimit: false,
        trustLevel: 'normal',
        flags: []
      };
    }
  }

  /**
   * Apply automatic penalties for rule violations
   * @param {number} userId - User ID
   * @param {string} violation - Type of violation
   */
  static async applyAutoPenalty(userId, violation) {
    try {
      const penalties = {
        'spam': { reputation: -10, description: 'Spam content detected' },
        'inappropriate': { reputation: -15, description: 'Inappropriate content' },
        'excessive_posting': { reputation: -5, description: 'Excessive posting' },
        'rule_violation': { reputation: -8, description: 'Community rule violation' }
      };

      const penalty = penalties[violation];
      if (!penalty) return;

      await CommunityUser.findOneAndUpdate(
        { userId },
        { 
          $inc: { reputation: penalty.reputation },
          $set: { lastActivity: new Date() }
        },
        { upsert: true }
      );

      console.log(`Applied penalty to user ${userId}: ${penalty.description} (${penalty.reputation} reputation)`);
    } catch (error) {
      console.error('Error applying auto penalty:', error);
    }
  }

  /**
   * Generate moderation report for administrators
   * @param {Date} startDate - Start date for report
   * @param {Date} endDate - End date for report
   */
  static async generateModerationReport(startDate, endDate) {
    try {
      const report = {
        period: { start: startDate, end: endDate },
        posts: {
          total: 0,
          approved: 0,
          rejected: 0,
          pending: 0,
          flagged: 0
        },
        comments: {
          total: 0,
          approved: 0,
          rejected: 0,
          pending: 0,
          flagged: 0
        },
        users: {
          newUsers: 0,
          bannedUsers: 0,
          lowReputationUsers: 0
        },
        topViolations: []
      };

      // Post statistics
      const postStats = await Post.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: '$moderationStatus', count: { $sum: 1 } } }
      ]);

      postStats.forEach(stat => {
        report.posts.total += stat.count;
        report.posts[stat._id.toLowerCase()] = stat.count;
      });

      // Comment statistics
      const commentStats = await Comment.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: '$moderationStatus', count: { $sum: 1 } } }
      ]);

      commentStats.forEach(stat => {
        report.comments.total += stat.count;
        report.comments[stat._id.toLowerCase()] = stat.count;
      });

      // User statistics
      report.users.newUsers = await CommunityUser.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      });

      report.users.lowReputationUsers = await CommunityUser.countDocuments({
        reputation: { $lt: 0 }
      });

      return report;
    } catch (error) {
      console.error('Error generating moderation report:', error);
      return null;
    }
  }

  /**
   * Clean up old flagged content that was resolved
   * @param {number} daysOld - Number of days old to consider for cleanup
   */
  static async cleanupOldFlags(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      // Remove old rejected posts
      const deletedPosts = await Post.deleteMany({
        moderationStatus: 'REJECTED',
        updatedAt: { $lt: cutoffDate }
      });

      // Remove old rejected comments
      const deletedComments = await Comment.deleteMany({
        moderationStatus: 'REJECTED',
        updatedAt: { $lt: cutoffDate }
      });

      console.log(`Cleanup completed: ${deletedPosts.deletedCount} posts and ${deletedComments.deletedCount} comments removed`);

      return {
        postsDeleted: deletedPosts.deletedCount,
        commentsDeleted: deletedComments.deletedCount
      };
    } catch (error) {
      console.error('Error during cleanup:', error);
      return { postsDeleted: 0, commentsDeleted: 0 };
    }
  }
}

module.exports = ModerationService;