import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './FinancialGroups.css';

const FinancialGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Filter states
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || 'popular'
  });

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'BUDGETING', label: 'Budgeting' },
    { value: 'INVESTING', label: 'Investing' },
    { value: 'DEBT_MANAGEMENT', label: 'Debt Management' },
    { value: 'SAVINGS', label: 'Savings' },
    { value: 'RETIREMENT', label: 'Retirement Planning' },
    { value: 'SIDE_HUSTLES', label: 'Side Hustles' },
    { value: 'GENERAL', label: 'General Discussion' }
  ];

  const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'newest', label: 'Newest First' },
    { value: 'active', label: 'Most Active' }
  ];

  useEffect(() => {
    fetchGroups();
  }, [searchParams]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const page = searchParams.get('page') || '1';
      params.append('page', page);
      params.append('limit', '12');

      const response = await fetch(`/api/community/groups?${params}`);
      const data = await response.json();
      
      setGroups(data.groups || []);
      setPagination(data.pagination || {});
    } catch (error) {
      console.error('Error fetching groups:', error);
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

  const handleJoinGroup = async (groupId) => {
    try {
      const response = await fetch(`/api/community/groups/${groupId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Update the group in the list
        setGroups(prev => prev.map(group => 
          group._id === groupId 
            ? { ...group, statistics: { ...group.statistics, memberCount: data.memberCount }, isMember: true }
            : group
        ));
      }
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      BUDGETING: '💰',
      INVESTING: '📈',
      DEBT_MANAGEMENT: '💳',
      SAVINGS: '🏦',
      RETIREMENT: '🏖️',
      SIDE_HUSTLES: '💼',
      GENERAL: '💬'
    };
    return icons[category] || '💬';
  };

  const getCategoryColor = (category) => {
    const colors = {
      BUDGETING: '#3498db',
      INVESTING: '#2ecc71',
      DEBT_MANAGEMENT: '#e74c3c',
      SAVINGS: '#f39c12',
      RETIREMENT: '#9b59b6',
      SIDE_HUSTLES: '#1abc9c',
      GENERAL: '#95a5a6'
    };
    return colors[category] || '#95a5a6';
  };

  if (loading) {
    return (
      <div className="financial-groups">
        <div className="loading-spinner">Loading groups...</div>
      </div>
    );
  }

  return (
    <div className="financial-groups">
      <div className="groups-header">
        <div className="header-content">
          <h1>Financial Groups</h1>
          <p>Join communities of like-minded individuals working towards similar financial goals.</p>
          <Link to="/community/groups/new" className="create-group-btn">
            <span className="icon">➕</span>
            Create Group
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="groups-filters">
        <div className="filter-group">
          <label>Search Groups:</label>
          <input
            type="text"
            placeholder="Search by name or description..."
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

      {/* Featured Categories */}
      <div className="featured-categories">
        <h2>Browse by Category</h2>
        <div className="categories-grid">
          {categories.slice(1).map(category => (
            <div 
              key={category.value} 
              className="category-card"
              onClick={() => handleFilterChange('category', category.value)}
              style={{ borderColor: getCategoryColor(category.value) }}
            >
              <div className="category-icon">
                {getCategoryIcon(category.value)}
              </div>
              <h3>{category.label}</h3>
              <p>Connect with others interested in {category.label.toLowerCase()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Groups Grid */}
      <div className="groups-container">
        {groups.length === 0 ? (
          <div className="no-groups">
            <div className="no-groups-icon">👥</div>
            <h3>No groups found</h3>
            <p>Try adjusting your search criteria or create a new group!</p>
            <Link to="/community/groups/new" className="create-first-group">
              Create First Group
            </Link>
          </div>
        ) : (
          <div className="groups-grid">
            {groups.map(group => (
              <div key={group._id} className="group-card">
                <div className="group-header">
                  <div className="group-icon">
                    {group.icon || getCategoryIcon(group.category)}
                  </div>
                  <div className="group-privacy">
                    {group.isPrivate && <span className="private-badge">🔒 Private</span>}
                  </div>
                </div>

                <div className="group-content">
                  <h3 className="group-name">
                    <Link to={`/community/groups/${group._id}`}>
                      {group.name}
                    </Link>
                  </h3>
                  
                  <p className="group-description">
                    {group.description.length > 120 
                      ? `${group.description.substring(0, 120)}...`
                      : group.description
                    }
                  </p>

                  <div className="group-meta">
                    <span 
                      className="category-tag"
                      style={{ backgroundColor: getCategoryColor(group.category) }}
                    >
                      {group.category.replace('_', ' ')}
                    </span>
                    
                    {group.tags && group.tags.length > 0 && (
                      <div className="group-tags">
                        {group.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="tag">#{tag}</span>
                        ))}
                        {group.tags.length > 3 && (
                          <span className="tag-more">+{group.tags.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="group-footer">
                  <div className="group-stats">
                    <div className="stat">
                      <span className="icon">👥</span>
                      <span>{group.statistics?.memberCount || 0} members</span>
                    </div>
                    <div className="stat">
                      <span className="icon">📝</span>
                      <span>{group.statistics?.postCount || 0} posts</span>
                    </div>
                  </div>

                  <div className="group-actions">
                    {group.isMember ? (
                      <Link 
                        to={`/community/groups/${group._id}`}
                        className="view-group-btn"
                      >
                        View Group
                      </Link>
                    ) : (
                      <button 
                        onClick={() => handleJoinGroup(group._id)}
                        className="join-group-btn"
                        disabled={group.isPrivate}
                      >
                        {group.isPrivate ? 'Request Access' : 'Join Group'}
                      </button>
                    )}
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

export default FinancialGroups;