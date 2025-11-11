// Currency formatting utility for Indian Rupees
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format(amount || 0);
};

// Convert demo amounts to realistic Indian Rupee values
export const convertToINR = (dollarAmount) => {
  // Multiply by 83 (approximate USD to INR conversion) and round
  return Math.round(dollarAmount * 83);
};

// Format large numbers in Indian numbering system (lakhs, crores)
export const formatIndianCurrency = (amount) => {
  if (amount >= 10000000) { // 1 crore
    return `₹${(amount / 10000000).toFixed(1)} Cr`;
  } else if (amount >= 100000) { // 1 lakh
    return `₹${(amount / 100000).toFixed(1)} L`;
  } else if (amount >= 1000) { // 1 thousand
    return `₹${(amount / 1000).toFixed(1)}K`;
  } else {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
};