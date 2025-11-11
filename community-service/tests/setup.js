// Test setup file
const mongoose = require('mongoose');

// Increase timeout for database operations
jest.setTimeout(30000);

// Mock console.log to reduce noise during tests
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Global test helpers
global.createTestUser = async (userData = {}) => {
  const CommunityUser = require('../models/User');
  return await CommunityUser.create({
    userId: 1,
    displayName: 'Test User',
    reputation: 0,
    ...userData
  });
};

global.createTestPost = async (postData = {}) => {
  const Post = require('../models/Post');
  return await Post.create({
    userId: 1,
    title: 'Test Post',
    content: 'Test content',
    category: 'GENERAL',
    moderationStatus: 'APPROVED',
    ...postData
  });
};

global.createTestComment = async (commentData = {}) => {
  const Comment = require('../models/Comment');
  const mongoose = require('mongoose');
  
  return await Comment.create({
    postId: new mongoose.Types.ObjectId(),
    userId: 1,
    content: 'Test comment',
    depth: 0,
    moderationStatus: 'APPROVED',
    ...commentData
  });
};

// Clean up after all tests
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});