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
import java.time.LocalDateTime;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Comprehensive system integration tests for BudgetWise completion features.
 * Tests analytics, export functionality, authentication integration, and performance.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class ComprehensiveSystemIntegrationTest {

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
    private Category[] categories;

    @BeforeEach
    void setUp() {
        // Clean up existing data
        transactionRepository.deleteAll();
        budgetRepository.deleteAll();
        savingsGoalRepository.deleteAll();
        userRepository.deleteAll();
        categoryRepository.deleteAll();

        // Create test categories
        categories = new Category[5];
        String[] categoryNames = {"Food & Dining", "Transportation", "Entertainment", "Utilities", "Healthcare"};
        for (int i = 0; i < categoryNames.length; i++) {
            categories[i] = new Category();
            categories[i].setName(categoryNames[i]);
            categories[i].setType(Category.CategoryType.EXPENSE);
            categories[i] = categoryRepository.save(categories[i]);
        }

        // Create test user with realistic financial profile
        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword(passwordEncoder.encode("password"));
        testUser.setMonthlyIncome(new BigDecimal("5000.00"));
        testUser.setCurrentSavings(new BigDecimal("15000.00"));
        testUser.setTargetExpenses(new BigDecimal("3500.00"));
        testUser = userRepository.save(testUser);

        // Generate auth token
        authToken = jwtUtil.generateToken(testUser);

        // Create comprehensive test data
        createRealisticTestData();
    }

    private void createRealisticTestData() {
        LocalDateTime now = LocalDateTime.now();
        
        // Create 12 months of transaction history
        for (int month = 0; month < 12; month++) {
            LocalDateTime monthDate = now.minusMonths(month);
            
            // Monthly income
            Transaction income = new Transaction();
            income.setUser(testUser);
            income.setAmount(new BigDecimal("5000.00"));
            income.setType(Transaction.TransactionType.INCOME);
            income.setDescription("Monthly Salary");
            income.setTransactionDate(monthDate.withDayOfMonth(1));
            transactionRepository.save(income);
            
            // Monthly expenses across categories
            for (int i = 0; i < categories.length; i++) {
                for (int week = 0; week < 4; week++) {
                    Transaction expense = new Transaction();
                    expense.setUser(testUser);
                    expense.setCategory(categories[i].getName());
                    expense.setAmount(new BigDecimal(String.valueOf(50 + (i * 20) + (week * 10))));
                    expense.setType(Transaction.TransactionType.EXPENSE);
                    expense.setDescription("Weekly " + categories[i].getName() + " expense");
                    expense.setTransactionDate(monthDate.minusDays(week * 7));
                    transactionRepository.save(expense);
                }
            }
        }

        // Create budgets for current year
        for (int month = 1; month <= 12; month++) {
            for (Category category : categories) {
                Budget budget = new Budget();
                budget.setUser(testUser);
                budget.setCategory(category.getName());
                budget.setBudgetAmount(new BigDecimal(String.valueOf(300 + (category.getId() * 50))));
                budget.setMonth(month);
                budget.setYear(now.getYear());
                budgetRepository.save(budget);
            }
        }

        // Create diverse savings goals
        createSavingsGoals(now);
    }

    private void createSavingsGoals(LocalDateTime now) {
        // Emergency fund (in progress)
        SavingsGoal emergency = new SavingsGoal();
        emergency.setUser(testUser);
        emergency.setName("Emergency Fund");
        emergency.setTargetAmount(new BigDecimal("10000.00"));
        emergency.setCurrentAmount(new BigDecimal("6500.00"));
        emergency.setTargetDate(now.toLocalDate().plusMonths(8));
        emergency.setStatus(SavingsGoal.GoalStatus.IN_PROGRESS);
        savingsGoalRepository.save(emergency);

        // Vacation (completed)
        SavingsGoal vacation = new SavingsGoal();
        vacation.setUser(testUser);
        vacation.setName("Vacation Fund");
        vacation.setTargetAmount(new BigDecimal("3000.00"));
        vacation.setCurrentAmount(new BigDecimal("3000.00"));
        vacation.setTargetDate(now.toLocalDate().minusMonths(2));
        vacation.setStatus(SavingsGoal.GoalStatus.COMPLETED);
        savingsGoalRepository.save(vacation);

        // Car down payment (future)
        SavingsGoal car = new SavingsGoal();
        car.setUser(testUser);
        car.setName("Car Down Payment");
        car.setTargetAmount(new BigDecimal("8000.00"));
        car.setCurrentAmount(new BigDecimal("1200.00"));
        car.setTargetDate(now.toLocalDate().plusMonths(18));
        car.setStatus(SavingsGoal.GoalStatus.IN_PROGRESS);
        savingsGoalRepository.save(car);
    }

    /**
     * Test 1: Analytics features with existing authentication
     */
    @Test
    void testAnalyticsWithAuthentication_ShouldWorkSeamlessly() throws Exception {
        // Test monthly trends with authentication
        mockMvc.perform(get("/api/analytics/monthly-trends")
                .header("Authorization", "Bearer " + authToken)
                .param("months", "12"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trends").isArray())
                .andExpect(jsonPath("$.trends").isNotEmpty())
                .andExpect(jsonPath("$.averageIncome").isNumber())
                .andExpect(jsonPath("$.averageExpenses").isNumber());

        // Test category breakdown with authentication
        mockMvc.perform(get("/api/analytics/category-breakdown")
                .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.expenseCategories").isArray())
                .andExpect(jsonPath("$.totalExpenses").isNumber());

        // Test financial health with authentication
        mockMvc.perform(get("/api/analytics/financial-health")
                .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.healthScore").isNumber())
                .andExpect(jsonPath("$.recommendations").isArray());

        // Test budget analysis with authentication
        mockMvc.perform(get("/api/analytics/budget-analysis")
                .header("Authorization", "Bearer " + authToken)
                .param("month", String.valueOf(LocalDateTime.now().getMonthValue()))
                .param("year", String.valueOf(LocalDateTime.now().getYear())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.budgetItems").isArray());

        // Test savings progress with authentication
        mockMvc.perform(get("/api/analytics/savings-progress")
                .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.goals").isArray())
                .andExpect(jsonPath("$.totalGoals").isNumber());
    }

    /**
     * Test 2: Data consistency across all components
     */
    @Test
    void testDataConsistencyAcrossComponents() throws Exception {
        // Get transaction totals from transactions endpoint
        var transactionResponse = mockMvc.perform(get("/api/transactions")
                .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andReturn();

        // Get analytics data
        var analyticsResponse = mockMvc.perform(get("/api/analytics/category-breakdown")
                .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andReturn();

        // Verify data consistency between endpoints
        String transactionJson = transactionResponse.getResponse().getContentAsString();
        String analyticsJson = analyticsResponse.getResponse().getContentAsString();

        // Both should contain consistent transaction data
        assert transactionJson.contains("EXPENSE") : "Transaction data should contain expenses";
        assert analyticsJson.contains("totalExpenses") : "Analytics should contain total expenses";

        // Test budget consistency
        mockMvc.perform(get("/api/budgets")
                .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        mockMvc.perform(get("/api/analytics/budget-analysis")
                .header("Authorization", "Bearer " + authToken)
                .param("month", String.valueOf(LocalDateTime.now().getMonthValue()))
                .param("year", String.valueOf(LocalDateTime.now().getYear())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.budgetItems").isArray());

        // Test savings goals consistency
        mockMvc.perform(get("/api/savings-goals")
                .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        mockMvc.perform(get("/api/analytics/savings-progress")
                .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.goals").isArray());
    }

    /**
     * Test 3: Export functionality with real user data
     */
    @Test
    void testExportFunctionalityWithRealData() throws Exception {
        // Test PDF export
        mockMvc.perform(get("/api/export/pdf")
                .header("Authorization", "Bearer " + authToken)
                .param("startDate", "2024-01-01")
                .param("endDate", "2024-12-31"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/pdf"));

        // Test CSV export
        mockMvc.perform(get("/api/export/csv")
                .header("Authorization", "Bearer " + authToken)
                .param("startDate", "2024-01-01")
                .param("endDate", "2024-12-31"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "text/csv"));

        // Test comprehensive report export
        mockMvc.perform(get("/api/export/comprehensive")
                .header("Authorization", "Bearer " + authToken)
                .param("startDate", "2024-01-01")
                .param("endDate", "2024-12-31")
                .param("includeCharts", "true"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/pdf"));

        // Test Excel export
        mockMvc.perform(get("/api/export/excel")
                .header("Authorization", "Bearer " + authToken)
                .param("startDate", "2024-01-01")
                .param("endDate", "2024-12-31"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
    }

    /**
     * Test 4: Chart performance with production-size datasets
     */
    @Test
    void testChartPerformanceWithLargeDatasets() throws Exception {
        // Create production-size dataset (5000+ transactions)
        createProductionSizeDataset(LocalDateTime.now());

        // Test analytics performance with large dataset
        long startTime = System.currentTimeMillis();

        mockMvc.perform(get("/api/analytics/dashboard")
                .header("Authorization", "Bearer " + authToken)
                .param("months", "24"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.monthlyTrends").exists())
                .andExpect(jsonPath("$.categoryBreakdown").exists())
                .andExpect(jsonPath("$.financialHealth").exists());

        long endTime = System.currentTimeMillis();
        long duration = endTime - startTime;

        // Performance assertion - should complete within 10 seconds
        assert duration < 10000 : "Analytics dashboard with large dataset took too long: " + duration + "ms";

        // Test individual analytics endpoints performance
        testAnalyticsEndpointPerformance("/api/analytics/monthly-trends?months=24");
        testAnalyticsEndpointPerformance("/api/analytics/category-breakdown");
        testAnalyticsEndpointPerformance("/api/analytics/financial-health");
        testAnalyticsEndpointPerformance("/api/analytics/budget-analysis?month=12&year=2024");
        testAnalyticsEndpointPerformance("/api/analytics/savings-progress");
    }

    /**
     * Test 5: Concurrent user analytics requests
     */
    @Test
    void testConcurrentAnalyticsRequests() throws Exception {
        ExecutorService executor = Executors.newFixedThreadPool(10);
        CompletableFuture<Void>[] futures = new CompletableFuture[20];

        // Create 20 concurrent requests
        for (int i = 0; i < 20; i++) {
            futures[i] = CompletableFuture.runAsync(() -> {
                try {
                    mockMvc.perform(get("/api/analytics/dashboard")
                            .header("Authorization", "Bearer " + authToken)
                            .param("months", "6"))
                            .andExpect(status().isOk());
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            }, executor);
        }

        // Wait for all requests to complete
        CompletableFuture.allOf(futures).get(30, TimeUnit.SECONDS);
        executor.shutdown();
    }

    /**
     * Test 6: Authentication integration across all new features
     */
    @Test
    void testAuthenticationIntegrationAcrossFeatures() throws Exception {
        // Test without token - should fail
        mockMvc.perform(get("/api/analytics/monthly-trends"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(get("/api/export/pdf"))
                .andExpect(status().isBadRequest());

        // Test with invalid token - should fail
        mockMvc.perform(get("/api/analytics/monthly-trends")
                .header("Authorization", "Bearer invalid-token"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(get("/api/export/pdf")
                .header("Authorization", "Bearer invalid-token"))
                .andExpect(status().isBadRequest());

        // Test with valid token - should succeed
        mockMvc.perform(get("/api/analytics/monthly-trends")
                .header("Authorization", "Bearer " + authToken)
                .param("months", "6"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/export/pdf")
                .header("Authorization", "Bearer " + authToken)
                .param("startDate", "2024-01-01")
                .param("endDate", "2024-12-31"))
                .andExpect(status().isOk());
    }

    /**
     * Test 7: Error handling and edge cases
     */
    @Test
    void testErrorHandlingAndEdgeCases() throws Exception {
        // Test analytics with no data
        User newUser = createUserWithNoData();
        String newUserToken = jwtUtil.generateToken(newUser);

        mockMvc.perform(get("/api/analytics/monthly-trends")
                .header("Authorization", "Bearer " + newUserToken)
                .param("months", "6"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trends").isArray());

        // Test export with no data
        mockMvc.perform(get("/api/export/pdf")
                .header("Authorization", "Bearer " + newUserToken)
                .param("startDate", "2024-01-01")
                .param("endDate", "2024-12-31"))
                .andExpect(status().isOk());

        // Test invalid date ranges
        mockMvc.perform(get("/api/analytics/monthly-trends")
                .header("Authorization", "Bearer " + authToken)
                .param("months", "0"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(get("/api/export/pdf")
                .header("Authorization", "Bearer " + authToken)
                .param("startDate", "2025-01-01")
                .param("endDate", "2024-01-01"))
                .andExpect(status().isBadRequest());
    }

    private void testAnalyticsEndpointPerformance(String endpoint) throws Exception {
        long startTime = System.currentTimeMillis();

        mockMvc.perform(get(endpoint)
                .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk());

        long endTime = System.currentTimeMillis();
        long duration = endTime - startTime;

        // Each endpoint should complete within 5 seconds
        assert duration < 5000 : "Endpoint " + endpoint + " took too long: " + duration + "ms";
    }

    private void createProductionSizeDataset(LocalDateTime now) {
        // Create 5000+ transactions over 2 years
        for (int i = 0; i < 5000; i++) {
            Transaction transaction = new Transaction();
            transaction.setUser(testUser);
            transaction.setCategory(categories[i % categories.length].getName());
            transaction.setAmount(new BigDecimal(String.valueOf(10 + (i % 500))));
            transaction.setType(i % 10 == 0 ? Transaction.TransactionType.INCOME : Transaction.TransactionType.EXPENSE);
            transaction.setDescription("Production test transaction " + i);
            transaction.setTransactionDate(now.minusDays(i % 730)); // 2 years
            transactionRepository.save(transaction);
        }

        // Create extensive budget history
        for (int year = 2023; year <= 2024; year++) {
            for (int month = 1; month <= 12; month++) {
                for (Category category : categories) {
                    Budget budget = new Budget();
                    budget.setUser(testUser);
                    budget.setCategory(category.getName());
                    budget.setBudgetAmount(new BigDecimal(String.valueOf(200 + (category.getId() * 100))));
                    budget.setMonth(month);
                    budget.setYear(year);
                    budgetRepository.save(budget);
                }
            }
        }

        // Create multiple savings goals with various statuses
        for (int i = 0; i < 50; i++) {
            SavingsGoal goal = new SavingsGoal();
            goal.setUser(testUser);
            goal.setName("Production Goal " + i);
            goal.setTargetAmount(new BigDecimal(String.valueOf(1000 + (i * 200))));
            BigDecimal currentAmount = new BigDecimal(String.valueOf(i % 3 == 0 ? goal.getTargetAmount().intValue() : (i * 100)));
            goal.setCurrentAmount(currentAmount);
            goal.setTargetDate(now.toLocalDate().plusMonths(i % 24));
            goal.setStatus(i % 3 == 0 ? SavingsGoal.GoalStatus.COMPLETED : SavingsGoal.GoalStatus.IN_PROGRESS);
            savingsGoalRepository.save(goal);
        }
    }

    private User createUserWithNoData() {
        User user = new User();
        user.setUsername("emptyuser");
        user.setEmail("empty@example.com");
        user.setPassword(passwordEncoder.encode("password"));
        user.setMonthlyIncome(new BigDecimal("0.00"));
        user.setCurrentSavings(new BigDecimal("0.00"));
        user.setTargetExpenses(new BigDecimal("0.00"));
        return userRepository.save(user);
    }
}