const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const CommunityUser = require('../models/User');

// Mock authentication middleware
jest.mock('../middleware/auth', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: 1, username: 'testuser', email: 'test@example.com' };
    next();
  },
  requireModerator: (req, res, next) => {
    req.user = { id: 1, role: 'MODERATOR' };
    next();
  }
}));

describe('Community Integration Tests', () => {
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

  describe('Complete User Journey', () => {
    it('should handle complete user interaction flow', async () => {
      // 1. Create user profile
      const profileResponse = await request(app)
        .put('/api/users/profile')
        .send({
          displayName: 'Integration Test User',
          bio: 'Testing the complete flow'
        })
        .expect(200);

      expect(profileResponse.body.displayName).toBe('Integration Test User');

      // 2. Create a post
      const postResponse = await request(app)
        .post('/api/posts')
        .send({
          title: 'Integration Test Post',
          content: 'This is a test post for integration testing',
          category: 'GENERAL',
          tags: ['test', 'integration']
        })
        .expect(201);

      const postId = postResponse.body._id;

      // 3. Get the post
      const getPostResponse = await request(app)
        .get(`/api/posts/${postId}`)
        .expect(200);

      expect(getPostResponse.body.title).toBe('Integration Test Post');
      expect(getPostResponse.body.views).toBe(1);

      // 4. Like the post (create another user first)
      await CommunityUser.create({
        userId: 2,
        displayName: 'Other User',
        reputation: 50
      });

      // Mock different user for liking
      const originalAuth = require('../middleware/auth').authenticateToken;
      require('../middleware/auth').authenticateToken = (req, res, next) => {
        req.user = { id: 2, username: 'otheruser' };
        next();
      };

      const likeResponse = await request(app)
        .post(`/api/posts/${postId}/like`)
        .expect(200);

      expect(likeResponse.body.liked).toBe(true);
      expect(likeResponse.body.likeCount).toBe(1);

      // Restore original auth
      require('../middleware/auth').authenticateToken = originalAuth;

      // 5. Add a comment
      const commentResponse = await request(app)
        .post('/api/comments')
        .send({
          postId: postId,
          content: 'This is a test comment'
        })
        .expect(201);

      const commentId = commentResponse.body._id;

      // 6. Reply to the comment
      const replyResponse = await request(app)
        .post('/api/comments')
        .send({
          postId: postId,
          content: 'This is a reply to the comment',
          parentCommentId: commentId
        })
        .expect(201);

      expect(replyResponse.body.parentCommentId).toBe(commentId);
      expect(replyResponse.body.depth).toBe(1);

      // 7. Get post comments
      const commentsResponse = await request(app)
        .get(`/api/posts/${postId}/comments`)
        .expect(200);

      expect(commentsResponse.body.comments).toHaveLength(1); // Only top-level comment
      expect(commentsResponse.body.pagination.totalComments).toBe(1);

      // 8. Get all posts
      const allPostsResponse = await request(app)
        .get('/api/posts')
        .expect(200);

      expect(allPostsResponse.body.posts).toHaveLength(1);
      expect(allPostsResponse.body.posts[0].commentsCount).toBe(2); // Original comment + reply

      // 9. Update user profile
      const updatedProfileResponse = await request(app)
        .put('/api/users/profile')
        .send({
          displayName: 'Updated Integration User',
          bio: 'Updated bio after testing'
        })
        .expect(200);

      expect(updatedProfileResponse.body.displayName).toBe('Updated Integration User');

      // 10. Get user profile
      const finalProfileResponse = await request(app)
        .get('/api/users/profile')
        .expect(200);

      expect(finalProfileResponse.body.displayName).toBe('Updated Integration User');
      expect(finalProfileResponse.body.statistics.postsCount).toBe(1);
      expect(finalProfileResponse.body.statistics.commentsCount).toBe(2);
    });

    it('should handle moderation workflow', async () => {
      // Create a post with spam content
      const spamPostResponse = await request(app)
        .post('/api/posts')
        .send({
          title: 'Buy now and get rich quick!',
          content: 'This is an amazing investment opportunity! Click here to buy now and make money fast!',
          category: 'GENERAL'
        })
        .expect(201);

      // Post should be flagged by auto-moderation
      const post = await Post.findById(spamPostResponse.body._id);
      expect(post.moderationStatus).toBe('FLAGGED');

      // Get moderation stats
      const statsResponse = await request(app)
        .get('/api/moderation/stats')
        .expect(200);

      expect(statsResponse.body.posts.flagged).toBeGreaterThan(0);

      // Moderate the post
      const moderateResponse = await request(app)
        .post('/api/moderation/moderate')
        .send({
          contentType: 'post',
          contentId: spamPostResponse.body._id,
          action: 'reject',
          reason: 'Spam content detected'
        })
        .expect(200);

      expect(moderateResponse.body.action).toBe('reject');

      // Verify post is rejected
      const rejectedPost = await Post.findById(spamPostResponse.body._id);
      expect(rejectedPost.moderationStatus).toBe('REJECTED');
    });

    it('should handle user reputation and badges', async () => {
      const ReputationService = require('../services/reputationService');

      // Create user
      await CommunityUser.create({
        userId: 1,
        displayName: 'Test User',
        reputation: 0
      });

      // Add reputation for various actions
      await ReputationService.addReputation(1, 'POST_CREATED');
      await ReputationService.addReputation(1, 'POST_LIKED');
      await ReputationService.addReputation(1, 'COMMENT_CREATED');

      // Check user reputation
      const user = await CommunityUser.findOne({ userId: 1 });
      expect(user.reputation).toBeGreaterThan(0);

      // Update statistics to trigger badge check
      await ReputationService.updateStatistics(1, { postsCount: 1 });

      // Check if badges were awarded
      const updatedUser = await CommunityUser.findOne({ userId: 1 });
      expect(updatedUser.badges.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // This test would require mocking mongoose connection
      // For now, we'll test API error responses
      
      const response = await request(app)
        .get('/api/posts/invalid-id')
        .expect(500);

      expect(response.body.error).toBeTruthy();
    });

    it('should handle validation errors properly', async () => {
      const response = await request(app)
        .post('/api/posts')
        .send({
          title: '', // Invalid: too short
          content: 'Valid content',
          category: 'GENERAL'
        })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeTruthy();
    });

    it('should handle rate limiting', async () => {
      // Create multiple posts quickly to trigger rate limiting
      const promises = [];
      for (let i = 0; i < 6; i++) {
        promises.push(
          request(app)
            .post('/api/posts')
            .send({
              title: `Rapid Post ${i}`,
              content: `Content ${i}`,
              category: 'GENERAL'
            })
        );
      }

      const responses = await Promise.all(promises);
      
      // At least one should be rate limited
      const rateLimitedResponse = responses.find(r => r.status === 429);
      expect(rateLimitedResponse).toBeTruthy();
    });
  });

  describe('Performance Tests', () => {
    it('should handle large number of posts efficiently', async () => {
      const startTime = Date.now();

      // Create 50 posts
      const posts = [];
      for (let i = 0; i < 50; i++) {
        posts.push({
          userId: 1,
          title: `Performance Test Post ${i}`,
          content: `Content for post ${i}`,
          category: 'GENERAL',
          moderationStatus: 'APPROVED'
        });
      }
      await Post.insertMany(posts);

      // Fetch posts with pagination
      const response = await request(app)
        .get('/api/posts?limit=20')
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.body.posts).toHaveLength(20);
      expect(response.body.pagination.totalPosts).toBe(50);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle concurrent requests', async () => {
      const promises = [];
      
      // Make 10 concurrent requests
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .get('/api/posts')
            .expect(200)
        );
      }

      const responses = await Promise.all(promises);
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.posts).toBeDefined();
      });
    });
  });
});