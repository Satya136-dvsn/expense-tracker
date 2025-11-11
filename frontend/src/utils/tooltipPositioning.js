/**
 * Intelligent tooltip positioning utilities
 * Handles positioning tooltips to avoid overlaps and edge cases
 */

/**
 * Calculate optimal tooltip position based on chart boundaries and element position
 * @param {Object} elementPosition - Position of the element {x, y}
 * @param {Object} chartBounds - Chart boundaries {width, height, left, top}
 * @param {Object} tooltipSize - Tooltip dimensions {width, height}
 * @param {number} offset - Offset distance from element (default: 20)
 * @returns {Object} Optimal position and quadrant info
 */
export const calculateTooltipPosition = (
  elementPosition,
  chartBounds = { width: 500, height: 500, left: 0, top: 0 },
  tooltipSize = { width: 140, height: 50 },
  offset = 20
) => {
  const { x: elemX, y: elemY } = elementPosition;
  const { width: chartWidth, height: chartHeight, left: chartLeft, top: chartTop } = chartBounds;
  const { width: tooltipWidth, height: tooltipHeight } = tooltipSize;

  // Calculate center of chart
  const centerX = chartLeft + chartWidth / 2;
  const centerY = chartTop + chartHeight / 2;

  // Determine quadrant based on element position relative to center
  const isRight = elemX > centerX;
  const isBottom = elemY > centerY;

  // Calculate base position with offset
  let tooltipX = elemX;
  let tooltipY = elemY;

  // Adjust position based on quadrant to avoid overlaps
  if (isRight && !isBottom) {
    // Top-right quadrant - position tooltip to the right and up
    tooltipX = elemX + offset;
    tooltipY = elemY - offset;
  } else if (!isRight && !isBottom) {
    // Top-left quadrant - position tooltip to the left and up
    tooltipX = elemX - offset;
    tooltipY = elemY - offset;
  } else if (!isRight && isBottom) {
    // Bottom-left quadrant - position tooltip to the left and down
    tooltipX = elemX - offset;
    tooltipY = elemY + offset;
  } else {
    // Bottom-right quadrant - position tooltip to the right and down
    tooltipX = elemX + offset;
    tooltipY = elemY + offset;
  }

  // Ensure tooltip stays within chart boundaries
  const minX = chartLeft + tooltipWidth / 2 + 10;
  const maxX = chartLeft + chartWidth - tooltipWidth / 2 - 10;
  const minY = chartTop + tooltipHeight / 2 + 10;
  const maxY = chartTop + chartHeight - tooltipHeight / 2 - 10;

  tooltipX = Math.max(minX, Math.min(maxX, tooltipX));
  tooltipY = Math.max(minY, Math.min(maxY, tooltipY));

  return {
    x: tooltipX,
    y: tooltipY,
    quadrant: {
      isRight,
      isBottom,
      name: `${isBottom ? 'bottom' : 'top'}-${isRight ? 'right' : 'left'}`
    }
  };
};

/**
 * Calculate connecting line position from element to tooltip
 * @param {Object} elementPosition - Element position {x, y}
 * @param {Object} tooltipPosition - Tooltip position {x, y}
 * @param {number} elementRadius - Radius of the element (for circular elements)
 * @returns {Object} Line start and end positions
 */
export const calculateConnectingLine = (
  elementPosition,
  tooltipPosition,
  elementRadius = 8
) => {
  const { x: elemX, y: elemY } = elementPosition;
  const { x: tooltipX, y: tooltipY } = tooltipPosition;

  // Calculate angle from element to tooltip
  const angle = Math.atan2(tooltipY - elemY, tooltipX - elemX);

  // Calculate line start point (edge of element)
  const lineStartX = elemX + Math.cos(angle) * elementRadius;
  const lineStartY = elemY + Math.sin(angle) * elementRadius;

  // Calculate line end point (edge of tooltip)
  const tooltipRadius = 6; // Approximate radius for tooltip corner
  const lineEndX = tooltipX - Math.cos(angle) * tooltipRadius;
  const lineEndY = tooltipY - Math.sin(angle) * tooltipRadius;

  return {
    start: { x: lineStartX, y: lineStartY },
    end: { x: lineEndX, y: lineEndY }
  };
};

/**
 * Calculate tooltip position for pie chart segments
 * @param {number} startAngle - Start angle of the segment in degrees
 * @param {number} endAngle - End angle of the segment in degrees
 * @param {Object} chartCenter - Chart center position {x, y}
 * @param {number} chartRadius - Chart radius
 * @param {Object} tooltipSize - Tooltip dimensions {width, height}
 * @returns {Object} Tooltip position and line coordinates
 */
export const calculatePieTooltipPosition = (
  startAngle,
  endAngle,
  chartCenter = { x: 250, y: 250 },
  chartRadius = 120,
  tooltipSize = { width: 140, height: 50 }
) => {
  // Calculate middle angle of the segment
  const midAngle = (startAngle + endAngle) / 2;
  const midAngleRad = (midAngle - 90) * Math.PI / 180;

  // Calculate position on the edge of the pie chart
  const edgeX = chartCenter.x + Math.cos(midAngleRad) * chartRadius;
  const edgeY = chartCenter.y + Math.sin(midAngleRad) * chartRadius;

  // Calculate tooltip position further out
  const tooltipDistance = chartRadius + 60;
  let tooltipX = chartCenter.x + Math.cos(midAngleRad) * tooltipDistance;
  let tooltipY = chartCenter.y + Math.sin(midAngleRad) * tooltipDistance;

  // Adjust position based on quadrant to avoid overlaps
  const isRight = tooltipX > chartCenter.x;
  const isBottom = tooltipY > chartCenter.y;

  // Fine-tune position to avoid overlaps
  if (isRight && !isBottom) {
    tooltipX += 30;
    tooltipY -= 15;
  } else if (!isRight && !isBottom) {
    tooltipX -= 30;
    tooltipY -= 15;
  } else if (!isRight && isBottom) {
    tooltipX -= 30;
    tooltipY += 15;
  } else {
    tooltipX += 30;
    tooltipY += 15;
  }

  return {
    tooltip: { x: tooltipX, y: tooltipY },
    line: {
      start: { x: edgeX, y: edgeY },
      end: { x: tooltipX, y: tooltipY }
    },
    quadrant: {
      isRight,
      isBottom,
      name: `${isBottom ? 'bottom' : 'top'}-${isRight ? 'right' : 'left'}`
    }
  };
};

/**
 * Check if tooltip would overlap with chart boundaries
 * @param {Object} position - Tooltip position {x, y}
 * @param {Object} tooltipSize - Tooltip dimensions {width, height}
 * @param {Object} chartBounds - Chart boundaries {width, height, left, top}
 * @returns {boolean} True if tooltip would be outside boundaries
 */
export const isTooltipOutOfBounds = (position, tooltipSize, chartBounds) => {
  const { x, y } = position;
  const { width: tooltipWidth, height: tooltipHeight } = tooltipSize;
  const { width: chartWidth, height: chartHeight, left: chartLeft, top: chartTop } = chartBounds;

  const tooltipLeft = x - tooltipWidth / 2;
  const tooltipRight = x + tooltipWidth / 2;
  const tooltipTop = y - tooltipHeight / 2;
  const tooltipBottom = y + tooltipHeight / 2;

  return (
    tooltipLeft < chartLeft ||
    tooltipRight > chartLeft + chartWidth ||
    tooltipTop < chartTop ||
    tooltipBottom > chartTop + chartHeight
  );
};

/**
 * Adjust tooltip position for mobile screens
 * @param {Object} position - Current tooltip position
 * @param {Object} screenSize - Screen dimensions {width, height}
 * @param {Object} tooltipSize - Tooltip dimensions {width, height}
 * @returns {Object} Adjusted position for mobile
 */
export const adjustForMobile = (position, screenSize, tooltipSize) => {
  if (screenSize.width > 768) {
    return position; // No adjustment needed for desktop
  }

  const { x, y } = position;
  const { width: screenWidth, height: screenHeight } = screenSize;
  const { width: tooltipWidth, height: tooltipHeight } = tooltipSize;

  // Ensure tooltip stays within screen bounds on mobile
  const padding = 10;
  const adjustedX = Math.max(
    tooltipWidth / 2 + padding,
    Math.min(screenWidth - tooltipWidth / 2 - padding, x)
  );
  const adjustedY = Math.max(
    tooltipHeight / 2 + padding,
    Math.min(screenHeight - tooltipHeight / 2 - padding, y)
  );

  return { x: adjustedX, y: adjustedY };
};

export default {
  calculateTooltipPosition,
  calculateConnectingLine,
  calculatePieTooltipPosition,
  isTooltipOutOfBounds,
  adjustForMobile
};