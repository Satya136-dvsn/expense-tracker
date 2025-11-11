package com.budgettracker.integration;

import com.budgettracker.dto.DebtOptimizationRequest;
import com.budgettracker.dto.TaxPlanRequest;
import com.budgettracker.model.Debt;
import com.budgettracker.model.TaxPlan;
import com.budgettracker.model.User;
import com.budgettracker.repository.DebtRepository;
import com.budgettracker.repository.TaxPlanRepository;
import com.budgettracker.repository.UserRepository;
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
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class PlanningIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DebtRepository debtRepository;

    @Autowired
    private TaxPlanRepository taxPlanRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private User testUser;
    private String jwtToken;

    @BeforeEach
    void setUp() {
        // Create test user
        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword(passwordEncoder.encode("password"));
        testUser = userRepository.save(testUser);

        // Generate JWT token
        jwtToken = jwtUtil.generateToken(testUser);

        // Create test debts
        createTestDebts();
    }

    private void createTestDebts() {
        Debt creditCard = new Debt();
        creditCard.setUser(testUser);
        creditCard.setName("Credit Card");
        creditCard.setType(Debt.DebtType.CREDIT_CARD);
        creditCard.setCurrentBalance(new BigDecimal("5000"));
        creditCard.setInterestRate(new BigDecimal("0.18"));
        creditCard.setMinimumPayment(new BigDecimal("150"));
        creditCard.setStatus(Debt.DebtStatus.ACTIVE);

        Debt personalLoan = new Debt();
        personalLoan.setUser(testUser);
        personalLoan.setName("Personal Loan");
        personalLoan.setType(Debt.DebtType.PERSONAL_LOAN);
        personalLoan.setCurrentBalance(new BigDecimal("15000"));
        personalLoan.setInterestRate(new BigDecimal("0.12"));
        personalLoan.setMinimumPayment(new BigDecimal("300"));
        personalLoan.setStatus(Debt.DebtStatus.ACTIVE);

        debtRepository.saveAll(Arrays.asList(creditCard, personalLoan));
    }

    @Test
    void testDebtOptimizationAvalancheStrategy() throws Exception {
        // Arrange
        DebtOptimizationRequest request = new DebtOptimizationRequest();
        request.setExtraPaymentAmount(new BigDecimal("200"));

        // Act & Assert
        mockMvc.perform(post("/api/debt-optimization/avalanche")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.strategy").value("AVALANCHE"))
                .andExpect(jsonPath("$.totalDebt").value(20000))
                .andExpect(jsonPath("$.extraPaymentAmount").value(200))
                .andExpect(jsonPath("$.payoffPlan").isArray())
                .andExpect(jsonPath("$.payoffPlan").isNotEmpty());
    }

    @Test
    void testDebtOptimizationSnowballStrategy() throws Exception {
        // Arrange
        DebtOptimizationRequest request = new DebtOptimizationRequest();
        request.setExtraPaymentAmount(new BigDecimal("200"));

        // Act & Assert
        mockMvc.perform(post("/api/debt-optimization/snowball")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.strategy").value("SNOWBALL"))
                .andExpect(jsonPath("$.totalDebt").value(20000))
                .andExpect(jsonPath("$.payoffPlan").isArray());
    }

    @Test
    void testDebtOptimizationCompareStrategies() throws Exception {
        // Arrange
        DebtOptimizationRequest request = new DebtOptimizationRequest();
        request.setExtraPaymentAmount(new BigDecimal("200"));

        // Act & Assert
        mockMvc.perform(post("/api/debt-optimization/compare")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.avalancheStrategy").exists())
                .andExpect(jsonPath("$.snowballStrategy").exists())
                .andExpect(jsonPath("$.recommendedStrategy").exists())
                .andExpect(jsonPath("$.recommendationReason").exists());
    }

    @Test
    void testDebtConsolidationAnalysis() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/api/debt-optimization/consolidation")
                .header("Authorization", "Bearer " + jwtToken)
                .param("consolidationRate", "0.08"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCurrentDebt").value(20000))
                .andExpect(jsonPath("$.consolidatedInterestRate").value(0.08))
                .andExpect(jsonPath("$.isConsolidationBeneficial").exists())
                .andExpect(jsonPath("$.recommendation").exists());
    }

    @Test
    void testPaymentComparison() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/api/debt-optimization/payment-comparison")
                .header("Authorization", "Bearer " + jwtToken)
                .param("extraPayment", "300"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.minimumPaymentScenario").exists())
                .andExpect(jsonPath("$.acceleratedPaymentScenario").exists())
                .andExpect(jsonPath("$.savings").exists())
                .andExpect(jsonPath("$.recommendation").exists());
    }

    @Test
    void testTaxPlanningCalculation() throws Exception {
        // Arrange
        TaxPlanRequest request = new TaxPlanRequest();
        request.setTaxYear(2024);
        request.setFilingStatus(TaxPlan.FilingStatus.SINGLE);
        request.setAnnualIncome(new BigDecimal("75000"));
        request.setFederalWithholding(new BigDecimal("12000"));
        request.setStateWithholding(new BigDecimal("3000"));
        request.setTraditional401kContribution(new BigDecimal("10000"));
        request.setTraditionalIraContribution(new BigDecimal("6000"));

        // Act & Assert
        mockMvc.perform(post("/api/tax-planning/calculate")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.taxYear").value(2024))
                .andExpect(jsonPath("$.filingStatus").value("SINGLE"))
                .andExpect(jsonPath("$.annualIncome").value(75000))
                .andExpect(jsonPath("$.federalTaxOwed").exists())
                .andExpect(jsonPath("$.stateTaxOwed").exists())
                .andExpect(jsonPath("$.totalTaxOwed").exists())
                .andExpect(jsonPath("$.effectiveTaxRate").exists())
                .andExpect(jsonPath("$.marginalTaxRate").exists())
                .andExpect(jsonPath("$.refundOrAmountDue").exists())
                .andExpect(jsonPath("$.isRefund").exists());
    }

    @Test
    void testTaxBracketCalculation() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/tax-planning/brackets")
                .header("Authorization", "Bearer " + jwtToken)
                .param("income", "75000")
                .param("filingStatus", "SINGLE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.federalTaxBrackets").isArray())
                .andExpect(jsonPath("$.federalTaxBrackets").isNotEmpty())
                .andExpect(jsonPath("$.effectiveTaxRate").exists())
                .andExpect(jsonPath("$.marginalTaxRate").exists());
    }

    @Test
    void testContributionOptimization() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/tax-planning/optimize-contributions")
                .header("Authorization", "Bearer " + jwtToken)
                .param("income", "100000")
                .param("filingStatus", "SINGLE")
                .param("age", "35"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.optimalContributions").exists())
                .andExpect(jsonPath("$.taxSavings").exists())
                .andExpect(jsonPath("$.totalOptimalContributions").exists())
                .andExpect(jsonPath("$.totalTaxSavings").exists())
                .andExpect(jsonPath("$.marginalTaxRate").exists());
    }

    @Test
    void testTaxLossHarvesting() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/tax-planning/tax-loss-harvesting")
                .header("Authorization", "Bearer " + jwtToken)
                .param("capitalGains", "10000")
                .param("capitalLosses", "15000")
                .param("marginalTaxRate", "22"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.netCapitalGains").exists())
                .andExpect(jsonPath("$.recommendation").exists());
    }

    @Test
    void testDeductionComparison() throws Exception {
        // Arrange
        Map<String, BigDecimal> deductions = Map.of(
                "mortgageInterest", new BigDecimal("8000"),
                "stateLocalTaxes", new BigDecimal("10000"),
                "charitableContributions", new BigDecimal("2000")
        );

        // Act & Assert
        mockMvc.perform(post("/api/tax-planning/deduction-comparison")
                .header("Authorization", "Bearer " + jwtToken)
                .param("filingStatus", "SINGLE")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(deductions)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.standardDeduction").exists())
                .andExpect(jsonPath("$.itemizedDeductions").exists())
                .andExpect(jsonPath("$.shouldItemize").exists())
                .andExpect(jsonPath("$.recommendation").exists());
    }

    @Test
    void testQuickTaxEstimate() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/tax-planning/quick-estimate")
                .header("Authorization", "Bearer " + jwtToken)
                .param("income", "75000")
                .param("filingStatus", "SINGLE")
                .param("deductions", "15000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.income").value(75000))
                .andExpect(jsonPath("$.filingStatus").value("SINGLE"))
                .andExpect(jsonPath("$.estimatedFederalTax").exists())
                .andExpect(jsonPath("$.effectiveTaxRate").exists())
                .andExpect(jsonPath("$.marginalTaxRate").exists());
    }

    @Test
    void testDebtOptimizationWithNoDebts() throws Exception {
        // Arrange - Remove all debts
        debtRepository.deleteAll();

        DebtOptimizationRequest request = new DebtOptimizationRequest();
        request.setExtraPaymentAmount(new BigDecimal("200"));

        // Act & Assert
        mockMvc.perform(post("/api/debt-optimization/avalanche")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testDebtOptimizationWithInvalidExtraPayment() throws Exception {
        // Arrange
        DebtOptimizationRequest request = new DebtOptimizationRequest();
        request.setExtraPaymentAmount(new BigDecimal("-100")); // Invalid negative amount

        // Act & Assert
        mockMvc.perform(post("/api/debt-optimization/avalanche")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testTaxPlanningWithInvalidData() throws Exception {
        // Arrange
        TaxPlanRequest request = new TaxPlanRequest();
        request.setTaxYear(2024);
        request.setFilingStatus(TaxPlan.FilingStatus.SINGLE);
        // Missing required annual income

        // Act & Assert
        mockMvc.perform(post("/api/tax-planning/calculate")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testUnauthorizedAccess() throws Exception {
        // Arrange
        DebtOptimizationRequest request = new DebtOptimizationRequest();
        request.setExtraPaymentAmount(new BigDecimal("200"));

        // Act & Assert - No authorization header
        mockMvc.perform(post("/api/debt-optimization/avalanche")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testInvalidJwtToken() throws Exception {
        // Arrange
        DebtOptimizationRequest request = new DebtOptimizationRequest();
        request.setExtraPaymentAmount(new BigDecimal("200"));

        // Act & Assert - Invalid JWT token
        mockMvc.perform(post("/api/debt-optimization/avalanche")
                .header("Authorization", "Bearer invalid-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testCreateAndRetrieveTaxPlan() throws Exception {
        // Arrange
        TaxPlanRequest request = new TaxPlanRequest();
        request.setTaxYear(2024);
        request.setFilingStatus(TaxPlan.FilingStatus.SINGLE);
        request.setAnnualIncome(new BigDecimal("75000"));
        request.setFederalWithholding(new BigDecimal("12000"));

        // Act - Create tax plan
        mockMvc.perform(post("/api/tax-planning/plan")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.taxYear").value(2024))
                .andExpect(jsonPath("$.filingStatus").value("SINGLE"))
                .andExpect(jsonPath("$.annualIncome").value(75000));

        // Verify tax plan was saved
        List<TaxPlan> savedPlans = taxPlanRepository.findByUserOrderByTaxYearDesc(testUser);
        assertEquals(1, savedPlans.size());
        assertEquals(Integer.valueOf(2024), savedPlans.get(0).getTaxYear());
    }

    @Test
    void testUpdateExistingTaxPlan() throws Exception {
        // Arrange - Create initial tax plan
        TaxPlan existingPlan = new TaxPlan();
        existingPlan.setUser(testUser);
        existingPlan.setTaxYear(2024);
        existingPlan.setFilingStatus(TaxPlan.FilingStatus.SINGLE);
        existingPlan.setAnnualIncome(new BigDecimal("70000"));
        taxPlanRepository.save(existingPlan);

        TaxPlanRequest updateRequest = new TaxPlanRequest();
        updateRequest.setTaxYear(2024);
        updateRequest.setFilingStatus(TaxPlan.FilingStatus.SINGLE);
        updateRequest.setAnnualIncome(new BigDecimal("80000")); // Updated income

        // Act - Update tax plan
        mockMvc.perform(post("/api/tax-planning/plan")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.annualIncome").value(80000));

        // Verify tax plan was updated, not duplicated
        List<TaxPlan> savedPlans = taxPlanRepository.findByUserOrderByTaxYearDesc(testUser);
        assertEquals(1, savedPlans.size());
        assertEquals(new BigDecimal("80000"), savedPlans.get(0).getAnnualIncome());
    }
}