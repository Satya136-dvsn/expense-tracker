const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    unique: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  category: {
    type: String,
    required: true,
    enum: ['BUDGETING', 'INVESTING', 'DEBT_MANAGEMENT', 'SAVINGS', 'RETIREMENT', 'SIDE_HUSTLES', 'GENERAL']
  },
  icon: {
    type: String,
    default: ''
  },
  coverImage: {
    type: String,
    default: ''
  },
  createdBy: {
    type: Number,
    required: true
  },
  moderators: [{
    userId: Number,
    assignedAt: { type: Date, default: Date.now }
  }],
  members: [{
    userId: Number,
    joinedAt: { type: Date, default: Date.now },
    role: { type: String, enum: ['MEMBER', 'MODERATOR', 'ADMIN'], default: 'MEMBER' }
  }],
  rules: [{
    title: String,
    description: String,
    order: Number
  }],
  tags: [{
    type: String,
    trim: true,
    maxlength: 30
  }],
  isPrivate: {
    type: Boolean,
    default: false
  },
  requiresApproval: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  statistics: {
    memberCount: { type: Number, default: 0 },
    postCount: { type: Number, default: 0 },
    weeklyActivity: { type: Number, default: 0 }
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
groupSchema.index({ category: 1, 'statistics.memberCount': -1 });
groupSchema.index({ tags: 1 });
groupSchema.index({ isActive: 1, isPrivate: 1 });
groupSchema.index({ 'members.userId': 1 });

// Virtual for member count
groupSchema.virtual('memberCount').get(function() {
  return this.members ? this.members.length : 0;
});

// Method to check if user is member
groupSchema.methods.isMember = function(userId) {
  return this.members.some(member => member.userId === userId);
};

// Method to check if user is moderator
groupSchema.methods.isModerator = function(userId) {
  return this.moderators.some(mod => mod.userId === userId) || 
         this.members.some(member => member.userId === userId && member.role === 'MODERATOR');
};

// Method to add member
groupSchema.methods.addMember = function(userId, role = 'MEMBER') {
  if (!this.isMember(userId)) {
    this.members.push({ userId, role });
    this.statistics.memberCount = this.members.length;
    this.lastActivity = new Date();
  }
  return this.save();
};

// Method to remove member
groupSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(member => member.userId !== userId);
  this.statistics.memberCount = this.members.length;
  return this.save();
};

module.exports = mongoose.model('Group', groupSchema);