const cron = require('node-cron');
const ModerationService = require('../services/moderationService');
const CommunityUser = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

class ModerationJobs {
  /**
   * Initialize all scheduled moderation jobs
   */
  static initializeJobs() {
    // Daily cleanup job - runs at 2 AM every day
    cron.schedule('0 2 * * *', async () => {
      console.log('Running daily moderation cleanup...');
      try {
        await this.dailyCleanup();
      } catch (error) {
        console.error('Error in daily cleanup job:', error);
      }
    });

    // Weekly moderation report - runs every Sunday at 9 AM
    cron.schedule('0 9 * * 0', async () => {
      console.log('Generating weekly moderation report...');
      try {
        await this.generateWeeklyReport();
      } catch (error) {
        console.error('Error generating weekly report:', error);
      }
    });

    // Hourly user behavior check - runs every hour
    cron.schedule('0 * * * *', async () => {
      console.log('Running hourly user behavior analysis...');
      try {
        await this.hourlyUserCheck();
      } catch (error) {
        console.error('Error in hourly user check:', error);
      }
    });

    console.log('Moderation jobs initialized');
  }

  /**
   * Daily cleanup tasks
   */
  static async dailyCleanup() {
    try {
      // Clean up old flagged content
      const cleanupResult = await ModerationService.cleanupOldFlags(30);
      console.log(`Daily cleanup: ${cleanupResult.postsDeleted} posts and ${cleanupResult.commentsDeleted} comments removed`);

      // Reset daily activity counters (if implemented)
      // This would reset any daily rate limiting counters

      // Update user statistics
      await this.updateUserStatistics();

      return cleanupResult;
    } catch (error) {
      console.error('Error in daily cleanup:', error);
      throw error;
    }
  }

  /**
   * Generate weekly moderation report
   */
  static async generateWeeklyReport() {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const report = await ModerationService.generateModerationReport(startDate, endDate);
      
      if (report) {
        console.log('Weekly Moderation Report:', JSON.stringify(report, null, 2));
        
        // In a real implementation, you would:
        // - Save the report to database
        // - Send email to administrators
        // - Create dashboard notifications
        
        return report;
      }
    } catch (error) {
      console.error('Error generating weekly report:', error);
      throw error;
    }
  }

  /**
   * Hourly user behavior analysis
   */
  static async hourlyUserCheck() {
    try {
      // Get users who have been active in the last hour
      const oneHour = new Date();
      oneHour.setHours(oneHour.getHours() - 1);

      const activeUserIds = await Post.distinct('userId', {
        createdAt: { $gte: oneHour }
      });

      const activeCommentUserIds = await Comment.distinct('userId', {
        createdAt: { $gte: oneHour }
      });

      const allActiveUsers = [...new Set([...activeUserIds, ...activeCommentUserIds])];

      let flaggedUsers = 0;
      
      for (const userId of allActiveUsers) {
        const behavior = await ModerationService.analyzeUserBehavior(userId);
        
        if (behavior.isSpamming) {
          await ModerationService.applyAutoPenalty(userId, 'excessive_posting');
          flaggedUsers++;
          
          // In a real implementation, you might:
          // - Temporarily restrict the user
          // - Send warning notification
          // - Alert moderators
        }
      }

      console.log(`Hourly check: Analyzed ${allActiveUsers.length} active users, flagged ${flaggedUsers} for excessive activity`);
      
      return { analyzed: allActiveUsers.length, flagged: flaggedUsers };
    } catch (error) {
      console.error('Error in hourly user check:', error);
      throw error;
    }
  }

  /**
   * Update user statistics and reputation
   */
  static async updateUserStatistics() {
    try {
      // Update post counts for all users
      const postCounts = await Post.aggregate([
        { $match: { moderationStatus: 'APPROVED' } },
        { $group: { _id: '$userId', count: { $sum: 1 } } }
      ]);

      // Update comment counts for all users
      const commentCounts = await Comment.aggregate([
        { $match: { moderationStatus: 'APPROVED' } },
        { $group: { _id: '$userId', count: { $sum: 1 } } }
      ]);

      // Update user statistics
      for (const postCount of postCounts) {
        await CommunityUser.findOneAndUpdate(
          { userId: postCount._id },
          { 'statistics.postsCount': postCount.count },
          { upsert: true }
        );
      }

      for (const commentCount of commentCounts) {
        await CommunityUser.findOneAndUpdate(
          { userId: commentCount._id },
          { 'statistics.commentsCount': commentCount.count },
          { upsert: true }
        );
      }

      console.log(`Updated statistics for ${postCounts.length} users with posts and ${commentCounts.length} users with comments`);
    } catch (error) {
      console.error('Error updating user statistics:', error);
      throw error;
    }
  }

  /**
   * Manual trigger for emergency moderation actions
   */
  static async emergencyModeration() {
    try {
      console.log('Running emergency moderation...');
      
      // Flag all posts with high spam scores for review
      const suspiciousPosts = await Post.find({
        moderationStatus: 'APPROVED',
        // Add criteria for suspicious content
      });

      let flaggedCount = 0;
      for (const post of suspiciousPosts) {
        const analysis = ModerationService.analyzeContent(post.content, post.title);
        if (analysis.spamScore >= 20) {
          post.moderationStatus = 'FLAGGED';
          post.moderationReason = 'Emergency review - high spam score';
          await post.save();
          flaggedCount++;
        }
      }

      console.log(`Emergency moderation: Flagged ${flaggedCount} posts for review`);
      return { flagged: flaggedCount };
    } catch (error) {
      console.error('Error in emergency moderation:', error);
      throw error;
    }
  }
}

module.exports = ModerationJobs;