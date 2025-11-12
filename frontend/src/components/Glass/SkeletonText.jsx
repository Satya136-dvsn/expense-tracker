import React from 'react';

const SkeletonText = ({ width = '100%', height = '16px' }) => {
  return (
    <div className="skeleton-text" style={{ width, height }}></div>
  );
};

export default SkeletonText;
