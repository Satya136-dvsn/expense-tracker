package com.budgettracker.controller;

import com.budgettracker.model.User;
import com.budgettracker.repository.UserRepository;
import com.budgettracker.service.AnalyticsService;
import com.budgettracker.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
public class AnalyticsControllerTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @MockBean
    private AnalyticsService analyticsService;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private UserRepository userRepository;

    private MockMvc mockMvc;

    @BeforeEach
    public void setup() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        
        // Mock JWT token extraction
        when(jwtUtil.extractUsername(anyString())).thenReturn("testuser");
        
        // Mock user repository
        User mockUser = new User();
        mockUser.setUsername("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));
    }

    @Test
    @WithMockUser(roles = "USER")
    public void testGetMonthlyTrends() throws Exception {
        // Mock service response
        Map<String, Object> mockTrends = new HashMap<>();
        mockTrends.put("averageIncome", 5000.0);
        mockTrends.put("averageExpenses", 3000.0);
        mockTrends.put("trendDirection", "positive");
        
        when(analyticsService.getMonthlyTrends(anyInt(), anyString())).thenReturn(mockTrends);

        mockMvc.perform(get("/api/analytics/monthly-trends")
                .header("Authorization", "Bearer mock-token")
                .param("months", "6")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.averageIncome").value(5000.0))
                .andExpect(jsonPath("$.averageExpenses").value(3000.0))
                .andExpect(jsonPath("$.trendDirection").value("positive"));
    }

    @Test
    @WithMockUser(roles = "USER")
    public void testGetCategoryBreakdown() throws Exception {
        // Mock service response
        Map<String, Object> mockBreakdown = new HashMap<>();
        mockBreakdown.put("totalSpending", 2500.0);
        mockBreakdown.put("topCategory", "Food");
        
        when(analyticsService.getCategoryBreakdown(anyString(), any(), any())).thenReturn(mockBreakdown);

        mockMvc.perform(get("/api/analytics/category-breakdown")
                .header("Authorization", "Bearer mock-token")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalSpending").value(2500.0))
                .andExpect(jsonPath("$.topCategory").value("Food"));
    }

    @Test
    @WithMockUser(roles = "USER")
    public void testGetFinancialHealth() throws Exception {
        // Mock service response
        Map<String, Object> mockHealth = new HashMap<>();
        mockHealth.put("healthScore", 75);
        mockHealth.put("healthTrend", "improving");
        
        when(analyticsService.calculateFinancialHealth(anyString())).thenReturn(mockHealth);

        mockMvc.perform(get("/api/analytics/financial-health")
                .header("Authorization", "Bearer mock-token")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.healthScore").value(75))
                .andExpect(jsonPath("$.healthTrend").value("improving"));
    }

    @Test
    @WithMockUser(roles = "USER")
    public void testGetBudgetAnalysis() throws Exception {
        // Mock service response
        Map<String, Object> mockAnalysis = new HashMap<>();
        mockAnalysis.put("totalBudget", 4000.0);
        mockAnalysis.put("totalSpent", 3200.0);
        mockAnalysis.put("variance", -800.0);
        
        when(analyticsService.getBudgetAnalysis(anyString(), anyInt(), anyInt())).thenReturn(mockAnalysis);

        mockMvc.perform(get("/api/analytics/budget-analysis")
                .header("Authorization", "Bearer mock-token")
                .param("month", "10")
                .param("year", "2024")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalBudget").value(4000.0))
                .andExpect(jsonPath("$.totalSpent").value(3200.0))
                .andExpect(jsonPath("$.variance").value(-800.0));
    }

    @Test
    @WithMockUser(roles = "USER")
    public void testGetSavingsProgress() throws Exception {
        // Mock service response
        Map<String, Object> mockProgress = new HashMap<>();
        mockProgress.put("totalGoals", 3);
        mockProgress.put("completedGoals", 1);
        mockProgress.put("overallProgressPercent", 65.5);
        
        when(analyticsService.getSavingsProgress(anyString())).thenReturn(mockProgress);

        mockMvc.perform(get("/api/analytics/savings-progress")
                .header("Authorization", "Bearer mock-token")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalGoals").value(3))
                .andExpect(jsonPath("$.completedGoals").value(1))
                .andExpect(jsonPath("$.overallProgressPercent").value(65.5));
    }

    @Test
    @WithMockUser(roles = "USER")
    public void testGetAnalyticsDashboard() throws Exception {
        // Mock service responses
        Map<String, Object> mockTrends = new HashMap<>();
        mockTrends.put("averageIncome", 5000.0);
        
        Map<String, Object> mockBreakdown = new HashMap<>();
        mockBreakdown.put("totalSpending", 2500.0);
        
        Map<String, Object> mockHealth = new HashMap<>();
        mockHealth.put("healthScore", 75);
        
        Map<String, Object> mockBudget = new HashMap<>();
        mockBudget.put("totalBudget", 4000.0);
        
        Map<String, Object> mockSavings = new HashMap<>();
        mockSavings.put("totalGoals", 3);
        
        when(analyticsService.getMonthlyTrends(anyInt(), anyString())).thenReturn(mockTrends);
        when(analyticsService.getCategoryBreakdown(anyString(), any(), any())).thenReturn(mockBreakdown);
        when(analyticsService.calculateFinancialHealth(anyString())).thenReturn(mockHealth);
        when(analyticsService.getBudgetAnalysis(anyString(), anyInt(), anyInt())).thenReturn(mockBudget);
        when(analyticsService.getSavingsProgress(anyString())).thenReturn(mockSavings);

        mockMvc.perform(get("/api/analytics/dashboard")
                .header("Authorization", "Bearer mock-token")
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
    public void testUnauthorizedAccess() throws Exception {
        mockMvc.perform(get("/api/analytics/monthly-trends")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }
}