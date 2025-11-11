// Currency formatting utility
// Uses Indian Rupee (₹) as the currency symbol

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }
  
  // Format with Indian locale for proper thousand separators
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
};

export const formatCurrencyCompact = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }
  
  const value = Math.round(amount);
  
  if (value >= 10000000) { // 1 crore or more
    return `₹${(value / 10000000).toFixed(1)}Cr`;
  } else if (value >= 100000) { // 1 lakh or more
    return `₹${(value / 100000).toFixed(1)}L`;
  } else if (value >= 1000) { // 1 thousand or more
    return `₹${(value / 1000).toFixed(1)}k`;
  }
  
  return `₹${value.toLocaleString('en-IN')}`;
};

export const CURRENCY_SYMBOL = '₹';
