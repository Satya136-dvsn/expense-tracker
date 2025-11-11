import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './ForumPosts.css';

const ForumPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Filter states
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || 'newest',
    tag: searchParams.get('tag') || ''
  });

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'BUDGETING', label: 'Budgeting' },
    { value: 'INVESTING', label: 'Investing' },
    { value: 'DEBT', label: 'Debt Management' },
    { value: 'SAVINGS', label: 'Savings' },
    { value: 'TIPS', label: 'Tips & Tricks' },
    { value: 'QUESTIONS', label: 'Questions' },
    { value: 'GENERAL', label: 'General Discussion' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'active', label: 'Most Active' }
  ];

  useEffect(() => {
    fetchPosts();
  }, [searchParams]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const page = searchParams.get('page') || '1';
      params.append('page', page);
      params.append('limit', '20');

      const response = await fetch(`/api/community/posts?${params}`);
      const data = await response.json();
      
      setPosts(data.posts || []);
      setPagination(data.pagination || {});
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    const newParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) newParams.set(k, v);
    });
    
    setSearchParams(newParams);
  };

  const handlePageChange = (page) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const getCategoryColor = (category) => {
    const colors = {
      BUDGETING: '#3498db',
      INVESTING: '#2ecc71',
      DEBT: '#e74c3c',
      SAVINGS: '#f39c12',
      TIPS: '#9b59b6',
      QUESTIONS: '#1abc9c',
      GENERAL: '#95a5a6'
    };
    return colors[category] || '#95a5a6';
  };

  if (loading) {
    return (
      <div className="forum-posts">
        <div className="loading-spinner">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="forum-posts">
      <div className="forum-header">
        <div className="header-content">
          <h1>Community Forum</h1>
          <Link to="/community/posts/new" className="create-post-btn">
            <span className="icon">✏️</span>
            Create Post
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="forum-filters">
        <div className="filter-group">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search posts..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <label>Category:</label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="filter-select"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Sort by:</label>
          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="filter-select"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Posts List */}
      <div className="posts-container">
        {posts.length === 0 ? (
          <div className="no-posts">
            <div className="no-posts-icon">📝</div>
            <h3>No posts found</h3>
            <p>Be the first to start a discussion!</p>
            <Link to="/community/posts/new" className="create-first-post">
              Create First Post
            </Link>
          </div>
        ) : (
          <div className="posts-list">
            {posts.map(post => (
              <div key={post._id} className="post-card">
                <div className="post-header">
                  <div className="post-meta">
                    <span 
                      className="category-tag"
                      style={{ backgroundColor: getCategoryColor(post.category) }}
                    >
                      {post.category}
                    </span>
                    <span className="post-time">{formatTimeAgo(post.createdAt)}</span>
                    {post.isPinned && <span className="pinned-badge">📌 Pinned</span>}
                  </div>
                  <div className="post-actions">
                    <button className="bookmark-btn" title="Bookmark">
                      🔖
                    </button>
                  </div>
                </div>

                <div className="post-content">
                  <h2 className="post-title">
                    <Link to={`/community/posts/${post._id}`}>
                      {post.title}
                    </Link>
                  </h2>
                  
                  <p className="post-excerpt">
                    {post.content.substring(0, 200)}
                    {post.content.length > 200 && '...'}
                  </p>

                  {post.tags && post.tags.length > 0 && (
                    <div className="post-tags">
                      {post.tags.map(tag => (
                        <span 
                          key={tag} 
                          className="tag"
                          onClick={() => handleFilterChange('tag', tag)}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="post-footer">
                  <div className="author-info">
                    <div className="author-avatar">
                      {post.author?.avatar ? (
                        <img src={post.author.avatar} alt={post.author.displayName} />
                      ) : (
                        <div className="avatar-placeholder">
                          {post.author?.displayName?.charAt(0) || 'U'}
                        </div>
                      )}
                    </div>
                    <div className="author-details">
                      <span className="author-name">{post.author?.displayName || 'Unknown User'}</span>
                      <span className="author-reputation">
                        ⭐ {post.author?.reputation || 0} reputation
                      </span>
                    </div>
                  </div>

                  <div className="post-stats">
                    <div className="stat">
                      <span className="icon">👍</span>
                      <span>{post.likeCount || 0}</span>
                    </div>
                    <div className="stat">
                      <span className="icon">💬</span>
                      <span>{post.commentsCount || 0}</span>
                    </div>
                    <div className="stat">
                      <span className="icon">👁️</span>
                      <span>{post.views || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrev}
              className="page-btn"
            >
              ← Previous
            </button>
            
            <div className="page-numbers">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = Math.max(1, pagination.currentPage - 2) + i;
                if (pageNum > pagination.totalPages) return null;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`page-btn ${pageNum === pagination.currentPage ? 'active' : ''}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNext}
              className="page-btn"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumPosts;