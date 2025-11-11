import React, { useState, useMemo } from 'react';
import './ProfessionalTable.css';

const ProfessionalTable = ({
  data = [],
  columns = [],
  loading = false,
  sortable = true,
  pagination = true,
  pageSize = 10,
  emptyMessage = "No data available",
  emptyIcon = "📊",
  className = "",
  onRowClick = null,
  actions = null,
  ...props
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);

  // Sorting logic
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortable) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig, sortable]);

  // Pagination logic
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (key) => {
    if (!sortable) return;

    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderCell = (item, column) => {
    if (column.render) {
      return column.render(item[column.key], item);
    }

    const value = item[column.key];

    switch (column.type) {
      case 'currency':
        return (
          <span className={`table-cell-currency ${value < 0 ? 'negative' : ''}`}>
            {typeof value === 'number' ? `₹${value.toLocaleString()}` : value}
          </span>
        );
      case 'number':
        return <span className="table-cell-number">{value?.toLocaleString()}</span>;
      case 'date':
        return (
          <span className="table-cell-date">
            {value ? new Date(value).toLocaleDateString() : '-'}
          </span>
        );
      case 'status':
        return (
          <span className={`status-badge ${column.statusType || 'neutral'}`}>
            {value}
          </span>
        );
      default:
        return value || '-';
    }
  };

  const renderPagination = () => {
    if (!pagination || totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="table-pagination">
        <div className="pagination-info">
          Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} entries
        </div>
        <div className="pagination-controls">
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ‹
          </button>
          
          {startPage > 1 && (
            <>
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(1)}
              >
                1
              </button>
              {startPage > 2 && <span className="pagination-ellipsis">...</span>}
            </>
          )}
          
          {pages.map(page => (
            <button
              key={page}
              className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="pagination-ellipsis">...</span>}
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(totalPages)}
              >
                {totalPages}
              </button>
            </>
          )}
          
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            ›
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`professional-table-container ${className}`} {...props}>
        <div className="table-loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`professional-table-container ${className}`} {...props}>
        <div className="table-empty">
          <div className="table-empty-icon">{emptyIcon}</div>
          <div className="table-empty-title">No Data Found</div>
          <div className="table-empty-description">{emptyMessage}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`professional-table-container ${className}`} {...props}>
      <div className="table-wrapper">
        <table className="professional-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`${sortable && column.sortable !== false ? 'sortable' : ''} ${
                    sortConfig.key === column.key ? `sort-${sortConfig.direction}` : ''
                  }`}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                  style={{ width: column.width }}
                >
                  {column.title}
                </th>
              ))}
              {actions && <th className="table-cell-actions">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr
                key={item.id || index}
                onClick={() => onRowClick && onRowClick(item)}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {columns.map((column) => (
                  <td key={column.key} className={column.className || ''}>
                    {renderCell(item, column)}
                  </td>
                ))}
                {actions && (
                  <td className="table-cell-actions">
                    {actions(item)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {renderPagination()}
    </div>
  );
};

export default ProfessionalTable;