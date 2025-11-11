# Export API Documentation

## Overview

The Export API provides comprehensive data export capabilities for the BudgetWise application. Users can export their financial data in multiple formats including PDF, CSV, and Excel with customizable options and professional formatting.

## Base URL

```
/api/export
```

## Authentication

All export endpoints require JWT authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. PDF Export

**GET** `/api/export/pdf`

Generates a PDF report of transactions and financial data.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | string | Yes | Start date (YYYY-MM-DD format) |
| endDate | string | Yes | End date (YYYY-MM-DD format) |
| categories | string | No | Comma-separated category names |
| includeCharts | boolean | No | Include charts in PDF (default: false) |

#### Response

- **Content-Type**: `application/pdf`
- **Content-Disposition**: `attachment; filename="transactions_YYYY-MM-DD_to_YYYY-MM-DD.pdf"`

#### Example

```bash
curl -X GET "https://api.budgetwise.com/api/export/pdf?startDate=2024-01-01&endDate=2024-12-31&includeCharts=true" \
  -H "Authorization: Bearer your_jwt_token" \
  --output transactions_2024.pdf
```

---

### 2. CSV Export

**GET** `/api/export/csv`

Exports transaction data in CSV format for spreadsheet applications.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | string | Yes | Start date (YYYY-MM-DD format) |
| endDate | string | Yes | End date (YYYY-MM-DD format) |
| categories | string | No | Comma-separated category names |
| includeHeaders | boolean | No | Include column headers (default: true) |

#### Response

- **Content-Type**: `text/csv`
- **Content-Disposition**: `attachment; filename="transactions_YYYY-MM-DD_to_YYYY-MM-DD.csv"`

#### CSV Format

```csv
Date,Description,Category,Type,Amount
2024-10-01,Grocery Shopping,Food & Dining,EXPENSE,125.50
2024-10-01,Salary Deposit,Income,INCOME,5000.00
2024-10-02,Gas Station,Transportation,EXPENSE,45.00
```

---

### 3. Excel Export

**GET** `/api/export/excel`

Generates an Excel workbook with multiple sheets for comprehensive financial analysis.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | string | Yes | Start date (YYYY-MM-DD format) |
| endDate | string | Yes | End date (YYYY-MM-DD format) |
| includeCharts | boolean | No | Include charts in Excel (default: true) |
| includeSummary | boolean | No | Include summary sheet (default: true) |

#### Response

- **Content-Type**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Content-Disposition**: `attachment; filename="financial_report_YYYY-MM-DD_to_YYYY-MM-DD.xlsx"`

#### Excel Structure

The Excel file contains multiple sheets:

1. **Summary** - Overview of income, expenses, and savings
2. **Transactions** - Detailed transaction list
3. **Categories** - Category-wise breakdown
4. **Monthly Trends** - Month-by-month analysis
5. **Budget Analysis** - Budget vs actual comparison (if budgets exist)
6. **Charts** - Visual representations (if includeCharts=true)

---

### 4. Comprehensive Report

**GET** `/api/export/comprehensive`

Generates a comprehensive PDF report with analytics, charts, and insights.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | string | Yes | Start date (YYYY-MM-DD format) |
| endDate | string | Yes | End date (YYYY-MM-DD format) |
| includeCharts | boolean | No | Include charts and graphs (default: true) |
| includeInsights | boolean | No | Include AI-generated insights (default: true) |
| template | string | No | Report template (default, detailed, summary) |

#### Response

- **Content-Type**: `application/pdf`
- **Content-Disposition**: `attachment; filename="comprehensive_report_YYYY-MM-DD_to_YYYY-MM-DD.pdf"`

#### Report Sections

1. **Executive Summary** - Key financial metrics and highlights
2. **Income Analysis** - Income trends and sources
3. **Expense Analysis** - Spending patterns and categories
4. **Budget Performance** - Budget adherence and variances
5. **Savings Progress** - Goal tracking and recommendations
6. **Financial Health** - Overall financial wellness score
7. **Recommendations** - Personalized financial advice

---

### 5. Budget Report

**GET** `/api/export/budget-report`

Generates a focused report on budget performance.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| month | integer | Yes | Month (1-12) |
| year | integer | Yes | Year (e.g., 2024) |
| format | string | No | Output format (pdf, excel) - default: pdf |

#### Response

Budget-specific report showing:
- Budget vs actual spending by category
- Variance analysis
- Spending trends within the month
- Recommendations for budget adjustments

---

### 6. Export Templates

**GET** `/api/export/templates`

Retrieves available export templates and their configurations.

#### Response

```json
{
  "templates": [
    {
      "id": "default",
      "name": "Default Report",
      "description": "Standard financial report with all sections",
      "sections": ["summary", "transactions", "categories", "trends"]
    },
    {
      "id": "detailed",
      "name": "Detailed Analysis",
      "description": "Comprehensive report with advanced analytics",
      "sections": ["summary", "transactions", "categories", "trends", "insights", "recommendations"]
    },
    {
      "id": "summary",
      "name": "Executive Summary",
      "description": "High-level overview for quick review",
      "sections": ["summary", "key_metrics", "highlights"]
    }
  ]
}
```

## Export Status and Progress

### Check Export Status

**GET** `/api/export/status/{exportId}`

For large exports, check the processing status.

#### Response

```json
{
  "exportId": "exp_123456789",
  "status": "PROCESSING",
  "progress": 65,
  "estimatedCompletion": "2024-10-24T10:35:00Z",
  "downloadUrl": null
}
```

#### Status Values

- `QUEUED` - Export request is queued
- `PROCESSING` - Export is being generated
- `COMPLETED` - Export is ready for download
- `FAILED` - Export generation failed
- `EXPIRED` - Download link has expired

## Error Responses

```json
{
  "error": "INVALID_DATE_RANGE",
  "message": "End date must be after start date",
  "timestamp": "2024-10-24T10:30:00Z",
  "path": "/api/export/pdf"
}
```

### Common Error Codes

- `INVALID_DATE_RANGE` - Invalid or illogical date range
- `NO_DATA_FOUND` - No transactions found for the specified criteria
- `EXPORT_TOO_LARGE` - Requested export exceeds size limits
- `GENERATION_FAILED` - Error during file generation
- `UNAUTHORIZED` - Invalid or missing authentication

## File Size Limits

- **PDF Reports**: Maximum 50MB
- **CSV Files**: Maximum 100MB
- **Excel Files**: Maximum 75MB
- **Transaction Limit**: Maximum 50,000 transactions per export

## Rate Limiting

Export endpoints have specific rate limits to manage server resources:

- **PDF/Excel Exports**: 10 requests per hour per user
- **CSV Exports**: 20 requests per hour per user
- **Template Requests**: 100 requests per hour per user

## Customization Options

### PDF Customization

```json
{
  "template": "detailed",
  "options": {
    "includeCharts": true,
    "includeInsights": true,
    "colorScheme": "professional",
    "logoUrl": "https://example.com/logo.png",
    "companyName": "My Company",
    "reportTitle": "Monthly Financial Review"
  }
}
```

### Excel Customization

```json
{
  "options": {
    "includeCharts": true,
    "includePivotTables": true,
    "sheetNames": {
      "transactions": "Transaction Details",
      "summary": "Financial Summary"
    },
    "formatting": {
      "currency": "USD",
      "dateFormat": "MM/DD/YYYY"
    }
  }
}
```

## Security Considerations

- All exported files are temporarily stored and automatically deleted after 24 hours
- Export URLs are signed and expire after 1 hour
- User data is filtered to ensure users can only export their own data
- All exports are logged for audit purposes

## Performance Tips

1. **Limit Date Ranges**: Smaller date ranges export faster
2. **Filter Categories**: Specify categories to reduce data volume
3. **Avoid Peak Hours**: Export during off-peak hours for better performance
4. **Use CSV for Large Datasets**: CSV exports are faster for large amounts of data
5. **Cache Results**: Don't re-export the same data repeatedly

## Examples

### Export PDF with charts for the year

```bash
curl -X GET "https://api.budgetwise.com/api/export/pdf?startDate=2024-01-01&endDate=2024-12-31&includeCharts=true" \
  -H "Authorization: Bearer your_jwt_token" \
  --output annual_report_2024.pdf
```

### Export CSV for specific categories

```bash
curl -X GET "https://api.budgetwise.com/api/export/csv?startDate=2024-10-01&endDate=2024-10-31&categories=Food%20%26%20Dining,Transportation" \
  -H "Authorization: Bearer your_jwt_token" \
  --output october_expenses.csv
```

### Generate comprehensive Excel report

```bash
curl -X GET "https://api.budgetwise.com/api/export/excel?startDate=2024-01-01&endDate=2024-12-31&includeCharts=true&includeSummary=true" \
  -H "Authorization: Bearer your_jwt_token" \
  --output comprehensive_report_2024.xlsx
```