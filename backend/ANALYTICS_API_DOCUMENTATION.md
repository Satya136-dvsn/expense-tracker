# Analytics API Documentation

## Overview

The Analytics API provides comprehensive financial insights and data visualization capabilities for the BudgetWise application. This API enables users to analyze their spending patterns, track financial health, and generate detailed reports.

## Base URL

```
/api/analytics
```

## Authentication

All analytics endpoints require JWT authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Monthly Trends

**GET** `/api/analytics/monthly-trends`

Retrieves monthly income and expense trends for data visualization.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| months | integer | No | Number of months to retrieve (default: 6, max: 24) |

#### Response

```json
{
  "trends": [
    {
      "month": 10,
      "year": 2024,
      "totalIncome": 5000.00,
      "totalExpenses": 3500.00,
      "netSavings": 1500.00,
      "transactionCount": 45
    }
  ],
  "averageIncome": 5000.00,
  "averageExpenses": 3500.00,
  "trendDirection": "IMPROVING"
}
```

#### Status Codes

- `200 OK` - Success
- `400 Bad Request` - Invalid parameters
- `401 Unauthorized` - Invalid or missing JWT token

---

### 2. Category Breakdown

**GET** `/api/analytics/category-breakdown`

Provides expense breakdown by category for pie chart visualization.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | string | No | Start date (YYYY-MM-DD format) |
| endDate | string | No | End date (YYYY-MM-DD format) |

#### Response

```json
{
  "expenseCategories": [
    {
      "categoryName": "Food & Dining",
      "amount": 800.00,
      "percentage": 35.5,
      "transactionCount": 15
    },
    {
      "categoryName": "Transportation",
      "amount": 400.00,
      "percentage": 17.8,
      "transactionCount": 8
    }
  ],
  "totalExpenses": 2250.00,
  "topSpendingCategory": "Food & Dining",
  "categoryCount": 5
}
```

---

### 3. Financial Health Score

**GET** `/api/analytics/financial-health`

Calculates and returns the user's financial health score with recommendations.

#### Response

```json
{
  "healthScore": 75,
  "factorScores": {
    "savingsRate": 85,
    "budgetAdherence": 70,
    "expenseVariability": 65,
    "incomeStability": 90
  },
  "recommendations": [
    "Consider increasing your emergency fund to 6 months of expenses",
    "Review your entertainment budget - you're 15% over this month"
  ],
  "healthTrend": "IMPROVING",
  "lastCalculated": "2024-10-24T10:30:00Z"
}
```

---

### 4. Budget Analysis

**GET** `/api/analytics/budget-analysis`

Compares actual spending against budgets for a specific month.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| month | integer | Yes | Month (1-12) |
| year | integer | Yes | Year (e.g., 2024) |

#### Response

```json
{
  "budgetItems": [
    {
      "category": "Food & Dining",
      "budgetAmount": 500.00,
      "actualAmount": 450.00,
      "variance": -50.00,
      "variancePercentage": -10.0,
      "status": "UNDER_BUDGET"
    },
    {
      "category": "Transportation",
      "budgetAmount": 300.00,
      "actualAmount": 350.00,
      "variance": 50.00,
      "variancePercentage": 16.7,
      "status": "OVER_BUDGET"
    }
  ],
  "totalBudget": 2000.00,
  "totalSpent": 1950.00,
  "overallVariance": -50.00,
  "overallVariancePercentage": -2.5,
  "categoriesOverBudget": 1,
  "categoriesUnderBudget": 4
}
```

---

### 5. Savings Progress

**GET** `/api/analytics/savings-progress`

Retrieves progress information for all savings goals.

#### Response

```json
{
  "goals": [
    {
      "id": 1,
      "name": "Emergency Fund",
      "targetAmount": 10000.00,
      "currentAmount": 6500.00,
      "progressPercentage": 65.0,
      "remainingAmount": 3500.00,
      "targetDate": "2025-06-01",
      "daysRemaining": 220,
      "status": "IN_PROGRESS",
      "onTrack": true
    }
  ],
  "totalGoals": 3,
  "completedGoals": 1,
  "inProgressGoals": 2,
  "overallProgressPercent": 45.5,
  "totalTargetAmount": 25000.00,
  "totalCurrentAmount": 11375.00
}
```

---

### 6. Dashboard Summary

**GET** `/api/analytics/dashboard`

Provides a comprehensive dashboard view combining multiple analytics.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| months | integer | No | Number of months for trends (default: 6) |

#### Response

```json
{
  "monthlyTrends": { /* Monthly trends data */ },
  "categoryBreakdown": { /* Category breakdown data */ },
  "financialHealth": { /* Financial health data */ },
  "budgetAnalysis": { /* Current month budget analysis */ },
  "savingsProgress": { /* Savings progress data */ },
  "quickStats": {
    "currentMonthIncome": 5000.00,
    "currentMonthExpenses": 3200.00,
    "currentMonthSavings": 1800.00,
    "budgetUtilization": 85.5,
    "goalsOnTrack": 2
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "INVALID_PARAMETER",
  "message": "Month parameter must be between 1 and 12",
  "timestamp": "2024-10-24T10:30:00Z",
  "path": "/api/analytics/budget-analysis"
}
```

### Common Error Codes

- `INVALID_PARAMETER` - Invalid request parameters
- `INSUFFICIENT_DATA` - Not enough data for analysis
- `UNAUTHORIZED` - Invalid or missing authentication
- `INTERNAL_ERROR` - Server error during processing

## Rate Limiting

Analytics endpoints are rate-limited to prevent abuse:

- **Limit**: 100 requests per hour per user
- **Headers**: Rate limit information is included in response headers
  - `X-RateLimit-Limit`: Maximum requests per hour
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Time when the rate limit resets

## Data Freshness

- Analytics data is calculated in real-time for the most accurate results
- Complex calculations may be cached for up to 5 minutes
- Cache headers indicate data freshness:
  - `Cache-Control`: Caching policy
  - `Last-Modified`: When the data was last updated

## Performance Considerations

- Large date ranges may result in slower response times
- Consider using pagination for datasets with many transactions
- Monthly trends are optimized for up to 24 months of data
- Category breakdowns perform best with date ranges under 1 year

## Examples

### Get 12 months of trends

```bash
curl -X GET "https://api.budgetwise.com/api/analytics/monthly-trends?months=12" \
  -H "Authorization: Bearer your_jwt_token"
```

### Get category breakdown for current month

```bash
curl -X GET "https://api.budgetwise.com/api/analytics/category-breakdown?startDate=2024-10-01&endDate=2024-10-31" \
  -H "Authorization: Bearer your_jwt_token"
```

### Get budget analysis for October 2024

```bash
curl -X GET "https://api.budgetwise.com/api/analytics/budget-analysis?month=10&year=2024" \
  -H "Authorization: Bearer your_jwt_token"
```