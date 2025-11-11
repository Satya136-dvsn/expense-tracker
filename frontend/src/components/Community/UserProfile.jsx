import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './UserProfile.css';

const UserProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: '',
    bio: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      let endpoint = '/api/community/users/profile';
      if (userId) {
        endpoint = `/api/community/users/${userId}`;
      }

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsOwnProfile(!userId || userData.userId === getCurrentUserId());
        setEditForm({
          displayName: userData.displayName || '',
          bio: userData.bio || ''
        });
        
        // Check if following (if not own profile)
        if (!isOwnProfile) {
          // This would be implemented based on your auth system
          // setIsFollowing(userData.isFollowing);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUserId = () => {
    // This would be implemented based on your auth system
    // For now, return a mock user ID
    return 1;
  };

  const handleFollow = async () => {
    try {
      const response = await fetch(`/api/community/users/${user.userId}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.following);
        setUser(prev => ({
          ...prev,
          followerCount: data.followerCount
        }));
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/api/community/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setEditMode(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const getUserLevel = (reputation) => {
    if (reputation < 50) return { level: 1, name: 'Newcomer', color: '#95a5a6' };
    if (reputation < 100) return { level: 2, name: 'Member', color: '#3498db' };
    if (reputation < 250) return { level: 3, name: 'Regular', color: '#2ecc71' };
    if (reputation < 500) return { level: 4, name: 'Contributor', color: '#f39c12' };
    if (reputation < 1000) return { level: 5, name: 'Expert', color: '#e74c3c' };
    if (reputation < 2500) return { level: 6, name: 'Mentor', color: '#9b59b6' };
    return { level: 7, name: 'Community Leader', color: '#1abc9c' };
  };

  const formatJoinDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  if (loading) {
    return (
      <div className="user-profile">
        <div className="loading-spinner">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user-profile">
        <div className="error-message">User not found</div>
      </div>
    );
  }

  const userLevel = getUserLevel(user.reputation || 0);

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="profile-banner">
          <div className="profile-info">
            <div className="avatar-section">
              <div className="user-avatar">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.displayName} />
                ) : (
                  <div className="avatar-placeholder">
                    {user.displayName?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              
              <div className="user-level" style={{ backgroundColor: userLevel.color }}>
                Level {userLevel.level}
              </div>
            </div>

            <div className="user-details">
              {editMode ? (
                <div className="edit-form">
                  <input
                    type="text"
                    value={editForm.displayName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                    className="edit-input"
                    placeholder="Display Name"
                  />
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    className="edit-textarea"
                    placeholder="Tell us about yourself..."
                    rows="3"
                  />
                  <div className="edit-actions">
                    <button onClick={handleSaveProfile} className="save-btn">Save</button>
                    <button onClick={() => setEditMode(false)} className="cancel-btn">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="user-name">{user.displayName}</h1>
                  <p className="user-title" style={{ color: userLevel.color }}>
                    {userLevel.name}
                  </p>
                  {user.bio && <p className="user-bio">{user.bio}</p>}
                  <p className="join-date">
                    Member since {formatJoinDate(user.createdAt)}
                  </p>
                </>
              )}
            </div>

            <div className="profile-actions">
              {isOwnProfile ? (
                <button 
                  onClick={() => setEditMode(!editMode)} 
                  className="edit-profile-btn"
                >
                  {editMode ? 'Cancel' : 'Edit Profile'}
                </button>
              ) : (
                <button 
                  onClick={handleFollow} 
                  className={`follow-btn ${isFollowing ? 'following' : ''}`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="profile-stats">
          <div className="stat">
            <div className="stat-number">{user.reputation || 0}</div>
            <div className="stat-label">Reputation</div>
          </div>
          <div className="stat">
            <div className="stat-number">{user.statistics?.postsCount || 0}</div>
            <div className="stat-label">Posts</div>
          </div>
          <div className="stat">
            <div className="stat-number">{user.statistics?.commentsCount || 0}</div>
            <div className="stat-label">Comments</div>
          </div>
          <div className="stat">
            <div className="stat-number">{user.followerCount || 0}</div>
            <div className="stat-label">Followers</div>
          </div>
          <div className="stat">
            <div className="stat-number">{user.followingCount || 0}</div>
            <div className="stat-label">Following</div>
          </div>
        </div>
      </div>

      {/* Badges */}
      {user.badges && user.badges.length > 0 && (
        <div className="badges-section">
          <h2>Achievements</h2>
          <div className="badges-grid">
            {user.badges.map((badge, index) => (
              <div key={index} className="badge" title={badge.description}>
                <span className="badge-icon">{badge.icon}</span>
                <span className="badge-name">{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="profile-tabs">
        <div className="tab-buttons">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            Posts ({user.statistics?.postsCount || 0})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
            onClick={() => setActiveTab('comments')}
          >
            Comments ({user.statistics?.commentsCount || 0})
          </button>
          {isOwnProfile && (
            <button 
              className={`tab-btn ${activeTab === 'bookmarks' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookmarks')}
            >
              Bookmarks
            </button>
          )}
        </div>

        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="activity-summary">
                <h3>Recent Activity</h3>
                {user.recentPosts && user.recentPosts.length > 0 ? (
                  <div className="recent-posts">
                    {user.recentPosts.map(post => (
                      <div key={post._id} className="activity-item">
                        <div className="activity-type">📝 Posted</div>
                        <div className="activity-content">
                          <Link to={`/community/posts/${post._id}`} className="activity-title">
                            {post.title}
                          </Link>
                          <div className="activity-meta">
                            <span className="category">{post.category}</span>
                            <span className="date">{formatJoinDate(post.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-activity">No recent activity</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'posts' && (
            <div className="posts-tab">
              <div className="content-placeholder">
                <p>Posts will be loaded here...</p>
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="comments-tab">
              <div className="content-placeholder">
                <p>Comments will be loaded here...</p>
              </div>
            </div>
          )}

          {activeTab === 'bookmarks' && isOwnProfile && (
            <div className="bookmarks-tab">
              <div className="content-placeholder">
                <p>Bookmarked posts will be loaded here...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;