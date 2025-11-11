const CommunityUser = require('../models/User');

class ReputationService {
  // Reputation point values for different actions
  static POINTS = {
    POST_CREATED: 5,
    POST_LIKED: 2,
    POST_DISLIKED: -1,
    COMMENT_CREATED: 2,
    COMMENT_LIKED: 1,
    COMMENT_DISLIKED: -1,
    HELPFUL_ANSWER: 10,
    POST_DELETED_BY_MODERATOR: -10,
    COMMENT_DELETED_BY_MODERATOR: -5,
    BADGE_EARNED: 25,
    FOLLOWED: 1,
    POST_FEATURED: 15
  };

  // Badge definitions
  static BADGES = {
    NEWCOMER: {
      name: 'Newcomer',
      description: 'Welcome to the community!',
      icon: '👋',
      condition: (user) => user.statistics.postsCount >= 1
    },
    CONTRIBUTOR: {
      name: 'Contributor',
      description: 'Posted 10 helpful posts',
      icon: '📝',
      condition: (user) => user.statistics.postsCount >= 10
    },
    HELPFUL: {
      name: 'Helpful',
      description: 'Received 50 likes on posts and comments',
      icon: '👍',
      condition: (user) => user.statistics.likesReceived >= 50
    },
    POPULAR: {
      name: 'Popular',
      description: 'Has 25 followers',
      icon: '⭐',
      condition: (user) => user.followerCount >= 25
    },
    EXPERT: {
      name: 'Expert',
      description: 'Reached 500 reputation points',
      icon: '🏆',
      condition: (user) => user.reputation >= 500
    },
    MENTOR: {
      name: 'Mentor',
      description: 'Helped others with 100 helpful answers',
      icon: '🎓',
      condition: (user) => user.statistics.helpfulAnswers >= 100
    },
    COMMUNITY_LEADER: {
      name: 'Community Leader',
      description: 'Reached 1000 reputation points',
      icon: '👑',
      condition: (user) => user.reputation >= 1000
    }
  };

  /**
   * Add reputation points to a user
   * @param {number} userId - User ID
   * @param {string} action - Action that triggered reputation change
   * @param {number} customPoints - Custom points (optional)
   */
  static async addReputation(userId, action, customPoints = null) {
    try {
      const points = customPoints || this.POINTS[action] || 0;
      
      const user = await CommunityUser.findOneAndUpdate(
        { userId },
        { 
          $inc: { reputation: points },
          $set: { lastActivity: new Date() }
        },
        { new: true, upsert: true }
      );

      // Check for new badges after reputation change
      await this.checkAndAwardBadges(user);

      return user;
    } catch (error) {
      console.error('Error adding reputation:', error);
      throw error;
    }
  }

  /**
   * Check if user qualifies for new badges and award them
   * @param {Object} user - User document
   */
  static async checkAndAwardBadges(user) {
    try {
      const existingBadgeNames = user.badges.map(badge => badge.name);
      const newBadges = [];

      for (const [badgeKey, badgeInfo] of Object.entries(this.BADGES)) {
        if (!existingBadgeNames.includes(badgeInfo.name) && badgeInfo.condition(user)) {
          newBadges.push({
            name: badgeInfo.name,
            description: badgeInfo.description,
            icon: badgeInfo.icon,
            earnedAt: new Date()
          });
        }
      }

      if (newBadges.length > 0) {
        await CommunityUser.findOneAndUpdate(
          { userId: user.userId },
          { 
            $push: { badges: { $each: newBadges } },
            $inc: { reputation: newBadges.length * this.POINTS.BADGE_EARNED }
          }
        );

        return newBadges;
      }

      return [];
    } catch (error) {
      console.error('Error checking badges:', error);
      return [];
    }
  }

  /**
   * Update user statistics
   * @param {number} userId - User ID
   * @param {Object} stats - Statistics to update
   */
  static async updateStatistics(userId, stats) {
    try {
      const updateQuery = {};
      
      Object.keys(stats).forEach(key => {
        updateQuery[`statistics.${key}`] = stats[key];
      });

      const user = await CommunityUser.findOneAndUpdate(
        { userId },
        { 
          $inc: updateQuery,
          $set: { lastActivity: new Date() }
        },
        { new: true, upsert: true }
      );

      // Check for new badges after statistics update
      await this.checkAndAwardBadges(user);

      return user;
    } catch (error) {
      console.error('Error updating statistics:', error);
      throw error;
    }
  }

  /**
   * Get user's reputation history (would require a separate collection in real implementation)
   * @param {number} userId - User ID
   */
  static async getReputationHistory(userId) {
    // In a real implementation, you would have a separate collection
    // to track reputation changes with timestamps and reasons
    // For now, return basic info
    try {
      const user = await CommunityUser.findOne({ userId });
      return {
        currentReputation: user ? user.reputation : 0,
        badges: user ? user.badges : [],
        statistics: user ? user.statistics : {}
      };
    } catch (error) {
      console.error('Error getting reputation history:', error);
      throw error;
    }
  }

  /**
   * Calculate user's community level based on reputation
   * @param {number} reputation - User's reputation points
   */
  static getUserLevel(reputation) {
    if (reputation < 50) return { level: 1, name: 'Newcomer', nextLevel: 50 };
    if (reputation < 100) return { level: 2, name: 'Member', nextLevel: 100 };
    if (reputation < 250) return { level: 3, name: 'Regular', nextLevel: 250 };
    if (reputation < 500) return { level: 4, name: 'Contributor', nextLevel: 500 };
    if (reputation < 1000) return { level: 5, name: 'Expert', nextLevel: 1000 };
    if (reputation < 2500) return { level: 6, name: 'Mentor', nextLevel: 2500 };
    return { level: 7, name: 'Community Leader', nextLevel: null };
  }
}

module.exports = ReputationService;