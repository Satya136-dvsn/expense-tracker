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
  }
}));

describe('Comments API', () => {
  let testPost;

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/budgetwise_community_test';
    await mongoose.connect(mongoUri);
  });

  beforeEach(async () => {
    await Post.deleteMany({});
    await Comment.deleteMany({});
    await CommunityUser.deleteMany({});

    // Create a test post for comments
    testPost = await Post.create({
      userId: 1,
      title: 'Test Post for Comments',
      content: 'This post is for testing comments',
      category: 'GENERAL',
      moderationStatus: 'APPROVED'
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/comments', () => {
    it('should create a new comment', async () => {
      const commentData = {
        postId: testPost._id.toString(),
        content: 'This is a test comment'
      };

      const response = await request(app)
        .post('/api/comments')
        .send(commentData)
        .expect(201);

      expect(response.body.content).toBe(commentData.content);
      expect(response.body.postId.toString()).toBe(testPost._id.toString());
      expect(response.body.userId).toBe(1);
      expect(response.body.depth).toBe(0);
    });

    it('should create a reply to a comment', async () => {
      // Create parent comment first
      const parentComment = await Comment.create({
        postId: testPost._id,
        userId: 2,
        content: 'Parent comment',
        depth: 0,
        moderationStatus: 'APPROVED'
      });

      const replyData = {
        postId: testPost._id.toString(),
        content: 'This is a reply',
        parentCommentId: parentComment._id.toString()
      };

      const response = await request(app)
        .post('/api/comments')
        .send(replyData)
        .expect(201);

      expect(response.body.content).toBe(replyData.content);
      expect(response.body.parentCommentId.toString()).toBe(parentComment._id.toString());
      expect(response.body.depth).toBe(1);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/comments')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should validate post exists', async () => {
      const fakePostId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .post('/api/comments')
        .send({
          postId: fakePostId.toString(),
          content: 'Comment on non-existent post'
        })
        .expect(404);

      expect(response.body.error).toBe('Post not found');
    });

    it('should prevent comments on locked posts', async () => {
      // Lock the test post
      testPost.isLocked = true;
      await testPost.save();

      const response = await request(app)
        .post('/api/comments')
        .send({
          postId: testPost._id.toString(),
          content: 'Comment on locked post'
        })
        .expect(403);

      expect(response.body.error).toBe('Post is locked for comments');
    });

    it('should limit comment nesting depth', async () => {
      // Create a deeply nested comment chain
      let parentComment = await Comment.create({
        postId: testPost._id,
        userId: 2,
        content: 'Level 0 comment',
        depth: 5, // Already at max depth
        moderationStatus: 'APPROVED'
      });

      const response = await request(app)
        .post('/api/comments')
        .send({
          postId: testPost._id.toString(),
          content: 'Too deep reply',
          parentCommentId: parentComment._id.toString()
        })
        .expect(400);

      expect(response.body.error).toBe('Maximum comment nesting depth reached');
    });
  });

  describe('GET /api/comments/:id', () => {
    it('should return a comment with replies', async () => {
      const comment = await Comment.create({
        postId: testPost._id,
        userId: 1,
        content: 'Parent comment',
        depth: 0,
        moderationStatus: 'APPROVED'
      });

      const reply = await Comment.create({
        postId: testPost._id,
        userId: 2,
        content: 'Reply comment',
        parentCommentId: comment._id,
        depth: 1,
        moderationStatus: 'APPROVED'
      });

      // Add reply to parent's replies array
      comment.replies.push(reply._id);
      await comment.save();

      const response = await request(app)
        .get(`/api/comments/${comment._id}`)
        .expect(200);

      expect(response.body.content).toBe(comment.content);
      expect(response.body.replies).toHaveLength(1);
    });

    it('should return 404 for non-existent comment', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/api/comments/${fakeId}`)
        .expect(404);
    });
  });

  describe('PUT /api/comments/:id', () => {
    it('should update own comment', async () => {
      const comment = await Comment.create({
        postId: testPost._id,
        userId: 1,
        content: 'Original comment',
        depth: 0,
        moderationStatus: 'APPROVED'
      });

      const updateData = {
        content: 'Updated comment content'
      };

      const response = await request(app)
        .put(`/api/comments/${comment._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.content).toBe(updateData.content);
    });

    it('should not allow updating other users comments', async () => {
      const comment = await Comment.create({
        postId: testPost._id,
        userId: 999, // Different user
        content: 'Other user comment',
        depth: 0,
        moderationStatus: 'APPROVED'
      });

      await request(app)
        .put(`/api/comments/${comment._id}`)
        .send({
          content: 'Hacked comment'
        })
        .expect(403);
    });

    it('should not allow editing old comments', async () => {
      const oldDate = new Date();
      oldDate.setHours(oldDate.getHours() - 25); // 25 hours ago

      const comment = await Comment.create({
        postId: testPost._id,
        userId: 1,
        content: 'Old comment',
        depth: 0,
        createdAt: oldDate,
        moderationStatus: 'APPROVED'
      });

      await request(app)
        .put(`/api/comments/${comment._id}`)
        .send({
          content: 'Updated old comment'
        })
        .expect(403);
    });
  });

  describe('DELETE /api/comments/:id', () => {
    it('should delete own comment', async () => {
      const comment = await Comment.create({
        postId: testPost._id,
        userId: 1,
        content: 'Comment to delete',
        depth: 0,
        moderationStatus: 'APPROVED'
      });

      await request(app)
        .delete(`/api/comments/${comment._id}`)
        .expect(200);

      const deletedComment = await Comment.findById(comment._id);
      expect(deletedComment).toBeNull();
    });

    it('should delete comment with replies', async () => {
      const parentComment = await Comment.create({
        postId: testPost._id,
        userId: 1,
        content: 'Parent comment',
        depth: 0,
        moderationStatus: 'APPROVED'
      });

      const reply = await Comment.create({
        postId: testPost._id,
        userId: 1,
        content: 'Reply comment',
        parentCommentId: parentComment._id,
        depth: 1,
        moderationStatus: 'APPROVED'
      });

      await request(app)
        .delete(`/api/comments/${parentComment._id}`)
        .expect(200);

      const deletedParent = await Comment.findById(parentComment._id);
      const deletedReply = await Comment.findById(reply._id);
      
      expect(deletedParent).toBeNull();
      expect(deletedReply).toBeNull();
    });

    it('should not allow deleting other users comments', async () => {
      const comment = await Comment.create({
        postId: testPost._id,
        userId: 999, // Different user
        content: 'Other user comment',
        depth: 0,
        moderationStatus: 'APPROVED'
      });

      await request(app)
        .delete(`/api/comments/${comment._id}`)
        .expect(403);
    });
  });

  describe('POST /api/comments/:id/like', () => {
    it('should like a comment', async () => {
      const comment = await Comment.create({
        postId: testPost._id,
        userId: 2, // Different user so we can like it
        content: 'Comment to like',
        depth: 0,
        moderationStatus: 'APPROVED'
      });

      const response = await request(app)
        .post(`/api/comments/${comment._id}/like`)
        .expect(200);

      expect(response.body.liked).toBe(true);
      expect(response.body.likeCount).toBe(1);
    });

    it('should unlike a previously liked comment', async () => {
      const comment = await Comment.create({
        postId: testPost._id,
        userId: 2,
        content: 'Comment to unlike',
        depth: 0,
        likes: [{ userId: 1 }], // Already liked by user 1
        moderationStatus: 'APPROVED'
      });

      const response = await request(app)
        .post(`/api/comments/${comment._id}/like`)
        .expect(200);

      expect(response.body.liked).toBe(false);
      expect(response.body.likeCount).toBe(0);
    });
  });

  describe('GET /api/posts/:id/comments', () => {
    it('should return comments for a post', async () => {
      // Create multiple comments
      await Comment.insertMany([
        {
          postId: testPost._id,
          userId: 1,
          content: 'First comment',
          depth: 0,
          moderationStatus: 'APPROVED'
        },
        {
          postId: testPost._id,
          userId: 2,
          content: 'Second comment',
          depth: 0,
          moderationStatus: 'APPROVED'
        }
      ]);

      const response = await request(app)
        .get(`/api/posts/${testPost._id}/comments`)
        .expect(200);

      expect(response.body.comments).toHaveLength(2);
      expect(response.body.pagination.totalComments).toBe(2);
    });

    it('should only return top-level comments', async () => {
      const parentComment = await Comment.create({
        postId: testPost._id,
        userId: 1,
        content: 'Parent comment',
        depth: 0,
        moderationStatus: 'APPROVED'
      });

      await Comment.create({
        postId: testPost._id,
        userId: 2,
        content: 'Reply comment',
        parentCommentId: parentComment._id,
        depth: 1,
        moderationStatus: 'APPROVED'
      });

      const response = await request(app)
        .get(`/api/posts/${testPost._id}/comments`)
        .expect(200);

      // Should only return the parent comment, not the reply
      expect(response.body.comments).toHaveLength(1);
      expect(response.body.comments[0].content).toBe('Parent comment');
    });
  });
});