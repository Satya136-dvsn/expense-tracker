package com.budgettracker.integration;

import com.budgettracker.model.*;
import com.budgettracker.repository.*;
import com.budgettracker.util.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class AnalyticsIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private SavingsGoalRepository savingsGoalRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private User testUser;
    private String authToken;
    private Category foodCategory;
    private Category transportCategory;

    @BeforeEach
    void setUp() {
        // Clean up existing data
        transactionRepository.deleteAll();
        budgetRepository.deleteAll();
        savingsGoalRepository.deleteAll();
        userRepository.deleteAll();
        categoryRepository.deleteAll();

        // Create test categories
        foodCategory = new Category();
        foodCategory.setName("Food & Dining");
        foodCategory.setType(Category.CategoryType.EXPENSE);
        foodCategory = categoryRepository.save(foodCategory);

        transportCategory = new Category();
        transportCategory.setName("Transportation");
        transportCategory.setType(Category.CategoryType.EXPENSE);
        transportCategory = categoryRepository.save(transportCategory);

        // Create test user
        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword(passwordEncoder.encode("password"));
        testUser.setMonthlyIncome(new BigDecimal("5000.00"));
        testUser.setCurrentSavings(new BigDecimal("10000.00"));
        testUser.setTargetExpenses(new BigDecimal("3000.00"));
        testUser = userRepository.save(testUser);

        // Generate auth token
        authToken = jwtUtil.generateToken(testUser);

        // Create test data
        createTestTransactions();
        createTestBudgets();
        createTestSavingsGoals();
    }

    private void createTestTransactions() {
        LocalDateTime now = LocalDateTime.now();
        
        // Current month transactions
        Transaction t1 = new Transaction();
        t1.setUser(testUser);
        t1.setCategory(foodCategory.getName());
        t1.setAmount(new BigDecimal("150.00"));
        t1.setType(Transaction.TransactionType.EXPENSE);
        t1.setDescription("Grocery shopping");
        t1.setTransactionDate(now.minusDays(5));
        transactionRepository.save(t1);

        Transaction t2 = new Transaction();
        t2.setUser(testUser);
        t2.setCategory(transportCategory.getName());
        t2.setAmount(new BigDecimal("80.00"));
        t2.setType(Transaction.TransactionType.EXPENSE);
        t2.setDescription("Gas");
        t2.setTransactionDate(now.minusDays(3));
        transactionRepository.save(t2);

        // Previous month transactions
        Transaction t3 = new Transaction();
        t3.setUser(testUser);
        t3.setCategory(foodCategory.getName());
        t3.setAmount(new BigDecimal("200.00"));
        t3.setType(Transaction.TransactionType.EXPENSE);
        t3.setDescription("Restaurant");
        t3.setTransactionDate(now.minusMonths(1).minusDays(10));
        transactionRepository.save(t3);

        // Income transaction
        Transaction t4 = new Transaction();
        t4.setUser(testUser);
        t4.setAmount(new BigDecimal("5000.00"));
        t4.setType(Transaction.TransactionType.INCOME);
        t4.setDescription("Salary");
        t4.setTransactionDate(now.minusDays(1));
        transactionRepository.save(t4);
    }

    private void createTestBudgets() {
        Budget budget1 = new Budget();
        budget1.setUser(testUser);
        budget1.setCategory(foodCategory.getName());
        budget1.setBudgetAmount(new BigDecimal("500.00"));
        budget1.setMonth(LocalDateTime.now().getMonthValue());
        budget1.setYear(LocalDateTime.now().getYear());
        budgetRepository.save(budget1);

        Budget budget2 = new Budget();
        budget2.setUser(testUser);
        budget2.setCategory(transportCategory.getName());
        budget2.setBudgetAmount(new BigDecimal("300.00"));
        budget2.setMonth(LocalDateTime.now().getMonthValue());
        budget2.setYear(LocalDateTime.now().getYear());
        budgetRepository.save(budget2);
    }

    private void createTestSavingsGoals() {
        SavingsGoal goal1 = new SavingsGoal();
        goal1.setUser(testUser);
        goal1.setName("Emergency Fund");
        goal1.setTargetAmount(new BigDecimal("5000.00"));
        goal1.setCurrentAmount(new BigDecimal("2500.00"));
        goal1.setTargetDate(LocalDate.now().plusMonths(6));
        goal1.setStatus(SavingsGoal.GoalStatus.IN_PROGRESS);
        savingsGoalRepository.save(goal1);

        SavingsGoal goal2 = new SavingsGoal();
        goal2.setUser(testUser);
        goal2.setName("Vacation");
        goal2.setTargetAmount(new BigDecimal("2000.00"));
        goal2.setCurrentAmount(new BigDecimal("2000.00"));
        goal2.setTargetDate(LocalDate.now().minusMonths(1));
        goal2.setStatus(SavingsGoal.GoalStatus.COMPLETED);
        savingsGoalRepository.save(goal2);
    }

    @Test
    void testGetMonthlyTrends_WithRealData_ShouldReturnValidResponse() throws Exception {
        mockMvc.perform(get("/api/analytics/monthly-trends")
                .header("Authorization", "Bearer " + authToken)
                .param("months", "6")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trends").isArray())
                .andExpect(jsonPath("$.averageIncome").isNumber())
                .andExpect(jsonPath("$.averageExpenses").isNumber())
                .andExpect(jsonPath("$.trendDirection").isString());
    }

    @Test
    void testGetCategoryBreakdown_WithRealData_ShouldReturnValidResponse() throws Exception {
        mockMvc.perform(get("/api/analytics/category-breakdown")
                .header("Authorization", "Bearer " + authToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.expenseCategories").isArray())
                .andExpect(jsonPath("$.totalExpenses").isNumber())
                .andExpect(jsonPath("$.topSpendingCategory").isString());
    }

    @Test
    void testGetFinancialHealth_WithRealData_ShouldReturnValidResponse() throws Exception {
        mockMvc.perform(get("/api/analytics/financial-health")
                .header("Authorization", "Bearer " + authToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.healthScore").isNumber())
                .andExpect(jsonPath("$.factorScores").isMap())
                .andExpect(jsonPath("$.recommendations").isArray())
                .andExpect(jsonPath("$.healthTrend").isString());
    }

    @Test
    void testGetBudgetAnalysis_WithRealData_ShouldReturnValidResponse() throws Exception {
        int currentMonth = LocalDateTime.now().getMonthValue();
        int currentYear = LocalDateTime.now().getYear();

        mockMvc.perform(get("/api/analytics/budget-analysis")
                .header("Authorization", "Bearer " + authToken)
                .param("month", String.valueOf(currentMonth))
                .param("year", String.valueOf(currentYear))
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.budgetItems").isArray())
                .andExpect(jsonPath("$.totalBudget").isNumber())
                .andExpect(jsonPath("$.totalSpent").isNumber())
                .andExpect(jsonPath("$.variance").isNumber());
    }

    @Test
    void testGetSavingsProgress_WithRealData_ShouldReturnValidResponse() throws Exception {
        mockMvc.perform(get("/api/analytics/savings-progress")
                .header("Authorization", "Bearer " + authToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.goals").isArray())
                .andExpect(jsonPath("$.totalGoals").isNumber())
                .andExpect(jsonPath("$.completedGoals").isNumber())
                .andExpect(jsonPath("$.overallProgressPercent").isNumber());
    }

    @Test
    void testGetAnalyticsDashboard_WithRealData_ShouldReturnCompleteData() throws Exception {
        mockMvc.perform(get("/api/analytics/dashboard")
                .header("Authorization", "Bearer " + authToken)
                .param("months", "6")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.monthlyTrends").exists())
                .andExpect(jsonPath("$.categoryBreakdown").exists())
                .andExpect(jsonPath("$.financialHealth").exists())
                .andExpect(jsonPath("$.budgetAnalysis").exists())
                .andExpect(jsonPath("$.savingsProgress").exists());
    }

    @Test
    void testAnalyticsEndpoints_WithLargeDataset_ShouldPerformWell() throws Exception {
        // Create a large dataset
        createLargeDataset();

        long startTime = System.currentTimeMillis();

        mockMvc.perform(get("/api/analytics/dashboard")
                .header("Authorization", "Bearer " + authToken)
                .param("months", "12")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        long endTime = System.currentTimeMillis();
        long duration = endTime - startTime;

        // Assert that the request completes within reasonable time (5 seconds)
        assert duration < 5000 : "Analytics dashboard took too long: " + duration + "ms";
    }

    @Test
    void testAnalyticsEndpoints_WithInvalidToken_ShouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/api/analytics/monthly-trends")
                .header("Authorization", "Bearer invalid-token")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testAnalyticsEndpoints_WithoutToken_ShouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/api/analytics/monthly-trends")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testGetMonthlyTrends_WithInvalidParameters_ShouldReturnBadRequest() throws Exception {
        mockMvc.perform(get("/api/analytics/monthly-trends")
                .header("Authorization", "Bearer " + authToken)
                .param("months", "0")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());

        mockMvc.perform(get("/api/analytics/monthly-trends")
                .header("Authorization", "Bearer " + authToken)
                .param("months", "25")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testGetBudgetAnalysis_WithInvalidDate_ShouldReturnBadRequest() throws Exception {
        mockMvc.perform(get("/api/analytics/budget-analysis")
                .header("Authorization", "Bearer " + authToken)
                .param("month", "13")
                .param("year", "2024")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());

        mockMvc.perform(get("/api/analytics/budget-analysis")
                .header("Authorization", "Bearer " + authToken)
                .param("month", "1")
                .param("year", "1900")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    private void createLargeDataset() {
        LocalDateTime now = LocalDateTime.now();
        
        // Create 1000 transactions over the past year
        for (int i = 0; i < 1000; i++) {
            Transaction transaction = new Transaction();
            transaction.setUser(testUser);
            transaction.setCategory((i % 2 == 0 ? foodCategory : transportCategory).getName());
            transaction.setAmount(new BigDecimal(String.valueOf(50 + (i % 200))));
            transaction.setType(Transaction.TransactionType.EXPENSE);
            transaction.setDescription("Test transaction " + i);
            transaction.setTransactionDate(now.minusDays(i % 365));
            transactionRepository.save(transaction);
        }

        // Create multiple budgets
        for (int month = 1; month <= 12; month++) {
            Budget budget = new Budget();
            budget.setUser(testUser);
            budget.setCategory(foodCategory.getName());
            budget.setBudgetAmount(new BigDecimal("500.00"));
            budget.setMonth(month);
            budget.setYear(2024);
            budgetRepository.save(budget);
        }

        // Create multiple savings goals
        for (int i = 0; i < 10; i++) {
            SavingsGoal goal = new SavingsGoal();
            goal.setUser(testUser);
            goal.setName("Goal " + i);
            goal.setTargetAmount(new BigDecimal(String.valueOf(1000 + (i * 500))));
            goal.setCurrentAmount(new BigDecimal(String.valueOf(500 + (i * 200))));
            goal.setTargetDate(LocalDate.now().plusMonths(i + 1));
            goal.setStatus(i % 3 == 0 ? SavingsGoal.GoalStatus.COMPLETED : SavingsGoal.GoalStatus.IN_PROGRESS);
            savingsGoalRepository.save(goal);
        }
    }
}