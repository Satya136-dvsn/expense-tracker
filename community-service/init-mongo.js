// MongoDB initialization script
db = db.getSiblingDB('budgetwise_community');

// Create collections with validation
db.createCollection('posts', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'title', 'content', 'category'],
      properties: {
        userId: { bsonType: 'int' },
        title: { bsonType: 'string', maxLength: 200 },
        content: { bsonType: 'string', maxLength: 10000 },
        category: { 
          enum: ['BUDGETING', 'INVESTING', 'DEBT', 'SAVINGS', 'GENERAL', 'TIPS', 'QUESTIONS']
        }
      }
    }
  }
});

db.createCollection('comments', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['postId', 'userId', 'content'],
      properties: {
        userId: { bsonType: 'int' },
        content: { bsonType: 'string', maxLength: 2000 },
        depth: { bsonType: 'int', minimum: 0, maximum: 5 }
      }
    }
  }
});

db.createCollection('communityusers', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'displayName'],
      properties: {
        userId: { bsonType: 'int' },
        displayName: { bsonType: 'string', maxLength: 50 },
        bio: { bsonType: 'string', maxLength: 500 },
        reputation: { bsonType: 'int', minimum: 0 }
      }
    }
  }
});

db.createCollection('groups', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'description', 'category', 'createdBy'],
      properties: {
        name: { bsonType: 'string', maxLength: 100 },
        description: { bsonType: 'string', maxLength: 1000 },
        category: { 
          enum: ['BUDGETING', 'INVESTING', 'DEBT_MANAGEMENT', 'SAVINGS', 'RETIREMENT', 'SIDE_HUSTLES', 'GENERAL']
        },
        createdBy: { bsonType: 'int' }
      }
    }
  }
});

// Create indexes for better performance
db.posts.createIndex({ userId: 1, createdAt: -1 });
db.posts.createIndex({ category: 1, createdAt: -1 });
db.posts.createIndex({ tags: 1 });
db.posts.createIndex({ lastActivity: -1 });
db.posts.createIndex({ moderationStatus: 1 });

db.comments.createIndex({ postId: 1, createdAt: -1 });
db.comments.createIndex({ userId: 1, createdAt: -1 });
db.comments.createIndex({ parentCommentId: 1 });

db.communityusers.createIndex({ userId: 1 }, { unique: true });
db.communityusers.createIndex({ reputation: -1 });
db.communityusers.createIndex({ lastActivity: -1 });

db.groups.createIndex({ name: 1 }, { unique: true });
db.groups.createIndex({ category: 1, 'statistics.memberCount': -1 });
db.groups.createIndex({ tags: 1 });

print('Database initialized successfully');