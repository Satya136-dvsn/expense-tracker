const CommunityUser = require('../models/User');

class NotificationService {
  /**
   * Send notification to user
   * @param {number} userId - Target user ID
   * @param {string} type - Notification type
   * @param {Object} data - Notification data
   */
  static async sendNotification(userId, type, data) {
    try {
      // In a real implementation, this would integrate with:
      // - Email service (SendGrid, AWS SES, etc.)
      // - Push notification service (Firebase, OneSignal, etc.)
      // - In-app notification system
      
      const user = await CommunityUser.findOne({ userId });
      if (!user) {
        console.log(`User ${userId} not found for notification`);
        return;
      }

      // Check user preferences
      if (!this.shouldSendNotification(user, type)) {
        return;
      }

      const notification = this.formatNotification(type, data);
      
      // Log notification (in real implementation, save to database)
      console.log(`Notification for user ${userId}:`, notification);

      // Here you would send actual notifications:
      // - await this.sendEmail(user.email, notification);
      // - await this.sendPushNotification(user.deviceTokens, notification);
      // - await this.saveInAppNotification(userId, notification);

      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  /**
   * Check if user should receive notification based on preferences
   * @param {Object} user - User document
   * @param {string} type - Notification type
   */
  static shouldSendNotification(user, type) {
    const preferences = user.preferences || {};
    
    switch (type) {
      case 'POST_LIKED':
      case 'COMMENT_LIKED':
      case 'NEW_FOLLOWER':
        return preferences.pushNotifications !== false;
      
      case 'WEEKLY_DIGEST':
        return preferences.weeklyDigest !== false;
      
      case 'POST_COMMENT':
      case 'COMMENT_REPLY':
        return preferences.emailNotifications !== false;
      
      default:
        return true;
    }
  }

  /**
   * Format notification message based on type
   * @param {string} type - Notification type
   * @param {Object} data - Notification data
   */
  static formatNotification(type, data) {
    const notifications = {
      POST_LIKED: {
        title: 'Your post was liked!',
        message: `${data.likerName} liked your post "${data.postTitle}"`,
        action: `View post`,
        actionUrl: `/community/posts/${data.postId}`
      },
      
      COMMENT_LIKED: {
        title: 'Your comment was liked!',
        message: `${data.likerName} liked your comment`,
        action: 'View comment',
        actionUrl: `/community/posts/${data.postId}#comment-${data.commentId}`
      },
      
      POST_COMMENT: {
        title: 'New comment on your post',
        message: `${data.commenterName} commented on "${data.postTitle}"`,
        action: 'View comment',
        actionUrl: `/community/posts/${data.postId}#comment-${data.commentId}`
      },
      
      COMMENT_REPLY: {
        title: 'Someone replied to your comment',
        message: `${data.replierName} replied to your comment`,
        action: 'View reply',
        actionUrl: `/community/posts/${data.postId}#comment-${data.commentId}`
      },
      
      NEW_FOLLOWER: {
        title: 'New follower!',
        message: `${data.followerName} started following you`,
        action: 'View profile',
        actionUrl: `/community/users/${data.followerId}`
      },
      
      BADGE_EARNED: {
        title: 'Badge earned!',
        message: `Congratulations! You earned the "${data.badgeName}" badge`,
        action: 'View profile',
        actionUrl: '/community/profile'
      },
      
      WEEKLY_DIGEST: {
        title: 'Your weekly community digest',
        message: `Here's what happened in the community this week`,
        action: 'View digest',
        actionUrl: '/community/digest'
      },
      
      MODERATION_ACTION: {
        title: 'Content moderation update',
        message: data.message,
        action: data.action || 'View details',
        actionUrl: data.actionUrl || '/community'
      }
    };

    return notifications[type] || {
      title: 'Community notification',
      message: data.message || 'You have a new notification',
      action: 'View',
      actionUrl: '/community'
    };
  }

  /**
   * Send notification when post is liked
   * @param {number} postAuthorId - Post author's user ID
   * @param {number} likerId - User who liked the post
   * @param {string} postId - Post ID
   * @param {string} postTitle - Post title
   */
  static async notifyPostLiked(postAuthorId, likerId, postId, postTitle) {
    if (postAuthorId === likerId) return; // Don't notify self-likes

    try {
      const liker = await CommunityUser.findOne({ userId: likerId });
      await this.sendNotification(postAuthorId, 'POST_LIKED', {
        likerName: liker ? liker.displayName : 'Someone',
        postId,
        postTitle
      });
    } catch (error) {
      console.error('Error sending post liked notification:', error);
    }
  }

  /**
   * Send notification when comment is liked
   * @param {number} commentAuthorId - Comment author's user ID
   * @param {number} likerId - User who liked the comment
   * @param {string} postId - Post ID
   * @param {string} commentId - Comment ID
   */
  static async notifyCommentLiked(commentAuthorId, likerId, postId, commentId) {
    if (commentAuthorId === likerId) return; // Don't notify self-likes

    try {
      const liker = await CommunityUser.findOne({ userId: likerId });
      await this.sendNotification(commentAuthorId, 'COMMENT_LIKED', {
        likerName: liker ? liker.displayName : 'Someone',
        postId,
        commentId
      });
    } catch (error) {
      console.error('Error sending comment liked notification:', error);
    }
  }

  /**
   * Send notification when someone comments on a post
   * @param {number} postAuthorId - Post author's user ID
   * @param {number} commenterId - User who commented
   * @param {string} postId - Post ID
   * @param {string} commentId - Comment ID
   * @param {string} postTitle - Post title
   */
  static async notifyNewComment(postAuthorId, commenterId, postId, commentId, postTitle) {
    if (postAuthorId === commenterId) return; // Don't notify self-comments

    try {
      const commenter = await CommunityUser.findOne({ userId: commenterId });
      await this.sendNotification(postAuthorId, 'POST_COMMENT', {
        commenterName: commenter ? commenter.displayName : 'Someone',
        postId,
        commentId,
        postTitle
      });
    } catch (error) {
      console.error('Error sending new comment notification:', error);
    }
  }

  /**
   * Send notification when someone replies to a comment
   * @param {number} commentAuthorId - Original comment author's user ID
   * @param {number} replierId - User who replied
   * @param {string} postId - Post ID
   * @param {string} commentId - Reply comment ID
   */
  static async notifyCommentReply(commentAuthorId, replierId, postId, commentId) {
    if (commentAuthorId === replierId) return; // Don't notify self-replies

    try {
      const replier = await CommunityUser.findOne({ userId: replierId });
      await this.sendNotification(commentAuthorId, 'COMMENT_REPLY', {
        replierName: replier ? replier.displayName : 'Someone',
        postId,
        commentId
      });
    } catch (error) {
      console.error('Error sending comment reply notification:', error);
    }
  }

  /**
   * Send notification when someone follows a user
   * @param {number} followedUserId - User being followed
   * @param {number} followerId - User who followed
   */
  static async notifyNewFollower(followedUserId, followerId) {
    try {
      const follower = await CommunityUser.findOne({ userId: followerId });
      await this.sendNotification(followedUserId, 'NEW_FOLLOWER', {
        followerName: follower ? follower.displayName : 'Someone',
        followerId
      });
    } catch (error) {
      console.error('Error sending new follower notification:', error);
    }
  }

  /**
   * Send notification when user earns a badge
   * @param {number} userId - User who earned the badge
   * @param {string} badgeName - Name of the badge earned
   */
  static async notifyBadgeEarned(userId, badgeName) {
    try {
      await this.sendNotification(userId, 'BADGE_EARNED', {
        badgeName
      });
    } catch (error) {
      console.error('Error sending badge earned notification:', error);
    }
  }

  /**
   * Send bulk notifications (for weekly digest, announcements, etc.)
   * @param {Array} userIds - Array of user IDs
   * @param {string} type - Notification type
   * @param {Object} data - Notification data
   */
  static async sendBulkNotifications(userIds, type, data) {
    try {
      const promises = userIds.map(userId => 
        this.sendNotification(userId, type, data)
      );
      
      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
    }
  }
}

module.exports = NotificationService;