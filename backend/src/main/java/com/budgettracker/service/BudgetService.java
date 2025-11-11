package com.budgettracker.service;

import com.budgettracker.dto.BudgetRequest;
import com.budgettracker.dto.BudgetResponse;
import com.budgettracker.model.Budget;
import com.budgettracker.model.Transaction;
import com.budgettracker.model.User;
import com.budgettracker.repository.BudgetRepository;
import com.budgettracker.repository.TransactionRepository;
import com.budgettracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class BudgetService {
    
    @Autowired
    private BudgetRepository budgetRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TransactionRepository transactionRepository;
    
    // Create new budget
    public BudgetResponse createBudget(BudgetRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if budget already exists for this category, month, and year
        Optional<Budget> existing = budgetRepository.findByUserAndCategoryAndMonthAndYear(
                user, request.getCategory(), request.getMonth(), request.getYear());
        
        if (existing.isPresent()) {
            throw new RuntimeException("Budget already exists for " + request.getCategory() + 
                    " in " + getMonthName(request.getMonth()) + " " + request.getYear());
        }
        
        Budget budget = new Budget(user, request.getCategory(), request.getBudgetAmount(), 
                request.getMonth(), request.getYear());
        
        // Calculate spent amount from transactions
        budget.setSpentAmount(calculateSpentAmount(user, request.getCategory(), 
                request.getMonth(), request.getYear()));
        
        Budget savedBudget = budgetRepository.save(budget);
        return new BudgetResponse(savedBudget);
    }
    
    // Get all budgets for user
    public List<BudgetResponse> getUserBudgets(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Budget> budgets = budgetRepository.findByUserOrderByYearDescMonthDescCategoryAsc(user);
        return budgets.stream()
                .map(BudgetResponse::new)
                .collect(Collectors.toList());
    }
    
    // Get budgets for specific month and year
    public List<BudgetResponse> getBudgetsForMonth(Integer month, Integer year, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Budget> budgets = budgetRepository.findByUserAndMonthAndYearOrderByCategoryAsc(user, month, year);
        
        // Update spent amounts before returning
        budgets.forEach(budget -> {
            BigDecimal spent = calculateSpentAmount(user, budget.getCategory(), month, year);
            budget.setSpentAmount(spent);
            budgetRepository.save(budget);
        });
        
        return budgets.stream()
                .map(BudgetResponse::new)
                .collect(Collectors.toList());
    }
    
    // Get budget by ID
    public Optional<BudgetResponse> getBudgetById(Long id, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return budgetRepository.findById(id)
                .filter(budget -> budget.getUser().getId().equals(user.getId()))
                .map(budget -> {
                    // Update spent amount before returning
                    BigDecimal spent = calculateSpentAmount(user, budget.getCategory(), 
                            budget.getMonth(), budget.getYear());
                    budget.setSpentAmount(spent);
                    budgetRepository.save(budget);
                    return new BudgetResponse(budget);
                });
    }
    
    // Update budget
    public BudgetResponse updateBudget(Long id, BudgetRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Budget budget = budgetRepository.findById(id)
                .filter(b -> b.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Budget not found"));
        
        // Check if updating to a category/month/year that already has a budget
        if (!budget.getCategory().equals(request.getCategory()) ||
            !budget.getMonth().equals(request.getMonth()) ||
            !budget.getYear().equals(request.getYear())) {
            
            Optional<Budget> existing = budgetRepository.findByUserAndCategoryAndMonthAndYear(
                    user, request.getCategory(), request.getMonth(), request.getYear());
            
            if (existing.isPresent() && !existing.get().getId().equals(id)) {
                throw new RuntimeException("Budget already exists for " + request.getCategory() + 
                        " in " + getMonthName(request.getMonth()) + " " + request.getYear());
            }
        }
        
        budget.setCategory(request.getCategory());
        budget.setBudgetAmount(request.getBudgetAmount());
        budget.setMonth(request.getMonth());
        budget.setYear(request.getYear());
        
        // Recalculate spent amount
        budget.setSpentAmount(calculateSpentAmount(user, request.getCategory(), 
                request.getMonth(), request.getYear()));
        
        Budget updatedBudget = budgetRepository.save(budget);
        return new BudgetResponse(updatedBudget);
    }
    
    // Delete budget
    public void deleteBudget(Long id, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Budget budget = budgetRepository.findById(id)
                .filter(b -> b.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Budget not found"));
        
        budgetRepository.delete(budget);
    }
    
    // Get current month budgets
    public List<BudgetResponse> getCurrentMonthBudgets(String username) {
        YearMonth currentYearMonth = YearMonth.now();
        return getBudgetsForMonth(currentYearMonth.getMonthValue(), currentYearMonth.getYear(), username);
    }
    
    // Recalculate all budget spent amounts (useful after transaction changes)
    public void recalculateAllBudgets(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Budget> budgets = budgetRepository.findByUserOrderByYearDescMonthDescCategoryAsc(user);
        
        budgets.forEach(budget -> {
            BigDecimal spent = calculateSpentAmount(user, budget.getCategory(), 
                    budget.getMonth(), budget.getYear());
            budget.setSpentAmount(spent);
            budgetRepository.save(budget);
        });
    }
    
    // Helper method to calculate spent amount from transactions
    private BigDecimal calculateSpentAmount(User user, String category, Integer month, Integer year) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDateTime startDate = yearMonth.atDay(1).atStartOfDay();
        LocalDateTime endDate = yearMonth.atEndOfMonth().atTime(23, 59, 59);
        
        List<Transaction> transactions = transactionRepository
                .findByUserAndTypeAndTransactionDateBetweenOrderByTransactionDateDesc(
                        user, Transaction.TransactionType.EXPENSE, startDate, endDate);
        
        return transactions.stream()
                .filter(t -> t.getCategory().equals(category))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    // Helper method to get month name
    private String getMonthName(Integer month) {
        String[] months = {"", "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"};
        return months[month];
    }
}
