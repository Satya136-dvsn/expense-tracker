// Centralized Financial Health Score Calculator

export const calculateFinancialHealthScore = (userData, transactionData = []) => {
  if (!userData) return { score: 0, factors: [], recommendations: [] };

  const {
    monthlyIncome = 0,
    currentSavings = 0,
    targetExpenses = 0,
    monthlyDebt = 0
  } = userData;

  let totalScore = 0;
  const factors = [];
  const recommendations = [];

  // Factor 1: Savings Rate (0-25 points)
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - targetExpenses) / monthlyIncome) * 100 : 0;
  let savingsScore = 0;
  
  if (savingsRate >= 20) {
    savingsScore = 25;
  } else if (savingsRate >= 15) {
    savingsScore = 20;
  } else if (savingsRate >= 10) {
    savingsScore = 15;
  } else if (savingsRate >= 5) {
    savingsScore = 10;
  } else if (savingsRate > 0) {
    savingsScore = 5;
  }

  factors.push({
    name: 'Savings Rate',
    score: savingsScore,
    maxScore: 25,
    value: `${savingsRate.toFixed(1)}%`,
    description: 'Percentage of income saved monthly'
  });

  if (savingsRate < 10) {
    recommendations.push('Aim to save at least 10% of your monthly income');
  }

  // Factor 2: Emergency Fund (0-20 points)
  const emergencyFundMonths = monthlyIncome > 0 ? currentSavings / (targetExpenses || monthlyIncome) : 0;
  let emergencyScore = 0;

  if (emergencyFundMonths >= 6) {
    emergencyScore = 20;
  } else if (emergencyFundMonths >= 3) {
    emergencyScore = 15;
  } else if (emergencyFundMonths >= 1) {
    emergencyScore = 10;
  } else if (emergencyFundMonths >= 0.5) {
    emergencyScore = 5;
  }

  factors.push({
    name: 'Emergency Fund',
    score: emergencyScore,
    maxScore: 20,
    value: `${emergencyFundMonths.toFixed(1)} months`,
    description: 'Months of expenses covered by savings'
  });

  if (emergencyFundMonths < 3) {
    recommendations.push('Build an emergency fund covering 3-6 months of expenses');
  }

  // Factor 3: Expense Ratio (0-20 points)
  const expenseRatio = monthlyIncome > 0 ? (targetExpenses / monthlyIncome) * 100 : 100;
  let expenseScore = 0;

  if (expenseRatio <= 50) {
    expenseScore = 20;
  } else if (expenseRatio <= 70) {
    expenseScore = 15;
  } else if (expenseRatio <= 80) {
    expenseScore = 10;
  } else if (expenseRatio <= 90) {
    expenseScore = 5;
  }

  factors.push({
    name: 'Expense Control',
    score: expenseScore,
    maxScore: 20,
    value: `${expenseRatio.toFixed(1)}%`,
    description: 'Percentage of income spent on expenses'
  });

  if (expenseRatio > 80) {
    recommendations.push('Try to keep expenses below 80% of your income');
  }

  // Factor 4: Debt-to-Income Ratio (0-15 points)
  const debtRatio = monthlyIncome > 0 ? (monthlyDebt / monthlyIncome) * 100 : 0;
  let debtScore = 0;

  if (debtRatio === 0) {
    debtScore = 15;
  } else if (debtRatio <= 10) {
    debtScore = 12;
  } else if (debtRatio <= 20) {
    debtScore = 8;
  } else if (debtRatio <= 30) {
    debtScore = 4;
  }

  factors.push({
    name: 'Debt Management',
    score: debtScore,
    maxScore: 15,
    value: `${debtRatio.toFixed(1)}%`,
    description: 'Monthly debt payments as % of income'
  });

  if (debtRatio > 20) {
    recommendations.push('Consider reducing debt payments to below 20% of income');
  }

  // Factor 5: Income Stability (0-10 points)
  let incomeScore = 0;
  if (monthlyIncome > 0) {
    if (monthlyIncome >= 50000) {
      incomeScore = 10;
    } else if (monthlyIncome >= 30000) {
      incomeScore = 8;
    } else if (monthlyIncome >= 20000) {
      incomeScore = 6;
    } else if (monthlyIncome >= 10000) {
      incomeScore = 4;
    } else {
      incomeScore = 2;
    }
  }

  factors.push({
    name: 'Income Level',
    score: incomeScore,
    maxScore: 10,
    value: `₹${monthlyIncome.toLocaleString()}`,
    description: 'Monthly income amount'
  });

  // Factor 6: Transaction Consistency (0-10 points)
  let consistencyScore = 0;
  if (transactionData && transactionData.length > 0) {
    const recentTransactions = transactionData.filter(t => {
      const transactionDate = new Date(t.transactionDate || t.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return transactionDate >= thirtyDaysAgo;
    });

    if (recentTransactions.length >= 10) {
      consistencyScore = 10;
    } else if (recentTransactions.length >= 5) {
      consistencyScore = 7;
    } else if (recentTransactions.length >= 2) {
      consistencyScore = 4;
    } else if (recentTransactions.length >= 1) {
      consistencyScore = 2;
    }
  }

  factors.push({
    name: 'Financial Activity',
    score: consistencyScore,
    maxScore: 10,
    value: transactionData ? `${transactionData.length} transactions` : 'No data',
    description: 'Regular financial tracking and activity'
  });

  if (consistencyScore < 5) {
    recommendations.push('Track your expenses regularly for better financial awareness');
  }

  // Calculate total score
  totalScore = savingsScore + emergencyScore + expenseScore + debtScore + incomeScore + consistencyScore;

  // Add general recommendations
  if (totalScore < 60) {
    recommendations.push('Focus on building an emergency fund and reducing expenses');
  }
  if (totalScore >= 80) {
    recommendations.push('Excellent financial health! Consider investing for long-term growth');
  }

  return {
    score: Math.round(totalScore),
    factors,
    recommendations,
    breakdown: {
      savingsRate: savingsRate.toFixed(1),
      emergencyFundMonths: emergencyFundMonths.toFixed(1),
      expenseRatio: expenseRatio.toFixed(1),
      debtRatio: debtRatio.toFixed(1)
    }
  };
};

export const getHealthScoreStatus = (score) => {
  if (score >= 80) return { status: 'Excellent', color: '#22c55e', icon: '🌟' };
  if (score >= 60) return { status: 'Good', color: '#3b82f6', icon: '👍' };
  if (score >= 40) return { status: 'Fair', color: '#f59e0b', icon: '⚠️' };
  return { status: 'Needs Improvement', color: '#ef4444', icon: '🚨' };
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
};