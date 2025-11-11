const ModerationService = require('../services/moderationService');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const CommunityUser = require('../models/User');
const mongoose = require('mongoose');

describe('ModerationService', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/budgetwise_community_test';
    await mongoose.connect(mongoUri);
  });

  beforeEach(async () => {
    await Post.deleteMany({});
    await Comment.deleteMany({});
    await CommunityUser.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('analyzeContent', () => {
    it('should detect spam keywords', () => {
      const content = 'Buy now and get rich quick with this amazing investment opportunity!';
      const analysis = ModerationService.analyzeContent(content);

      expect(analysis.isSpam).toBe(true);
      expect(analysis.spamScore).toBeGreaterThan(20);
      expect(analysis.flags.length).toBeGreaterThan(0);
    });

    it('should detect inappropriate content', () => {
      const content = 'This is a scam and fraud scheme';
      const analysis = ModerationService.analyzeContent(content);

      expect(analysis.isInappropriate).toBe(true);
      expect(analysis.flags.some(flag => flag.includes('inappropriate'))).toBe(true);
    });

    it('should detect excessive links', () => {
      const content = 'Check out https://example1.com and https://example2.com and https://example3.com';
      const analysis = ModerationService.analyzeContent(content);

      expect(analysis.hasLinks).toBe(true);
      expect(analysis.spamScore).toBeGreaterThan(10);
    });

    it('should detect contact information', () => {
      const content = 'Contact me at john@example.com or call 555-123-4567';
      const analysis = ModerationService.analyzeContent(content);

      expect(analysis.hasContactInfo).toBe(true);
      expect(analysis.spamScore).toBeGreaterThan(15);
    });

    it('should detect excessive capitalization', () => {
      const content = 'THIS IS ALL CAPS AND LOOKS LIKE SPAM';
      const analysis = ModerationService.analyzeContent(content);

      expect(analysis.spamScore).toBeGreaterThan(5);
      expect(analysis.flags.some(flag => flag.includes('capitalization'))).toBe(true);
    });

    it('should detect repetitive content', () => {
      const content = 'money money money money money money money money';
      const analysis = ModerationService.analyzeContent(content);

      expect(analysis.spamScore).toBeGreaterThan(10);
      expect(analysis.flags.some(flag => flag.includes('Repetitive'))).toBe(true);
    });

    it('should approve clean content', () => {
      const content = 'This is a normal post about budgeting tips and saving money responsibly.';
      const analysis = ModerationService.analyzeContent(content);

      expect(analysis.isSpam).toBe(false);
      expect(analysis.isInappropriate).toBe(false);
      expect(analysis.spamScore).toBeLessThan(10);
    });
  });

  describe('autoModerate', () => {
    it('should approve clean posts', async () => {
      const post = new Post({
        userId: 1,
        title: 'Clean Post',
        content: 'This is a clean post about budgeting',
        category: 'BUDGETING'
      });
      await post.save();

      const result = await ModerationService.autoModerate(post, 'post');

      expect(result.status).toBe('APPROVED');
      expect(post.moderationStatus).toBe('APPROVED');
    });

    it('should reject inappropriate posts', async () => {
      const post = new Post({
        userId: 1,
        title: 'Bad Post',
        content: 'This is a scam and fraud post',
        category: 'GENERAL'
      });
      await post.save();

      const result = await ModerationService.autoModerate(post, 'post');

      expect(result.status).toBe('REJECTED');
      expect(post.moderationStatus).toBe('REJECTED');
    });

    it('should flag spam posts', async () => {
      const post = new Post({
        userId: 1,
        title: 'Spam Post',
        content: 'Buy now and get rich quick with this amazing opportunity! Click here!',
        category: 'GENERAL'
      });
      await post.save();

      const result = await ModerationService.autoModerate(post, 'post');

      expect(result.status).toBe('FLAGGED');
      expect(post.moderationStatus).toBe('FLAGGED');
    });

    it('should set posts to pending for manual review', async () => {
      const post = new Post({
        userId: 1,
        title: 'Questionable Post',
        content: 'This post has some questionable content that needs review. Contact me at email@example.com',
        category: 'GENERAL'
      });
      await post.save();

      const result = await ModerationService.autoModerate(post, 'post');

      expect(result.status).toBe('PENDING');
      expect(post.moderationStatus).toBe('PENDING');
    });
  });

  describe('analyzeUserBehavior', () => {
    it('should detect rate limiting for frequent posting', async () => {
      const userId = 1;
      const now = new Date();
      const recentTime = new Date(now.getTime() - 30 * 60 * 1000); // 30 minutes ago

      // Create 6 recent posts (above the limit of 5)
      const posts = [];
      for (let i = 0; i < 6; i++) {
        posts.push({
          userId,
          title: `Post ${i}`,
          content: `Content ${i}`,
          category: 'GENERAL',
          createdAt: recentTime
        });
      }
      await Post.insertMany(posts);

      const analysis = await ModerationService.analyzeUserBehavior(userId);

      expect(analysis.rateLimit).toBe(true);
      expect(analysis.flags.some(flag => flag.includes('frequently'))).toBe(true);
    });

    it('should detect spamming behavior', async () => {
      const userId = 1;
      const now = new Date();
      const dayAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000); // 12 hours ago

      // Create 25 posts in one day (above the limit of 20)
      const posts = [];
      for (let i = 0; i < 25; i++) {
        posts.push({
          userId,
          title: `Post ${i}`,
          content: `Content ${i}`,
          category: 'GENERAL',
          createdAt: dayAgo
        });
      }
      await Post.insertMany(posts);

      const analysis = await ModerationService.analyzeUserBehavior(userId);

      expect(analysis.isSpamming).toBe(true);
      expect(analysis.flags.some(flag => flag.includes('Excessive'))).toBe(true);
    });

    it('should determine trust level based on reputation', async () => {
      // Test low trust level
      await CommunityUser.create({ userId: 1, displayName: 'User1', reputation: -10 });
      let analysis = await ModerationService.analyzeUserBehavior(1);
      expect(analysis.trustLevel).toBe('low');

      // Test high trust level
      await CommunityUser.create({ userId: 2, displayName: 'User2', reputation: 150 });
      analysis = await ModerationService.analyzeUserBehavior(2);
      expect(analysis.trustLevel).toBe('high');

      // Test trusted level
      await CommunityUser.create({ userId: 3, displayName: 'User3', reputation: 600 });
      analysis = await ModerationService.analyzeUserBehavior(3);
      expect(analysis.trustLevel).toBe('trusted');
    });

    it('should return normal behavior for regular users', async () => {
      const userId = 1;
      
      // Create a few normal posts
      await Post.insertMany([
        {
          userId,
          title: 'Normal Post 1',
          content: 'Normal content 1',
          category: 'GENERAL',
          createdAt: new Date()
        },
        {
          userId,
          title: 'Normal Post 2',
          content: 'Normal content 2',
          category: 'BUDGETING',
          createdAt: new Date()
        }
      ]);

      await CommunityUser.create({ userId, displayName: 'NormalUser', reputation: 50 });

      const analysis = await ModerationService.analyzeUserBehavior(userId);

      expect(analysis.isSpamming).toBe(false);
      expect(analysis.rateLimit).toBe(false);
      expect(analysis.trustLevel).toBe('normal');
      expect(analysis.flags).toHaveLength(0);
    });
  });

  describe('applyAutoPenalty', () => {
    it('should apply spam penalty', async () => {
      const userId = 1;
      await CommunityUser.create({ userId, displayName: 'TestUser', reputation: 50 });

      await ModerationService.applyAutoPenalty(userId, 'spam');

      const user = await CommunityUser.findOne({ userId });
      expect(user.reputation).toBe(40); // 50 - 10
    });

    it('should apply inappropriate content penalty', async () => {
      const userId = 1;
      await CommunityUser.create({ userId, displayName: 'TestUser', reputation: 50 });

      await ModerationService.applyAutoPenalty(userId, 'inappropriate');

      const user = await CommunityUser.findOne({ userId });
      expect(user.reputation).toBe(35); // 50 - 15
    });

    it('should create user if not exists', async () => {
      const userId = 999;

      await ModerationService.applyAutoPenalty(userId, 'spam');

      const user = await CommunityUser.findOne({ userId });
      expect(user).toBeTruthy();
      expect(user.reputation).toBe(-10); // 0 - 10
    });
  });

  describe('generateModerationReport', () => {
    it('should generate comprehensive moderation report', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date();

      // Create test data
      await Post.insertMany([
        { userId: 1, title: 'Post 1', content: 'Content 1', category: 'GENERAL', moderationStatus: 'APPROVED', createdAt: new Date() },
        { userId: 2, title: 'Post 2', content: 'Content 2', category: 'GENERAL', moderationStatus: 'REJECTED', createdAt: new Date() },
        { userId: 3, title: 'Post 3', content: 'Content 3', category: 'GENERAL', moderationStatus: 'PENDING', createdAt: new Date() }
      ]);

      await Comment.insertMany([
        { postId: new mongoose.Types.ObjectId(), userId: 1, content: 'Comment 1', moderationStatus: 'APPROVED', createdAt: new Date() },
        { postId: new mongoose.Types.ObjectId(), userId: 2, content: 'Comment 2', moderationStatus: 'FLAGGED', createdAt: new Date() }
      ]);

      await CommunityUser.insertMany([
        { userId: 1, displayName: 'User1', reputation: 50, createdAt: new Date() },
        { userId: 2, displayName: 'User2', reputation: -5, createdAt: new Date() }
      ]);

      const report = await ModerationService.generateModerationReport(startDate, endDate);

      expect(report).toBeTruthy();
      expect(report.posts.total).toBe(3);
      expect(report.posts.approved).toBe(1);
      expect(report.posts.rejected).toBe(1);
      expect(report.posts.pending).toBe(1);
      expect(report.comments.total).toBe(2);
      expect(report.users.newUsers).toBe(2);
      expect(report.users.lowReputationUsers).toBe(1);
    });
  });

  describe('cleanupOldFlags', () => {
    it('should remove old rejected content', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 35); // 35 days ago

      // Create old rejected posts and comments
      await Post.create({
        userId: 1,
        title: 'Old Rejected Post',
        content: 'Old content',
        category: 'GENERAL',
        moderationStatus: 'REJECTED',
        updatedAt: oldDate
      });

      await Comment.create({
        postId: new mongoose.Types.ObjectId(),
        userId: 1,
        content: 'Old rejected comment',
        moderationStatus: 'REJECTED',
        updatedAt: oldDate
      });

      // Create recent rejected content (should not be deleted)
      await Post.create({
        userId: 1,
        title: 'Recent Rejected Post',
        content: 'Recent content',
        category: 'GENERAL',
        moderationStatus: 'REJECTED',
        updatedAt: new Date()
      });

      const result = await ModerationService.cleanupOldFlags(30);

      expect(result.postsDeleted).toBe(1);
      expect(result.commentsDeleted).toBe(1);

      // Verify recent content still exists
      const remainingPosts = await Post.countDocuments({ moderationStatus: 'REJECTED' });
      expect(remainingPosts).toBe(1);
    });
  });
});