const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const CommunityUser = require('../models/User');
const Post = require('../models/Post');

// Mock authentication middleware
jest.mock('../middleware/auth', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: 1, username: 'testuser', email: 'test@example.com' };
    next();
  }
}));

describe('Users API', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/budgetwise_community_test';
    await mongoose.connect(mongoUri);
  });

  beforeEach(async () => {
    await CommunityUser.deleteMany({});
    await Post.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/users/profile', () => {
    it('should return current user profile', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .expect(200);

      expect(response.body.userId).toBe(1);
      expect(response.body.displayName).toBeTruthy();
    });

    it('should create profile if not exists', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .expect(200);

      expect(response.body.userId).toBe(1);
      expect(response.body.reputation).toBe(0);
      
      // Verify user was created in database
      const user = await CommunityUser.findOne({ userId: 1 });
      expect(user).toBeTruthy();
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile', async () => {
      const updateData = {
        displayName: 'Updated Name',
        bio: 'This is my updated bio'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .send(updateData)
        .expect(200);

      expect(response.body.displayName).toBe(updateData.displayName);
      expect(response.body.bio).toBe(updateData.bio);
    });

    it('should validate display name length', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .send({
          displayName: 'A', // Too short
          bio: 'Valid bio'
        })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should validate bio length', async () => {
      const longBio = 'A'.repeat(501); // Too long
      
      const response = await request(app)
        .put('/api/users/profile')
        .send({
          displayName: 'Valid Name',
          bio: longBio
        })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should create new profile if not exists', async () => {
      const profileData = {
        displayName: 'New User',
        bio: 'New user bio'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .send(profileData)
        .expect(200);

      expect(response.body.displayName).toBe(profileData.displayName);
      expect(response.body.bio).toBe(profileData.bio);
      expect(response.body.userId).toBe(1);
    });
  });

  describe('GET /api/users/:userId', () => {
    it('should return user profile by ID', async () => {
      const user = await CommunityUser.create({
        userId: 2,
        displayName: 'Test User',
        bio: 'Test bio',
        reputation: 100
      });

      const response = await request(app)
        .get('/api/users/2')
        .expect(200);

      expect(response.body.userId).toBe(2);
      expect(response.body.displayName).toBe('Test User');
      expect(response.body.bio).toBe('Test bio');
      expect(response.body.reputation).toBe(100);
    });

    it('should return 404 for non-existent user', async () => {
      await request(app)
        .get('/api/users/999')
        .expect(404);
    });

    it('should include recent posts and comments', async () => {
      const user = await CommunityUser.create({
        userId: 2,
        displayName: 'Test User',
        reputation: 50
      });

      // Create some posts for the user
      await Post.create({
        userId: 2,
        title: 'User Post',
        content: 'Post content',
        category: 'GENERAL',
        moderationStatus: 'APPROVED'
      });

      const response = await request(app)
        .get('/api/users/2')
        .expect(200);

      expect(response.body.recentPosts).toBeDefined();
      expect(response.body.recentComments).toBeDefined();
    });
  });

  describe('POST /api/users/:userId/follow', () => {
    it('should follow a user', async () => {
      // Create target user
      await CommunityUser.create({
        userId: 2,
        displayName: 'Target User',
        reputation: 50
      });

      const response = await request(app)
        .post('/api/users/2/follow')
        .expect(200);

      expect(response.body.following).toBe(true);
      expect(response.body.followerCount).toBe(1);
    });

    it('should unfollow a previously followed user', async () => {
      // Create users
      await CommunityUser.create({
        userId: 1,
        displayName: 'Current User',
        following: [{ userId: 2 }]
      });

      await CommunityUser.create({
        userId: 2,
        displayName: 'Target User',
        followers: [{ userId: 1 }]
      });

      const response = await request(app)
        .post('/api/users/2/follow')
        .expect(200);

      expect(response.body.following).toBe(false);
      expect(response.body.followerCount).toBe(0);
    });

    it('should not allow following yourself', async () => {
      const response = await request(app)
        .post('/api/users/1/follow')
        .expect(400);

      expect(response.body.error).toBe('Cannot follow yourself');
    });

    it('should return 404 for non-existent user', async () => {
      await request(app)
        .post('/api/users/999/follow')
        .expect(404);
    });
  });

  describe('GET /api/users/:userId/followers', () => {
    it('should return user followers', async () => {
      await CommunityUser.create({
        userId: 2,
        displayName: 'Target User',
        followers: [{ userId: 1 }, { userId: 3 }]
      });

      await CommunityUser.create({
        userId: 1,
        displayName: 'Follower 1',
        reputation: 50
      });

      await CommunityUser.create({
        userId: 3,
        displayName: 'Follower 2',
        reputation: 75
      });

      const response = await request(app)
        .get('/api/users/2/followers')
        .expect(200);

      expect(response.body.followers).toHaveLength(2);
      expect(response.body.pagination.totalFollowers).toBe(2);
    });

    it('should return 404 for non-existent user', async () => {
      await request(app)
        .get('/api/users/999/followers')
        .expect(404);
    });
  });

  describe('GET /api/users/:userId/following', () => {
    it('should return users being followed', async () => {
      await CommunityUser.create({
        userId: 2,
        displayName: 'User',
        following: [{ userId: 1 }, { userId: 3 }]
      });

      await CommunityUser.create({
        userId: 1,
        displayName: 'Following 1',
        reputation: 50
      });

      await CommunityUser.create({
        userId: 3,
        displayName: 'Following 2',
        reputation: 75
      });

      const response = await request(app)
        .get('/api/users/2/following')
        .expect(200);

      expect(response.body.following).toHaveLength(2);
      expect(response.body.pagination.totalFollowing).toBe(2);
    });
  });

  describe('POST /api/users/bookmarks/:postId', () => {
    it('should bookmark a post', async () => {
      const post = await Post.create({
        userId: 2,
        title: 'Post to Bookmark',
        content: 'Content',
        category: 'GENERAL',
        moderationStatus: 'APPROVED'
      });

      const response = await request(app)
        .post(`/api/users/bookmarks/${post._id}`)
        .expect(200);

      expect(response.body.bookmarked).toBe(true);
      expect(response.body.bookmarkCount).toBe(1);
    });

    it('should unbookmark a previously bookmarked post', async () => {
      const post = await Post.create({
        userId: 2,
        title: 'Bookmarked Post',
        content: 'Content',
        category: 'GENERAL',
        moderationStatus: 'APPROVED'
      });

      // Create user with existing bookmark
      await CommunityUser.create({
        userId: 1,
        displayName: 'User',
        bookmarks: [{ postId: post._id }]
      });

      const response = await request(app)
        .post(`/api/users/bookmarks/${post._id}`)
        .expect(200);

      expect(response.body.bookmarked).toBe(false);
      expect(response.body.bookmarkCount).toBe(0);
    });

    it('should return 404 for non-existent post', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .post(`/api/users/bookmarks/${fakeId}`)
        .expect(404);
    });
  });

  describe('GET /api/users/bookmarks', () => {
    it('should return user bookmarks', async () => {
      const post = await Post.create({
        userId: 2,
        title: 'Bookmarked Post',
        content: 'Content',
        category: 'GENERAL',
        moderationStatus: 'APPROVED'
      });

      await CommunityUser.create({
        userId: 1,
        displayName: 'User',
        bookmarks: [{ postId: post._id }]
      });

      const response = await request(app)
        .get('/api/users/bookmarks')
        .expect(200);

      expect(response.body.bookmarks).toHaveLength(1);
      expect(response.body.bookmarks[0].title).toBe('Bookmarked Post');
    });

    it('should return empty array for user with no bookmarks', async () => {
      const response = await request(app)
        .get('/api/users/bookmarks')
        .expect(200);

      expect(response.body.bookmarks).toEqual([]);
      expect(response.body.pagination.totalBookmarks).toBe(0);
    });
  });

  describe('GET /api/users/leaderboard', () => {
    it('should return users sorted by reputation', async () => {
      await CommunityUser.insertMany([
        { userId: 1, displayName: 'User 1', reputation: 100, isActive: true },
        { userId: 2, displayName: 'User 2', reputation: 200, isActive: true },
        { userId: 3, displayName: 'User 3', reputation: 50, isActive: true },
        { userId: 4, displayName: 'Inactive User', reputation: 300, isActive: false }
      ]);

      const response = await request(app)
        .get('/api/users/leaderboard')
        .expect(200);

      expect(response.body.leaderboard).toHaveLength(3); // Only active users
      expect(response.body.leaderboard[0].reputation).toBe(200); // Highest first
      expect(response.body.leaderboard[1].reputation).toBe(100);
      expect(response.body.leaderboard[2].reputation).toBe(50);
    });

    it('should support pagination', async () => {
      // Create 25 users
      const users = [];
      for (let i = 1; i <= 25; i++) {
        users.push({
          userId: i,
          displayName: `User ${i}`,
          reputation: i * 10,
          isActive: true
        });
      }
      await CommunityUser.insertMany(users);

      const response = await request(app)
        .get('/api/users/leaderboard?page=2&limit=10')
        .expect(200);

      expect(response.body.leaderboard).toHaveLength(10);
      expect(response.body.pagination.currentPage).toBe(2);
      expect(response.body.pagination.totalUsers).toBe(25);
    });
  });
});