// Demo Data for Portfolio Presentation

export const demoTransactions = [
  {
    id: 1,
    date: '2024-01-15',
    title: 'Software Engineer Salary',
    description: 'Monthly salary payment',
    category: 'Salary',
    type: 'INCOME',
    amount: 8500.00,
    currency: 'USD'
  },
  {
    id: 2,
    date: '2024-01-14',
    title: 'Grocery Shopping',
    description: 'Weekly groceries at Whole Foods',
    category: 'Food & Dining',
    type: 'EXPENSE',
    amount: -156.78,
    currency: 'USD'
  },
  {
    id: 3,
    date: '2024-01-13',
    title: 'Netflix Subscription',
    description: 'Monthly streaming service',
    category: 'Entertainment',
    type: 'EXPENSE',
    amount: -15.99,
    currency: 'USD'
  },
  {
    id: 4,
    date: '2024-01-12',
    title: 'Freelance Project',
    description: 'Web development project completion',
    category: 'Freelance',
    type: 'INCOME',
    amount: 2500.00,
    currency: 'USD'
  },
  {
    id: 5,
    date: '2024-01-11',
    title: 'Gas Station',
    description: 'Fuel for commute',
    category: 'Transportation',
    type: 'EXPENSE',
    amount: -45.20,
    currency: 'USD'
  },
  {
    id: 6,
    date: '2024-01-10',
    title: 'Coffee Shop',
    description: 'Morning coffee and pastry',
    category: 'Food & Dining',
    type: 'EXPENSE',
    amount: -12.50,
    currency: 'USD'
  },
  {
    id: 7,
    date: '2024-01-09',
    title: 'Investment Dividend',
    description: 'Quarterly dividend payment',
    category: 'Investment',
    type: 'INCOME',
    amount: 450.00,
    currency: 'USD'
  },
  {
    id: 8,
    date: '2024-01-08',
    title: 'Gym Membership',
    description: 'Monthly fitness membership',
    category: 'Health & Fitness',
    type: 'EXPENSE',
    amount: -89.99,
    currency: 'USD'
  }
];

export const demoBudgets = [
  {
    id: 1,
    category: 'Food & Dining',
    budgetAmount: 800.00,
    spentAmount: 456.78,
    currency: 'USD',
    period: 'MONTHLY',
    status: 'ON_TRACK'
  },
  {
    id: 2,
    category: 'Transportation',
    budgetAmount: 300.00,
    spentAmount: 245.20,
    currency: 'USD',
    period: 'MONTHLY',
    status: 'ON_TRACK'
  },
  {
    id: 3,
    category: 'Entertainment',
    budgetAmount: 200.00,
    spentAmount: 156.99,
    currency: 'USD',
    period: 'MONTHLY',
    status: 'ON_TRACK'
  },
  {
    id: 4,
    category: 'Health & Fitness',
    budgetAmount: 150.00,
    spentAmount: 89.99,
    currency: 'USD',
    period: 'MONTHLY',
    status: 'ON_TRACK'
  },
  {
    id: 5,
    category: 'Shopping',
    budgetAmount: 500.00,
    spentAmount: 678.45,
    currency: 'USD',
    period: 'MONTHLY',
    status: 'OVER_BUDGET'
  }
];

export const demoGoals = [
  {
    id: 1,
    title: 'Emergency Fund',
    description: '6 months of expenses for financial security',
    targetAmount: 25000.00,
    currentAmount: 18750.00,
    currency: 'USD',
    targetDate: '2024-12-31',
    category: 'EMERGENCY',
    status: 'IN_PROGRESS'
  },
  {
    id: 2,
    title: 'New MacBook Pro',
    description: 'Upgrade development setup',
    targetAmount: 3500.00,
    currentAmount: 2100.00,
    currency: 'USD',
    targetDate: '2024-06-30',
    category: 'TECHNOLOGY',
    status: 'IN_PROGRESS'
  },
  {
    id: 3,
    title: 'Vacation to Japan',
    description: 'Two-week trip to Tokyo and Kyoto',
    targetAmount: 8000.00,
    currentAmount: 5200.00,
    currency: 'USD',
    targetDate: '2024-09-15',
    category: 'TRAVEL',
    status: 'IN_PROGRESS'
  },
  {
    id: 4,
    title: 'Investment Portfolio',
    description: 'Build diversified investment portfolio',
    targetAmount: 50000.00,
    currentAmount: 32500.00,
    currency: 'USD',
    targetDate: '2025-12-31',
    category: 'INVESTMENT',
    status: 'IN_PROGRESS'
  }
];

export const demoAnalytics = {
  monthlyIncome: 11450.00,
  monthlyExpenses: 2876.45,
  netSavings: 8573.55,
  savingsRate: 74.9,
  topCategories: [
    { category: 'Food & Dining', amount: 456.78, percentage: 15.9 },
    { category: 'Transportation', amount: 245.20, percentage: 8.5 },
    { category: 'Entertainment', amount: 156.99, percentage: 5.5 },
    { category: 'Health & Fitness', amount: 89.99, percentage: 3.1 },
    { category: 'Shopping', amount: 678.45, percentage: 23.6 }
  ],
  monthlyTrend: [
    { month: 'Aug', income: 8500, expenses: 2456, savings: 6044 },
    { month: 'Sep', income: 9200, expenses: 2678, savings: 6522 },
    { month: 'Oct', income: 8500, expenses: 2234, savings: 6266 },
    { month: 'Nov', income: 10800, expenses: 2890, savings: 7910 },
    { month: 'Dec', income: 8500, expenses: 3456, savings: 5044 },
    { month: 'Jan', income: 11450, expenses: 2876, savings: 8574 }
  ]
};

export const demoUser = {
  id: 1,
  firstName: 'Alex',
  lastName: 'Johnson',
  email: 'demo@budgetwise.com',
  currency: 'USD',
  timezone: 'America/New_York',
  joinDate: '2023-06-15',
  profilePicture: null,
  preferences: {
    theme: 'professional',
    notifications: true,
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY'
  }
};

export const demoInvestments = [
  {
    id: 1,
    symbol: 'AAPL',
    name: 'Apple Inc.',
    shares: 25,
    purchasePrice: 150.00,
    currentPrice: 185.50,
    totalValue: 4637.50,
    gainLoss: 887.50,
    gainLossPercentage: 23.67
  },
  {
    id: 2,
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    shares: 10,
    purchasePrice: 2400.00,
    currentPrice: 2650.00,
    totalValue: 26500.00,
    gainLoss: 2500.00,
    gainLossPercentage: 10.42
  },
  {
    id: 3,
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    shares: 15,
    purchasePrice: 220.00,
    currentPrice: 195.00,
    totalValue: 2925.00,
    gainLoss: -375.00,
    gainLossPercentage: -11.36
  }
];

export const demoBills = [
  {
    id: 1,
    name: 'Rent',
    amount: 2200.00,
    dueDate: '2024-02-01',
    category: 'Housing',
    frequency: 'MONTHLY',
    status: 'UPCOMING',
    autopay: false
  },
  {
    id: 2,
    name: 'Electric Bill',
    amount: 125.50,
    dueDate: '2024-01-25',
    category: 'Utilities',
    frequency: 'MONTHLY',
    status: 'PAID',
    autopay: true
  },
  {
    id: 3,
    name: 'Internet',
    amount: 79.99,
    dueDate: '2024-01-28',
    category: 'Utilities',
    frequency: 'MONTHLY',
    status: 'UPCOMING',
    autopay: true
  },
  {
    id: 4,
    name: 'Car Insurance',
    amount: 156.00,
    dueDate: '2024-02-15',
    category: 'Insurance',
    frequency: 'MONTHLY',
    status: 'UPCOMING',
    autopay: true
  }
];

// Demo credentials for recruiters
export const demoCredentials = {
  email: 'demo@budgetwise.com',
  password: 'demo123',
  note: 'Use these credentials to explore the full application'
};

// Portfolio presentation data
export const portfolioHighlights = [
  {
    title: 'Modern React Architecture',
    description: 'Built with React 18, hooks, context API, and modern JavaScript features',
    technologies: ['React 18', 'JavaScript ES6+', 'CSS3', 'HTML5']
  },
  {
    title: 'Professional UI/UX Design',
    description: 'Clean, modern interface with responsive design and accessibility features',
    technologies: ['CSS Grid', 'Flexbox', 'Media Queries', 'ARIA Labels']
  },
  {
    title: 'Full-Stack Implementation',
    description: 'Complete application with Spring Boot backend and PostgreSQL database',
    technologies: ['Spring Boot', 'PostgreSQL', 'REST APIs', 'JPA/Hibernate']
  },
  {
    title: 'Advanced Features',
    description: 'Real-time updates, data visualization, and comprehensive financial tools',
    technologies: ['WebSocket', 'Chart.js', 'Real-time Data', 'Interactive Charts']
  }
];

export const getDemoData = () => ({
  transactions: demoTransactions,
  budgets: demoBudgets,
  goals: demoGoals,
  analytics: demoAnalytics,
  user: demoUser,
  investments: demoInvestments,
  bills: demoBills,
  credentials: demoCredentials,
  highlights: portfolioHighlights
});

export default getDemoData;