const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Post = require('../models/Post');
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

describe('Posts API', () => {
  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/budgetwise_community_test';
    await mongoose.connect(mongoUri);
  });

  beforeEach(async () => {
    // Clear test data
    await Post.deleteMany({});
    await CommunityUser.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/posts', () => {
    it('should return empty array when no posts exist', async () => {
      const response = await request(app)
        .get('/api/posts')
        .expect(200);

      expect(response.body.posts).toEqual([]);
      expect(response.body.pagination.totalPosts).toBe(0);
    });

    it('should return posts with pagination', async () => {
      // Create test posts
      const posts = [];
      for (let i = 0; i < 5; i++) {
        posts.push({
          userId: 1,
          title: `Test Post ${i + 1}`,
          content: `This is test post content ${i + 1}`,
          category: 'GENERAL',
          moderationStatus: 'APPROVED'
        });
      }
      await Post.insertMany(posts);

      const response = await request(app)
        .get('/api/posts?limit=3')
        .expect(200);

      expect(response.body.posts).toHaveLength(3);
      expect(response.body.pagination.totalPosts).toBe(5);
      expect(response.body.pagination.hasNext).toBe(true);
    });

    it('should filter posts by category', async () => {
      await Post.insertMany([
        {
          userId: 1,
          title: 'Budgeting Post',
          content: 'Content about budgeting',
          category: 'BUDGETING',
          moderationStatus: 'APPROVED'
        },
        {
          userId: 1,
          title: 'Investing Post',
          content: 'Content about investing',
          category: 'INVESTING',
          moderationStatus: 'APPROVED'
        }
      ]);

      const response = await request(app)
        .get('/api/posts?category=BUDGETING')
        .expect(200);

      expect(response.body.posts).toHaveLength(1);
      expect(response.body.posts[0].category).toBe('BUDGETING');
    });

    it('should search posts by title and content', async () => {
      await Post.insertMany([
        {
          userId: 1,
          title: 'How to save money',
          content: 'Tips for saving money effectively',
          category: 'SAVINGS',
          moderationStatus: 'APPROVED'
        },
        {
          userId: 1,
          title: 'Investment strategies',
          content: 'Different ways to invest your money',
          category: 'INVESTING',
          moderationStatus: 'APPROVED'
        }
      ]);

      const response = await request(app)
        .get('/api/posts?search=money')
        .expect(200);

      expect(response.body.posts).toHaveLength(2);
    });
  });

  describe('POST /api/posts', () => {
    it('should create a new post', async () => {
      const postData = {
        title: 'Test Post',
        content: 'This is a test post content',
        category: 'GENERAL',
        tags: ['test', 'example']
      };

      const response = await request(app)
        .post('/api/posts')
        .send(postData)
        .expect(201);

      expect(response.body.title).toBe(postData.title);
      expect(response.body.content).toBe(postData.content);
      expect(response.body.category).toBe(postData.category);
      expect(response.body.tags).toEqual(postData.tags);
      expect(response.body.userId).toBe(1);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/posts')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should validate title length', async () => {
      const response = await request(app)
        .post('/api/posts')
        .send({
          title: 'Hi',
          content: 'This is a test post content',
          category: 'GENERAL'
        })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should validate category', async () => {
      const response = await request(app)
        .post('/api/posts')
        .send({
          title: 'Test Post',
          content: 'This is a test post content',
          category: 'INVALID_CATEGORY'
        })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('GET /api/posts/:id', () => {
    it('should return a specific post', async () => {
      const post = await Post.create({
        userId: 1,
        title: 'Test Post',
        content: 'This is a test post content',
        category: 'GENERAL',
        moderationStatus: 'APPROVED'
      });

      const response = await request(app)
        .get(`/api/posts/${post._id}`)
        .expect(200);

      expect(response.body.title).toBe(post.title);
      expect(response.body.views).toBe(1); // Should increment view count
    });

    it('should return 404 for non-existent post', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/api/posts/${fakeId}`)
        .expect(404);
    });
  });

  describe('PUT /api/posts/:id', () => {
    it('should update own post', async () => {
      const post = await Post.create({
        userId: 1,
        title: 'Original Title',
        content: 'Original content',
        category: 'GENERAL',
        moderationStatus: 'APPROVED'
      });

      const updateData = {
        title: 'Updated Title',
        content: 'Updated content',
        category: 'BUDGETING'
      };

      const response = await request(app)
        .put(`/api/posts/${post._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe(updateData.title);
      expect(response.body.content).toBe(updateData.content);
      expect(response.body.category).toBe(updateData.category);
    });

    it('should not allow updating other users posts', async () => {
      const post = await Post.create({
        userId: 999, // Different user
        title: 'Other User Post',
        content: 'Content by other user',
        category: 'GENERAL',
        moderationStatus: 'APPROVED'
      });

      await request(app)
        .put(`/api/posts/${post._id}`)
        .send({
          title: 'Hacked Title',
          content: 'Hacked content',
          category: 'GENERAL'
        })
        .expect(403);
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('should delete own post', async () => {
      const post = await Post.create({
        userId: 1,
        title: 'Post to Delete',
        content: 'This post will be deleted',
        category: 'GENERAL',
        moderationStatus: 'APPROVED'
      });

      await request(app)
        .delete(`/api/posts/${post._id}`)
        .expect(200);

      const deletedPost = await Post.findById(post._id);
      expect(deletedPost).toBeNull();
    });

    it('should not allow deleting other users posts', async () => {
      const post = await Post.create({
        userId: 999, // Different user
        title: 'Other User Post',
        content: 'Content by other user',
        category: 'GENERAL',
        moderationStatus: 'APPROVED'
      });

      await request(app)
        .delete(`/api/posts/${post._id}`)
        .expect(403);
    });
  });

  describe('POST /api/posts/:id/like', () => {
    it('should like a post', async () => {
      const post = await Post.create({
        userId: 2, // Different user so we can like it
        title: 'Post to Like',
        content: 'This post will be liked',
        category: 'GENERAL',
        moderationStatus: 'APPROVED'
      });

      const response = await request(app)
        .post(`/api/posts/${post._id}/like`)
        .expect(200);

      expect(response.body.liked).toBe(true);
      expect(response.body.likeCount).toBe(1);
    });

    it('should unlike a previously liked post', async () => {
      const post = await Post.create({
        userId: 2,
        title: 'Post to Unlike',
        content: 'This post will be unliked',
        category: 'GENERAL',
        likes: [{ userId: 1 }], // Already liked by user 1
        moderationStatus: 'APPROVED'
      });

      const response = await request(app)
        .post(`/api/posts/${post._id}/like`)
        .expect(200);

      expect(response.body.liked).toBe(false);
      expect(response.body.likeCount).toBe(0);
    });
  });
});