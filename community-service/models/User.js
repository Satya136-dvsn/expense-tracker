const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  reputation: {
    type: Number,
    default: 0,
    min: 0
  },
  badges: [{
    name: String,
    description: String,
    icon: String,
    earnedAt: { type: Date, default: Date.now }
  }],
  joinedGroups: [{
    groupId: mongoose.Schema.Types.ObjectId,
    joinedAt: { type: Date, default: Date.now }
  }],
  following: [{
    userId: Number,
    followedAt: { type: Date, default: Date.now }
  }],
  followers: [{
    userId: Number,
    followedAt: { type: Date, default: Date.now }
  }],
  bookmarks: [{
    postId: mongoose.Schema.Types.ObjectId,
    bookmarkedAt: { type: Date, default: Date.now }
  }],
  statistics: {
    postsCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    helpfulAnswers: { type: Number, default: 0 },
    likesReceived: { type: Number, default: 0 },
    likesGiven: { type: Number, default: 0 }
  },
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    weeklyDigest: { type: Boolean, default: true }
  },
  moderationLevel: {
    type: String,
    enum: ['USER', 'MODERATOR', 'ADMIN'],
    default: 'USER'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
userSchema.index({ reputation: -1 });
userSchema.index({ 'following.userId': 1 });
userSchema.index({ 'followers.userId': 1 });
userSchema.index({ lastActivity: -1 });

// Virtual for follower count
userSchema.virtual('followerCount').get(function() {
  return this.followers ? this.followers.length : 0;
});

// Virtual for following count
userSchema.virtual('followingCount').get(function() {
  return this.following ? this.following.length : 0;
});

// Method to check if user is following another user
userSchema.methods.isFollowing = function(targetUserId) {
  return this.following.some(follow => follow.userId === targetUserId);
};

// Method to add reputation points
userSchema.methods.addReputation = function(points, reason) {
  this.reputation = Math.max(0, this.reputation + points);
  return this.save();
};

// Method to award badge
userSchema.methods.awardBadge = function(badgeName, description, icon) {
  const existingBadge = this.badges.find(badge => badge.name === badgeName);
  if (!existingBadge) {
    this.badges.push({
      name: badgeName,
      description: description,
      icon: icon
    });
    return this.save();
  }
  return Promise.resolve(this);
};

// Update last activity on save
userSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  next();
});

module.exports = mongoose.model('CommunityUser', userSchema);