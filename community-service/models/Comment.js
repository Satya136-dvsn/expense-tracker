const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
    index: true
  },
  userId: {
    type: Number,
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  parentCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  likes: [{
    userId: Number,
    createdAt: { type: Date, default: Date.now }
  }],
  dislikes: [{
    userId: Number,
    createdAt: { type: Date, default: Date.now }
  }],
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
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
  reportCount: {
    type: Number,
    default: 0
  },
  depth: {
    type: Number,
    default: 0,
    max: 5 // Limit nesting depth
  }
}, {
  timestamps: true
});

// Indexes for better performance
commentSchema.index({ postId: 1, createdAt: -1 });
commentSchema.index({ userId: 1, createdAt: -1 });
commentSchema.index({ parentCommentId: 1 });
commentSchema.index({ 'likes.userId': 1 });
commentSchema.index({ moderationStatus: 1 });

// Virtual for like count
commentSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for dislike count
commentSchema.virtual('dislikeCount').get(function() {
  return this.dislikes ? this.dislikes.length : 0;
});

// Method to check if user liked the comment
commentSchema.methods.isLikedBy = function(userId) {
  return this.likes.some(like => like.userId === userId);
};

// Method to check if user disliked the comment
commentSchema.methods.isDislikedBy = function(userId) {
  return this.dislikes.some(dislike => dislike.userId === userId);
};

module.exports = mongoose.model('Comment', commentSchema);