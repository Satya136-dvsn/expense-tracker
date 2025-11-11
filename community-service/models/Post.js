const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000
  },
  category: {
    type: String,
    required: true,
    enum: ['BUDGETING', 'INVESTING', 'DEBT', 'SAVINGS', 'GENERAL', 'TIPS', 'QUESTIONS'],
    default: 'GENERAL'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  likes: [{
    userId: Number,
    createdAt: { type: Date, default: Date.now }
  }],
  dislikes: [{
    userId: Number,
    createdAt: { type: Date, default: Date.now }
  }],
  views: {
    type: Number,
    default: 0
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  isModerated: {
    type: Boolean,
    default: false
  },
  moderationStatus: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'FLAGGED'],
    default: 'PENDING'
  },
  moderationReason: String,
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  reputation: {
    type: Number,
    default: 0
  },
  reportCount: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
postSchema.index({ category: 1, createdAt: -1 });
postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ lastActivity: -1 });
postSchema.index({ 'likes.userId': 1 });
postSchema.index({ moderationStatus: 1 });

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for dislike count
postSchema.virtual('dislikeCount').get(function() {
  return this.dislikes ? this.dislikes.length : 0;
});

// Method to check if user liked the post
postSchema.methods.isLikedBy = function(userId) {
  return this.likes.some(like => like.userId === userId);
};

// Method to check if user disliked the post
postSchema.methods.isDislikedBy = function(userId) {
  return this.dislikes.some(dislike => dislike.userId === userId);
};

// Update last activity on save
postSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  next();
});

module.exports = mongoose.model('Post', postSchema);