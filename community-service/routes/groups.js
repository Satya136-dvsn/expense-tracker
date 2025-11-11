const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const CommunityUser = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { validateGroup, validatePagination, validateObjectId } = require('../middleware/validation');

// Get all groups with filtering and pagination
router.get('/', validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const filter = { isActive: true };
    
    // Category filter
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    // Search filter
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Privacy filter - only show public groups unless user is authenticated
    if (!req.headers.authorization) {
      filter.isPrivate = false;
    }

    // Sort options
    let sort = { 'statistics.memberCount': -1 }; // Default: most members
    if (req.query.sort === 'newest') {
      sort = { createdAt: -1 };
    } else if (req.query.sort === 'active') {
      sort = { lastActivity: -1 };
    }

    const groups = await Group.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-members -moderators') // Don't include member lists in overview
      .lean();

    const total = await Group.countDocuments(filter);

    res.json({
      groups,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalGroups: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// Get single group by ID
router.get('/:id', validateObjectId('id'), async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).lean();
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // If group is private, check if user is a member
    if (group.isPrivate && req.headers.authorization) {
      try {
        // This would need proper authentication middleware
        // For now, we'll show basic info for private groups
      } catch (error) {
        return res.status(403).json({ error: 'Access denied to private group' });
      }
    }

    // Get creator information
    const creator = await CommunityUser.findOne({ userId: group.createdBy }).lean();
    
    const groupWithCreator = {
      ...group,
      creator: creator ? {
        displayName: creator.displayName,
        reputation: creator.reputation,
        avatar: creator.avatar
      } : {
        displayName: 'Unknown User',
        reputation: 0,
        avatar: ''
      }
    };

    res.json(groupWithCreator);
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ error: 'Failed to fetch group' });
  }
});

// Create new group
router.post('/', authenticateToken, validateGroup, async (req, res) => {
  try {
    const { name, description, category, tags, isPrivate, requiresApproval, rules } = req.body;
    
    // Check if group name already exists
    const existingGroup = await Group.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingGroup) {
      return res.status(400).json({ error: 'Group name already exists' });
    }

    const group = new Group({
      name,
      description,
      category,
      tags: tags || [],
      isPrivate: isPrivate || false,
      requiresApproval: requiresApproval || false,
      rules: rules || [],
      createdBy: req.user.id,
      moderators: [{ userId: req.user.id }],
      members: [{ userId: req.user.id, role: 'ADMIN' }],
      statistics: {
        memberCount: 1,
        postCount: 0,
        weeklyActivity: 0
      }
    });

    await group.save();

    // Update user's joined groups
    await CommunityUser.findOneAndUpdate(
      { userId: req.user.id },
      { 
        $push: { joinedGroups: { groupId: group._id } },
        $set: { lastActivity: new Date() }
      },
      { upsert: true }
    );

    res.status(201).json(group);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// Update group
router.put('/:id', authenticateToken, validateObjectId('id'), validateGroup, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is group creator or moderator
    if (group.createdBy !== req.user.id && !group.isModerator(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized to edit this group' });
    }

    const { name, description, category, tags, isPrivate, requiresApproval, rules } = req.body;
    
    // Check if new name conflicts with existing groups (excluding current group)
    if (name !== group.name) {
      const existingGroup = await Group.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: group._id }
      });
      if (existingGroup) {
        return res.status(400).json({ error: 'Group name already exists' });
      }
    }

    group.name = name;
    group.description = description;
    group.category = category;
    group.tags = tags || [];
    group.isPrivate = isPrivate !== undefined ? isPrivate : group.isPrivate;
    group.requiresApproval = requiresApproval !== undefined ? requiresApproval : group.requiresApproval;
    group.rules = rules || [];

    await group.save();

    res.json(group);
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ error: 'Failed to update group' });
  }
});

// Delete group
router.delete('/:id', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Only group creator can delete the group
    if (group.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Only group creator can delete the group' });
    }

    // Remove group from all members' joined groups
    await CommunityUser.updateMany(
      { 'joinedGroups.groupId': group._id },
      { $pull: { joinedGroups: { groupId: group._id } } }
    );

    // Delete the group
    await Group.findByIdAndDelete(req.params.id);

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

// Join group
router.post('/:id/join', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (!group.isActive) {
      return res.status(403).json({ error: 'Group is not active' });
    }

    // Check if user is already a member
    if (group.isMember(req.user.id)) {
      return res.status(400).json({ error: 'Already a member of this group' });
    }

    // For private groups, check if user has permission
    if (group.isPrivate) {
      return res.status(403).json({ error: 'Cannot join private group without invitation' });
    }

    // Add user to group
    await group.addMember(req.user.id);

    // Update user's joined groups
    await CommunityUser.findOneAndUpdate(
      { userId: req.user.id },
      { 
        $push: { joinedGroups: { groupId: group._id } },
        $set: { lastActivity: new Date() }
      },
      { upsert: true }
    );

    res.json({
      message: 'Successfully joined group',
      memberCount: group.memberCount
    });
  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({ error: 'Failed to join group' });
  }
});

// Leave group
router.post('/:id/leave', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is a member
    if (!group.isMember(req.user.id)) {
      return res.status(400).json({ error: 'Not a member of this group' });
    }

    // Group creator cannot leave (must transfer ownership or delete group)
    if (group.createdBy === req.user.id) {
      return res.status(400).json({ error: 'Group creator cannot leave. Transfer ownership or delete the group.' });
    }

    // Remove user from group
    await group.removeMember(req.user.id);

    // Remove group from user's joined groups
    await CommunityUser.findOneAndUpdate(
      { userId: req.user.id },
      { $pull: { joinedGroups: { groupId: group._id } } }
    );

    res.json({
      message: 'Successfully left group',
      memberCount: group.memberCount
    });
  } catch (error) {
    console.error('Error leaving group:', error);
    res.status(500).json({ error: 'Failed to leave group' });
  }
});

// Get group members
router.get('/:id/members', validateObjectId('id'), validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const memberIds = group.members.map(m => m.userId);
    const members = await CommunityUser.find({ userId: { $in: memberIds } })
      .select('userId displayName avatar reputation statistics')
      .skip(skip)
      .limit(limit)
      .lean();

    // Add role information from group
    const membersWithRoles = members.map(member => {
      const groupMember = group.members.find(m => m.userId === member.userId);
      return {
        ...member,
        role: groupMember ? groupMember.role : 'MEMBER',
        joinedAt: groupMember ? groupMember.joinedAt : null
      };
    });

    const total = memberIds.length;

    res.json({
      members: membersWithRoles,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalMembers: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching group members:', error);
    res.status(500).json({ error: 'Failed to fetch group members' });
  }
});

// Get user's joined groups
router.get('/user/:userId/groups', validatePagination, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await CommunityUser.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const groupIds = user.joinedGroups.map(g => g.groupId);
    const groups = await Group.find({ 
      _id: { $in: groupIds },
      isActive: true
    })
    .select('-members -moderators')
    .skip(skip)
    .limit(limit)
    .lean();

    const total = groupIds.length;

    res.json({
      groups,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalGroups: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching user groups:', error);
    res.status(500).json({ error: 'Failed to fetch user groups' });
  }
});

module.exports = router;