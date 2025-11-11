# Design Document

## Overview

This design document outlines the implementation approach for completing the BudgetWise application with data visualization & analytics (Milestone 4) and export functionality & advanced features (Milestone 5). The design builds upon the existing solid foundation of authentication, transaction management, and budget/savings systems.

The solution focuses on creating a seamless user experience with interactive charts, comprehensive analytics, and flexible export capabilities while maintaining the existing architectural patterns and design consistency.

## Architecture

### Current Architecture Analysis

The BudgetWise application follows the existing **Spring Boot + React** architecture pattern:

```
┌─────────────────────────────────────────────────────────────────┐
│                    EXISTING ARCHITECTURE                        │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   Frontend      │    Backend      │         Database            │
│   (React)       │  (Spring Boot)  │        (MySQL)              │
├─────────────────┼─────────────────┼─────────────────────────────┤
│ ✅ Auth Context │ ✅ Controllers  │ ✅ users                    │
│ ✅ Transactions │ ✅ Services     │ ✅ transactions             │
│ ✅ Budget UI    │ ✅ Repositories │ ✅ budgets                  │
│ ✅ Savings UI   │ ✅ JWT Security │ ✅ savings_goals            │
│ ⚠️ Export UI    │ ⚠️ Export Svc   │ ✅ categories               │
│ ❌ Charts       │ ❌ Analytics    │ ✅ All tables exist         │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

### What Needs to be Completed

**Frontend (React):**
- ❌ Interactive chart components for data visualization
- ⚠️ Complete export UI (partially exists)
- ❌ Analytics dashboard with financial insights
- ❌ Chart library integration (Chart.js or similar)

**Backend (Spring Boot):**
- ❌ Analytics service for data aggregation and calculations
- ⚠️ Complete export service (basic PDF/CSV exists, needs enhancement)
- ❌ Financial health scoring algorithms
- ❌ Trend analysis and statistical calculations

**Integration:**
- ❌ Chart data API endpoints
- ❌ Advanced analytics endpoints
- ❌ Enhanced export functionality

### Component Architecture (Building on Existing)

**Frontend Layer (React - following existing patterns):**
- **NEW**: Analytics Dashboard with chart components
- **ENHANCE**: Export interface (basic UI exists, needs completion)
- **NEW**: Chart library integration (Chart.js or Recharts)
- **NEW**: Real-time data updates for charts

**Backend Layer (Spring Boot - following existing patterns):**
- **NEW**: Analytics service (following TransactionService pattern)
- **ENHANCE**: Export service (basic ExportController exists, needs completion)
- **NEW**: Report generation with professional templates
- **NEW**: Statistical calculation engine for financial insights

**Data Layer (MySQL - using existing schema):**
- **EXISTING**: All required tables (users, transactions, budgets, savings_goals, categories)
- **NEW**: Calculated metrics and aggregations (computed in services)
- **NEW**: Temporary export file storage (file system based)

## Components and Interfaces

### Frontend Components

#### 1. Analytics Dashboard (`/src/components/Analytics/`)
```javascript
// AnalyticsDashboard.jsx - Main analytics container
// MonthlyTrendsChart.jsx - Monthly spending/income trends
// CategoryBreakdownChart.jsx - Pie chart for category analysis
// BudgetVsActualChart.jsx - Budget comparison visualization
// SavingsProgressChart.jsx - Goal progress tracking
// FinancialHealthScore.jsx - Health score display with recommendations
```

#### 2. Chart Library Integration
```javascript
// ChartWrapper.jsx - Unified chart component wrapper
// ResponsiveChart.jsx - Mobile-responsive chart container
// ChartTooltip.jsx - Custom tooltip component
// ChartLegend.jsx - Interactive legend component
```

#### 3. Export Interface (`/src/components/Export/`)
```javascript
// ExportDashboard.jsx - Export options and controls
// DateRangePicker.jsx - Date selection for exports
// FormatSelector.jsx - PDF/CSV/Excel format selection
// ExportProgress.jsx - Progress indicator during generation
// DownloadManager.jsx - File download handling
```

### Backend Services

#### 1. Analytics Service (`AnalyticsService.java`)
```java
public class AnalyticsService {
    // Monthly trend analysis
    public MonthlyTrendsDTO getMonthlyTrends(Long userId, int months);
    
    // Category breakdown calculations
    public CategoryAnalysisDTO getCategoryBreakdown(Long userId, LocalDate start, LocalDate end);
    
    // Budget vs actual analysis
    public BudgetAnalysisDTO getBudgetAnalysis(Long userId, int month, int year);
    
    // Financial health scoring
    public FinancialHealthDTO calculateFinancialHealth(Long userId);
    
    // Savings goal progress
    public SavingsProgressDTO getSavingsProgress(Long userId);
}
```

#### 2. Enhanced Export Service (`ExportService.java` - EXISTING, needs enhancement)
```java
// EXISTING: Basic PDF/CSV export functionality
// NEEDS: Enhanced features and better templates
public class ExportService {
    // EXISTING: Basic PDF export
    public byte[] exportTransactionsToPdf(String username, LocalDate start, LocalDate end);
    
    // EXISTING: Basic CSV export  
    public byte[] exportTransactionsToCsv(String username, LocalDate start, LocalDate end);
    
    // NEW: Enhanced PDF with charts and analytics
    public byte[] generateComprehensiveReport(String username, ExportRequest request);
    
    // NEW: Excel export with formatting
    public byte[] generateExcelReport(String username, ExportRequest request);
    
    // NEW: Budget and goals reports
    public byte[] generateBudgetReport(String username, int month, int year);
}
```

#### 3. Report Generation (`ReportGeneratorService.java`)
```java
public class ReportGeneratorService {
    // Financial summary reports
    public ReportData generateFinancialSummary(Long userId, DateRange range);
    
    // Budget performance reports
    public ReportData generateBudgetReport(Long userId, int month, int year);
    
    // Savings goal reports
    public ReportData generateGoalsReport(Long userId);
    
    // Transaction history reports
    public ReportData generateTransactionReport(Long userId, TransactionFilter filter);
}
```

### API Endpoints

#### Analytics Endpoints
```
GET /api/analytics/monthly-trends?months={months}
GET /api/analytics/category-breakdown?start={date}&end={date}
GET /api/analytics/budget-analysis?month={month}&year={year}
GET /api/analytics/financial-health
GET /api/analytics/savings-progress
GET /api/analytics/spending-patterns
```

#### Export Endpoints
```
POST /api/export/pdf - Generate PDF report
POST /api/export/csv - Generate CSV export
POST /api/export/excel - Generate Excel report
GET /api/export/templates - Get available report templates
POST /api/export/custom - Generate custom report
```

## Data Models

### Analytics DTOs

```java
// Monthly trends data structure
public class MonthlyTrendsDTO {
    private List<MonthlyDataPoint> dataPoints;
    private BigDecimal averageIncome;
    private BigDecimal averageExpenses;
    private BigDecimal trendDirection; // positive/negative growth
}

// Category analysis data structure
public class CategoryAnalysisDTO {
    private List<CategorySpending> categories;
    private String topSpendingCategory;
    private BigDecimal totalSpending;
    private Map<String, BigDecimal> monthlyComparison;
}

// Financial health scoring
public class FinancialHealthDTO {
    private Integer healthScore; // 0-100
    private Map<String, Integer> factorScores;
    private List<String> recommendations;
    private String healthTrend; // improving/declining/stable
}
```

### Export Request Models

```java
// Export configuration
public class ExportRequest {
    private ExportFormat format; // PDF, CSV, EXCEL
    private DateRange dateRange;
    private List<String> categories;
    private List<TransactionType> transactionTypes;
    private boolean includeCharts;
    private ReportTemplate template;
}

// Report template configuration
public class ReportTemplate {
    private String templateName;
    private List<ReportSection> sections;
    private Map<String, Object> customizations;
    private boolean includeLogo;
}
```

## Error Handling

### Frontend Error Handling
- Chart rendering fallbacks for missing data
- Export progress error recovery
- Network timeout handling for large exports
- User-friendly error messages with retry options

### Backend Error Handling
- Data validation for analytics requests
- Export generation failure recovery
- Memory management for large reports
- Graceful degradation for missing data

### Error Response Format
```json
{
  "error": "EXPORT_GENERATION_FAILED",
  "message": "Unable to generate PDF report",
  "details": "Insufficient data for the selected date range",
  "suggestions": ["Try a different date range", "Check if transactions exist"],
  "retryable": true
}
```

## Testing Strategy

### Frontend Testing
- Chart component rendering tests
- Export UI interaction tests
- Responsive design validation
- Cross-browser compatibility testing
- Mobile touch interaction testing

### Backend Testing
- Analytics calculation accuracy tests
- Export generation performance tests
- Large dataset handling tests
- Concurrent export request tests
- Data integrity validation tests

### Integration Testing
- End-to-end export workflow tests
- Chart data accuracy validation
- Real-time data update tests
- Error handling scenario tests

### Performance Testing
- Chart rendering performance with large datasets
- Export generation time optimization
- Memory usage during report generation
- Concurrent user analytics requests

## Implementation Approach

### Phase 1: Analytics Foundation (Days 1-2)
1. Implement analytics service with basic calculations
2. Create chart wrapper components
3. Build monthly trends visualization
4. Add category breakdown charts

### Phase 2: Advanced Analytics (Days 3-4)
1. Implement budget vs actual analysis
2. Create savings progress visualization
3. Build financial health scoring
4. Add interactive chart features

### Phase 3: Export Foundation (Days 5-6)
1. Implement basic PDF export service
2. Create CSV export functionality
3. Build export UI components
4. Add progress tracking

### Phase 4: Advanced Export Features (Days 7-8)
1. Implement Excel export with charts
2. Create custom report templates
3. Add export customization options
4. Implement download management

### Phase 5: Integration & Polish (Days 9-10)
1. Integrate analytics with existing pages
2. Add export options throughout the app
3. Implement responsive design improvements
4. Add error handling and validation

## Security Considerations

### Data Access Control
- User-specific analytics data isolation
- Export permission validation
- Secure file generation and cleanup
- Rate limiting for export requests

### File Security
- Temporary file cleanup after download
- Secure file storage during generation
- Export audit logging
- File size limitations

## Performance Optimization

### Frontend Optimization
- Chart data virtualization for large datasets
- Lazy loading of chart components
- Efficient re-rendering strategies
- Memory management for chart instances

### Backend Optimization
- Database query optimization for analytics
- Caching of frequently requested calculations
- Asynchronous export generation
- Connection pooling for concurrent requests

### Caching Strategy
- Analytics data caching (5-minute TTL)
- Chart configuration caching
- Export template caching
- User preference caching