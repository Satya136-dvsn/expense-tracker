package com.budgettracker.service;
import com.budgettracker.dto.TransactionRequest;
import com.budgettracker.dto.TransactionResponse;
import com.budgettracker.model.Transaction;
import com.budgettracker.model.User;
import com.budgettracker.repository.TransactionRepository;
import com.budgettracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.ArrayList;
import java.util.HashMap;

@Service
@Transactional
public class TransactionService {
    
    @Autowired
    private TransactionRepository transactionRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    // Create new transaction
        public TransactionResponse createTransaction(TransactionRequest request, String username) {
        // Validate user exists
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        // Validate required fields
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Transaction title is required");
        }
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Transaction amount must be greater than zero");
        }
        if (request.getType() == null) {
            throw new IllegalArgumentException("Transaction type is required");
        }
        if (request.getCategory() == null || request.getCategory().trim().isEmpty()) {
            throw new IllegalArgumentException("Transaction category is required");
        }
        if (request.getTransactionDate() == null) {
            throw new IllegalArgumentException("Transaction date is required");
        }
        
        try {
            Transaction transaction = new Transaction();
            transaction.setUser(user);
            transaction.setTitle(request.getTitle().trim());
            transaction.setType(request.getType());
            transaction.setCategory(request.getCategory().trim());
            transaction.setAmount(request.getAmount());
            transaction.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
            transaction.setTransactionDate(request.getTransactionDate());
            
            Transaction savedTransaction = transactionRepository.save(transaction);
            return new TransactionResponse(savedTransaction);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create transaction: " + e.getMessage(), e);
        }
    }
    
    // Get all transactions for user
        public List<TransactionResponse> getUserTransactions(String username) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Transaction> transactions = transactionRepository.findByUserOrderByTransactionDateDesc(user);
        return transactions.stream()
                .map(TransactionResponse::new)
                .collect(Collectors.toList());
    }
    
    // Get transaction by ID
        public Optional<TransactionResponse> getTransactionById(Long id, String username) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return transactionRepository.findById(id)
                .filter(transaction -> transaction.getUser().getId().equals(user.getId()))
                .map(TransactionResponse::new);
    }
    
    // Update transaction
        public TransactionResponse updateTransaction(Long id, TransactionRequest request, String username) {
        // Validate user exists
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        // Validate transaction exists and belongs to user
        Transaction transaction = transactionRepository.findById(id)
                .filter(t -> t.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Transaction not found or access denied for ID: " + id));
        
        // Validate required fields
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Transaction title is required");
        }
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Transaction amount must be greater than zero");
        }
        if (request.getType() == null) {
            throw new IllegalArgumentException("Transaction type is required");
        }
        if (request.getCategory() == null || request.getCategory().trim().isEmpty()) {
            throw new IllegalArgumentException("Transaction category is required");
        }
        if (request.getTransactionDate() == null) {
            throw new IllegalArgumentException("Transaction date is required");
        }
        
        try {
            transaction.setTitle(request.getTitle().trim());
            transaction.setType(request.getType());
            transaction.setCategory(request.getCategory().trim());
            transaction.setAmount(request.getAmount());
            transaction.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
            transaction.setTransactionDate(request.getTransactionDate());
            
            Transaction updatedTransaction = transactionRepository.save(transaction);
            return new TransactionResponse(updatedTransaction);
        } catch (Exception e) {
            throw new RuntimeException("Failed to update transaction: " + e.getMessage(), e);
        }
    }
    
    // Delete transaction
        public void deleteTransaction(Long id, String username) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Transaction transaction = transactionRepository.findById(id)
                .filter(t -> t.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Transaction not found or access denied"));
        
        transactionRepository.delete(transaction);
    }
    
    // Get transactions by type
        public List<TransactionResponse> getTransactionsByType(String type, String username) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Transaction.TransactionType transactionType = Transaction.TransactionType.valueOf(type);
        List<Transaction> transactions = transactionRepository.findByUserAndTypeOrderByTransactionDateDesc(user, transactionType);
        
        return transactions.stream()
                .map(TransactionResponse::new)
                .collect(Collectors.toList());
    }
    
    // Get transactions by category
        public List<TransactionResponse> getTransactionsByCategory(String category, String username) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Transaction> transactions = transactionRepository.findByUserAndCategoryOrderByTransactionDateDesc(user, category);
        return transactions.stream()
                .map(TransactionResponse::new)
                .collect(Collectors.toList());
    }
    
    // Get transactions within date range
        public List<TransactionResponse> getTransactionsByDateRange(LocalDateTime startDate, LocalDateTime endDate, String username) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Transaction> transactions = transactionRepository.findByUserAndTransactionDateBetweenOrderByTransactionDateDesc(
                user, startDate, endDate);
        
        return transactions.stream()
                .map(TransactionResponse::new)
                .collect(Collectors.toList());
    }
    
    // Get financial summary
        public Map<String, Object> getFinancialSummary(String username) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Map<String, Object> summary = new HashMap<>();
        
        BigDecimal totalIncome = transactionRepository.calculateTotalIncome(user);
        BigDecimal totalExpenses = transactionRepository.calculateTotalExpenses(user);
        BigDecimal balance = totalIncome.subtract(totalExpenses);
        
        summary.put("totalIncome", totalIncome);
        summary.put("totalExpenses", totalExpenses);
        summary.put("balance", balance);
        summary.put("transactionCount", transactionRepository.countByUser(user));
        
        return summary;
    }
    
    // Get monthly financial summary
        public Map<String, Object> getMonthlyFinancialSummary(int year, int month, String username) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));
        
        LocalDateTime startDate = LocalDateTime.of(year, month, 1, 0, 0);
        LocalDateTime endDate = startDate.plusMonths(1).minusSeconds(1);
        
        Map<String, Object> summary = new HashMap<>();
        
        BigDecimal monthlyIncome = transactionRepository.calculateTotalIncomeInPeriod(user, startDate, endDate);
        BigDecimal monthlyExpenses = transactionRepository.calculateTotalExpensesInPeriod(user, startDate, endDate);
        BigDecimal monthlyBalance = monthlyIncome.subtract(monthlyExpenses);
        
        summary.put("month", month);
        summary.put("year", year);
        summary.put("totalIncome", monthlyIncome);
        summary.put("totalExpenses", monthlyExpenses);
        summary.put("balance", monthlyBalance);
        
        return summary;
    }
    
    // Get expense breakdown by category
        public List<Map<String, Object>> getExpenseBreakdown(String username) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Object[]> breakdown = transactionRepository.getExpenseBreakdownByCategory(user);
        
        return breakdown.stream()
                .map(row -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("category", row[0]);
                    item.put("amount", row[1]);
                    return item;
                })
                .collect(Collectors.toList());
    }
    
    // Get income breakdown by category
        public List<Map<String, Object>> getIncomeBreakdown(String username) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Object[]> breakdown = transactionRepository.getIncomeBreakdownByCategory(user);
        
        return breakdown.stream()
                .map(row -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("category", row[0]);
                    item.put("amount", row[1]);
                    return item;
                })
                .collect(Collectors.toList());
    }
    
    // Get recent transactions (last N transactions)
        public List<TransactionResponse> getRecentTransactions(int limit, String username) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Transaction> transactions = transactionRepository.findRecentTransactions(user, limit);
        return transactions.stream()
                .map(TransactionResponse::new)
                .collect(Collectors.toList());
    }
    
    // Get transaction statistics
        public Map<String, Object> getTransactionStatistics(String username) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Map<String, Object> stats = new HashMap<>();
        
        long totalTransactions = transactionRepository.countByUser(user);
        long incomeTransactions = transactionRepository.countByUserAndType(user, Transaction.TransactionType.INCOME);
        long expenseTransactions = transactionRepository.countByUserAndType(user, Transaction.TransactionType.EXPENSE);
        
        stats.put("totalTransactions", totalTransactions);
        stats.put("incomeTransactions", incomeTransactions);
        stats.put("expenseTransactions", expenseTransactions);
        
        if (totalTransactions > 0) {
            stats.put("incomePercentage", (incomeTransactions * 100.0) / totalTransactions);
            stats.put("expensePercentage", (expenseTransactions * 100.0) / totalTransactions);
        } else {
            stats.put("incomePercentage", 0.0);
            stats.put("expensePercentage", 0.0);
        }
        
        return stats;
    }
    
    // ===== NEW ANALYTICS METHODS FOR MILESTONE 4 =====
    
    // Get monthly trends analysis
    public List<Map<String, Object>> getMonthlyTrends(int months, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusMonths(months);
        
        List<Object[]> monthlyData = transactionRepository.getMonthlyTrendData(user, startDate, endDate);
        
        return monthlyData.stream()
                .map(row -> {
                    Map<String, Object> monthData = new HashMap<>();
                    monthData.put("year", row[0]);
                    monthData.put("month", row[1]);
                    monthData.put("totalIncome", row[2] != null ? row[2] : BigDecimal.ZERO);
                    monthData.put("totalExpenses", row[3] != null ? row[3] : BigDecimal.ZERO);
                    monthData.put("netSavings", 
                        ((BigDecimal) (row[2] != null ? row[2] : BigDecimal.ZERO))
                        .subtract((BigDecimal) (row[3] != null ? row[3] : BigDecimal.ZERO)));
                    monthData.put("transactionCount", row[4] != null ? row[4] : 0L);
                    return monthData;
                })
                .collect(Collectors.toList());
    }
    
    // Get category trends over time
    public List<Map<String, Object>> getCategoryTrends(int months, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusMonths(months);
        
        List<Object[]> categoryTrendData = transactionRepository.getCategoryTrendData(user, startDate, endDate);
        
        return categoryTrendData.stream()
                .map(row -> {
                    Map<String, Object> trendData = new HashMap<>();
                    trendData.put("category", row[0]);
                    trendData.put("year", row[1]);
                    trendData.put("month", row[2]);
                    trendData.put("amount", row[3] != null ? row[3] : BigDecimal.ZERO);
                    trendData.put("transactionCount", row[4] != null ? row[4] : 0L);
                    return trendData;
                })
                .collect(Collectors.toList());
    }
    
    // Get spending patterns analysis
    public Map<String, Object> getSpendingPatterns(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        Map<String, Object> patterns = new HashMap<>();
        
        // Get average transaction amounts by category
        List<Object[]> avgByCategory = transactionRepository.getAverageAmountByCategory(user);
        List<Map<String, Object>> categoryAverages = avgByCategory.stream()
                .map(row -> {
                    Map<String, Object> avg = new HashMap<>();
                    avg.put("category", row[0]);
                    avg.put("averageAmount", row[1]);
                    avg.put("transactionCount", row[2]);
                    return avg;
                })
                .collect(Collectors.toList());
        
        // Get spending by day of week
        List<Object[]> dayOfWeekData = transactionRepository.getSpendingByDayOfWeek(user);
        List<Map<String, Object>> dayOfWeekSpending = dayOfWeekData.stream()
                .map(row -> {
                    Map<String, Object> dayData = new HashMap<>();
                    dayData.put("dayOfWeek", row[0]);
                    dayData.put("totalAmount", row[1]);
                    dayData.put("transactionCount", row[2]);
                    return dayData;
                })
                .collect(Collectors.toList());
        
        patterns.put("categoryAverages", categoryAverages);
        patterns.put("dayOfWeekSpending", dayOfWeekSpending);
        
        return patterns;
    }
    
    // Get comparative analysis (current vs previous period)
    public Map<String, Object> getComparativeAnalysis(String period, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime currentPeriodStart, currentPeriodEnd, previousPeriodStart, previousPeriodEnd;
        
        switch (period.toLowerCase()) {
            case "week":
                currentPeriodStart = now.minusWeeks(1);
                currentPeriodEnd = now;
                previousPeriodStart = now.minusWeeks(2);
                previousPeriodEnd = now.minusWeeks(1);
                break;
            case "year":
                currentPeriodStart = now.minusYears(1);
                currentPeriodEnd = now;
                previousPeriodStart = now.minusYears(2);
                previousPeriodEnd = now.minusYears(1);
                break;
            default: // month
                currentPeriodStart = now.minusMonths(1);
                currentPeriodEnd = now;
                previousPeriodStart = now.minusMonths(2);
                previousPeriodEnd = now.minusMonths(1);
                break;
        }
        
        // Get current period data
        BigDecimal currentIncome = transactionRepository.calculateTotalIncomeInPeriod(user, currentPeriodStart, currentPeriodEnd);
        BigDecimal currentExpenses = transactionRepository.calculateTotalExpensesInPeriod(user, currentPeriodStart, currentPeriodEnd);
        
        // Get previous period data
        BigDecimal previousIncome = transactionRepository.calculateTotalIncomeInPeriod(user, previousPeriodStart, previousPeriodEnd);
        BigDecimal previousExpenses = transactionRepository.calculateTotalExpensesInPeriod(user, previousPeriodStart, previousPeriodEnd);
        
        Map<String, Object> comparison = new HashMap<>();
        comparison.put("period", period);
        comparison.put("currentPeriod", Map.of(
            "income", currentIncome,
            "expenses", currentExpenses,
            "savings", currentIncome.subtract(currentExpenses)
        ));
        comparison.put("previousPeriod", Map.of(
            "income", previousIncome,
            "expenses", previousExpenses,
            "savings", previousIncome.subtract(previousExpenses)
        ));
        
        // Calculate percentage changes
        if (previousIncome.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal incomeChange = currentIncome.subtract(previousIncome)
                    .divide(previousIncome, 4, java.math.RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
            comparison.put("incomeChangePercent", incomeChange);
        } else {
            comparison.put("incomeChangePercent", BigDecimal.ZERO);
        }
        
        if (previousExpenses.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal expenseChange = currentExpenses.subtract(previousExpenses)
                    .divide(previousExpenses, 4, java.math.RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
            comparison.put("expenseChangePercent", expenseChange);
        } else {
            comparison.put("expenseChangePercent", BigDecimal.ZERO);
        }
        
        return comparison;
    }
    
    // Get financial insights and recommendations
    public Map<String, Object> getFinancialInsights(String username) {
        try {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));
            
            Map<String, Object> insights = new HashMap<>();
            List<String> recommendations = new ArrayList<>();
            
            // Get recent financial data
            LocalDateTime threeMonthsAgo = LocalDateTime.now().minusMonths(3);
            BigDecimal recentIncome = transactionRepository.calculateTotalIncomeInPeriod(user, threeMonthsAgo, LocalDateTime.now());
            BigDecimal recentExpenses = transactionRepository.calculateTotalExpensesInPeriod(user, threeMonthsAgo, LocalDateTime.now());
            
            // Ensure values are not null
            if (recentIncome == null) recentIncome = BigDecimal.ZERO;
            if (recentExpenses == null) recentExpenses = BigDecimal.ZERO;
            
            // Calculate savings rate
            BigDecimal savingsRate = BigDecimal.ZERO;
            if (recentIncome.compareTo(BigDecimal.ZERO) > 0) {
                try {
                    savingsRate = recentIncome.subtract(recentExpenses)
                            .divide(recentIncome, 4, java.math.RoundingMode.HALF_UP)
                            .multiply(new BigDecimal("100"));
                } catch (ArithmeticException e) {
                    savingsRate = BigDecimal.ZERO;
                }
            }
            
            // Generate basic recommendations
            if (recentIncome.compareTo(BigDecimal.ZERO) == 0) {
                recommendations.add("Start tracking your income to get personalized financial insights.");
            } else if (recentExpenses.compareTo(BigDecimal.ZERO) == 0) {
                recommendations.add("Start tracking your expenses to get detailed spending analysis.");
            } else {
                // Savings rate recommendations
                if (savingsRate.compareTo(new BigDecimal("20")) < 0) {
                    recommendations.add("Your savings rate is " + savingsRate.intValue() + 
                        "%. Financial experts recommend saving at least 20% of your income.");
                } else {
                    recommendations.add("Great job! Your savings rate of " + savingsRate.intValue() + 
                        "% meets the recommended 20% target.");
                }
            }
            
            insights.put("savingsRate", savingsRate);
            insights.put("recommendations", recommendations);
            insights.put("totalIncome", recentIncome);
            insights.put("totalExpenses", recentExpenses);
            insights.put("netSavings", recentIncome.subtract(recentExpenses));
            
            return insights;
        } catch (Exception e) {
            // Return basic insights if there's an error
            Map<String, Object> basicInsights = new HashMap<>();
            basicInsights.put("savingsRate", BigDecimal.ZERO);
            basicInsights.put("recommendations", List.of("Unable to calculate insights. Please ensure you have transaction data."));
            basicInsights.put("totalIncome", BigDecimal.ZERO);
            basicInsights.put("totalExpenses", BigDecimal.ZERO);
            basicInsights.put("netSavings", BigDecimal.ZERO);
            basicInsights.put("error", e.getMessage());
            return basicInsights;
        }
    }

    // Sync user profile with transaction totals
    public Map<String, Object> syncUserProfileWithTransactions(String username) {
        try {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));
            // Calculate totals from transactions
            BigDecimal totalIncome = transactionRepository.calculateTotalIncome(user);
            BigDecimal totalExpenses = transactionRepository.calculateTotalExpenses(user);
            // Ensure values are not null
            if (totalIncome == null) totalIncome = BigDecimal.ZERO;
            if (totalExpenses == null) totalExpenses = BigDecimal.ZERO;
            // Update user profile with calculated totals
            user.setMonthlyIncome(totalIncome);
            user.setTargetExpenses(totalExpenses);
            user.setCurrentSavings(totalIncome.subtract(totalExpenses));
            userRepository.save(user);
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Profile synced with transaction totals");
            result.put("totalIncome", totalIncome);
            result.put("totalExpenses", totalExpenses);
            result.put("currentSavings", totalIncome.subtract(totalExpenses));
            return result;
        } catch (Exception e) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "Failed to sync profile: " + e.getMessage());
            return result;
        }
    }
}