import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CommunityHub.css';

const CommunityHub = () => {
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalUsers: 0,
    totalGroups: 0,
    activeUsers: 0
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [popularGroups, setPopularGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const handleCreatePost = () => {
    const title = prompt('Enter post title:');
    if (title) {
      const content = prompt('Enter post content:');
      if (content) {
        alert(`Post Created!\n\nTitle: ${title}\nContent: ${content}\n\nThis would normally be saved to the community database.`);
        // In a real app, this would create a new post
      }
    }
  };

  const handleBrowseGroups = () => {
    alert('Browse Groups\n\nAvailable Groups:\n• Budgeting Beginners (1,250 members)\n• Investment Club (890 members)\n• Debt Freedom (675 members)\n• Retirement Planning (543 members)\n• Side Hustles (432 members)\n• Frugal Living (321 members)\n\nClick on any group to join the discussion!');
  };

  const handleViewLeaderboard = () => {
    alert('Community Leaderboard\n\n🏆 Top Contributors:\n1. FinanceGuru - 2,450 points\n2. InvestSmart - 2,120 points\n3. DebtFree2024 - 1,890 points\n4. TaxExpert - 1,675 points\n5. SafeSaver - 1,432 points\n\nPoints are earned by posting helpful content, answering questions, and receiving likes from the community!');
  };

  const handleViewProfile = () => {
    alert('My Community Profile\n\n👤 Profile Stats:\n• Posts Created: 12\n• Comments Made: 45\n• Likes Received: 128\n• Community Points: 567\n• Member Since: January 2024\n• Groups Joined: 3\n\nBadges Earned:\n🥉 Helpful Contributor\n📝 Active Poster\n💬 Great Commenter');
  };

  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      
      // Mock data for now since backend might not be fully connected
      const mockPosts = [
        { id: 1, title: 'Best budgeting apps for beginners', author: 'FinanceGuru', replies: 12, likes: 25, createdAt: '2024-01-15' },
        { id: 2, title: 'How I paid off ₹41.5L in debt', author: 'DebtFree2024', replies: 8, likes: 45, createdAt: '2024-01-14' },
        { id: 3, title: 'Investment strategies for young professionals', author: 'InvestSmart', replies: 15, likes: 32, createdAt: '2024-01-13' },
        { id: 4, title: 'Emergency fund: How much is enough?', author: 'SafeSaver', replies: 6, likes: 18, createdAt: '2024-01-12' },
        { id: 5, title: 'Tax planning tips for 2024', author: 'TaxExpert', replies: 9, likes: 28, createdAt: '2024-01-11' }
      ];

      const mockGroups = [
        { id: 1, name: 'Budgeting Beginners', members: 1250, description: 'Learn the basics of budgeting' },
        { id: 2, name: 'Investment Club', members: 890, description: 'Discuss investment strategies' },
        { id: 3, name: 'Debt Freedom', members: 675, description: 'Support for debt payoff journeys' },
        { id: 4, name: 'Retirement Planning', members: 543, description: 'Plan for your golden years' },
        { id: 5, name: 'Side Hustles', members: 432, description: 'Extra income opportunities' },
        { id: 6, name: 'Frugal Living', members: 321, description: 'Living well on less' }
      ];

      const mockStats = {
        totalPosts: 1247,
        totalUsers: 3456,
        totalGroups: 28,
        activeUsers: 234
      };

      setRecentPosts(mockPosts);
      setPopularGroups(mockGroups);
      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching community data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="community-hub">
        <div className="loading-spinner">Loading community...</div>
      </div>
    );
  }

  return (
    <div className="community-hub">
      <div className="community-header">
        <h1>Community Hub</h1>
        <p>Connect with fellow BudgetWise users, share tips, and learn from each other's financial journeys.</p>
      </div>

      {/* Community Stats */}
      <div className="community-stats">
        <div className="stat-card">
          <div className="stat-number">{stats.totalPosts.toLocaleString()}</div>
          <div className="stat-label">Posts</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalUsers.toLocaleString()}</div>
          <div className="stat-label">Members</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalGroups}</div>
          <div className="stat-label">Groups</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.activeUsers}</div>
          <div className="stat-label">Online Now</div>
        </div>
      </div>

      <div className="community-content">
        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button 
              onClick={() => handleCreatePost()}
              className="action-btn primary"
            >
              <span className="icon">✏️</span>
              Create Post
            </button>
            <button 
              onClick={() => handleBrowseGroups()}
              className="action-btn"
            >
              <span className="icon">👥</span>
              Browse Groups
            </button>
            <button 
              onClick={() => handleViewLeaderboard()}
              className="action-btn"
            >
              <span className="icon">🏆</span>
              Leaderboard
            </button>
            <button 
              onClick={() => handleViewProfile()}
              className="action-btn"
            >
              <span className="icon">👤</span>
              My Profile
            </button>
          </div>
        </div>

        {/* Recent Posts */}
        <div className="recent-posts">
          <div className="section-header">
            <h2>Recent Discussions</h2>
            <Link to="/community/posts" className="view-all">View All</Link>
          </div>
          <div className="posts-list">
            {recentPosts.map(post => (
              <div key={post.id} className="post-preview">
                <div className="post-meta">
                  <span className="category">Discussion</span>
                  <span className="timestamp">{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                <h3>
                  <Link to={`/community/posts/${post.id}`}>{post.title}</Link>
                </h3>
                <div className="post-stats">
                  <span className="author">by {post.author}</span>
                  <span className="likes">👍 {post.likes}</span>
                  <span className="comments">💬 {post.replies}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Groups */}
        <div className="popular-groups">
          <div className="section-header">
            <h2>Popular Groups</h2>
            <Link to="/community/groups" className="view-all">View All</Link>
          </div>
          <div className="groups-grid">
            {popularGroups.map(group => (
              <div key={group._id} className="group-card">
                <div className="group-icon">
                  {group.icon || '💰'}
                </div>
                <h3>
                  <Link to={`/community/groups/${group._id}`}>{group.name}</Link>
                </h3>
                <p className="group-description">
                  {group.description.substring(0, 80)}...
                </p>
                <div className="group-stats">
                  <span className="members">{group.statistics?.memberCount || 0} members</span>
                  <span className="category">{group.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Community Guidelines */}
        <div className="community-guidelines">
          <h2>Community Guidelines</h2>
          <div className="guidelines-list">
            <div className="guideline">
              <span className="icon">🤝</span>
              <div>
                <h4>Be Respectful</h4>
                <p>Treat all community members with respect and kindness.</p>
              </div>
            </div>
            <div className="guideline">
              <span className="icon">💡</span>
              <div>
                <h4>Share Knowledge</h4>
                <p>Help others by sharing your financial experiences and tips.</p>
              </div>
            </div>
            <div className="guideline">
              <span className="icon">🚫</span>
              <div>
                <h4>No Spam</h4>
                <p>Keep posts relevant and avoid promotional content.</p>
              </div>
            </div>
            <div className="guideline">
              <span className="icon">🔒</span>
              <div>
                <h4>Privacy First</h4>
                <p>Don't share personal financial details or sensitive information.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityHub;