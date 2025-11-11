package com.budgettracker.integration;

import com.budgettracker.dto.RetirementPlanRequest;
import com.budgettracker.model.User;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class RetirementPlanningIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

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
    }

    @Test
    void createRetirementPlan_ShouldCreateSuccessfully() throws Exception {
        // Arrange
        RetirementPlanRequest request = new RetirementPlanRequest();
        request.setCurrentAge(30);
        request.setRetirementAge(65);
        request.setCurrentAnnualIncome(new BigDecimal("75000"));
        request.setDesiredReplacementRatio(new BigDecimal("0.8"));
        request.setCurrent401kBalance(new BigDecimal("25000"));
        request.setCurrentIraBalance(new BigDecimal("15000"));
        request.setOtherRetirementSavings(new BigDecimal("10000"));
        request.setMonthly401kContribution(new BigDecimal("500"));
        request.setMonthlyIraContribution(new BigDecimal("300"));
        request.setEmployerMatchRate(new BigDecimal("0.5"));
        request.setEmployerMatchLimit(new BigDecimal("0.06"));
        request.setExpectedAnnualReturn(new BigDecimal("0.07"));
        request.setExpectedInflationRate(new BigDecimal("0.03"));
        request.setSocialSecurityBenefit(new BigDecimal("2000"));
        request.setLifeExpectancy(85);

        // Act & Assert
        mockMvc.perform(post("/api/retirement/plan")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentAge").value(30))
                .andExpect(jsonPath("$.retirementAge").value(65))
                .andExpect(jsonPath("$.currentAnnualIncome").value(75000))
                .andExpect(jsonPath("$.desiredReplacementRatio").value(0.8));
    }

    @Test
    void getRetirementPlan_WhenNoPlanExists_ShouldReturnNotFound() throws Exception {
        mockMvc.perform(get("/api/retirement/plan")
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void calculateRetirementProjection_ShouldReturnCalculation() throws Exception {
        // First create a retirement plan
        RetirementPlanRequest request = new RetirementPlanRequest();
        request.setCurrentAge(30);
        request.setRetirementAge(65);
        request.setCurrentAnnualIncome(new BigDecimal("75000"));
        request.setDesiredReplacementRatio(new BigDecimal("0.8"));
        request.setCurrent401kBalance(new BigDecimal("25000"));
        request.setCurrentIraBalance(new BigDecimal("15000"));
        request.setOtherRetirementSavings(new BigDecimal("10000"));
        request.setMonthly401kContribution(new BigDecimal("500"));
        request.setMonthlyIraContribution(new BigDecimal("300"));
        request.setEmployerMatchRate(new BigDecimal("0.5"));
        request.setEmployerMatchLimit(new BigDecimal("0.06"));
        request.setExpectedAnnualReturn(new BigDecimal("0.07"));
        request.setExpectedInflationRate(new BigDecimal("0.03"));
        request.setSocialSecurityBenefit(new BigDecimal("2000"));
        request.setLifeExpectancy(85);

        mockMvc.perform(post("/api/retirement/plan")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        // Then calculate retirement projection
        mockMvc.perform(get("/api/retirement/calculate")
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.projectedRetirementBalance").exists())
                .andExpect(jsonPath("$.monthlyRetirementIncome").exists())
                .andExpect(jsonPath("$.requiredMonthlyIncome").exists())
                .andExpect(jsonPath("$.replacementRatio").exists())
                .andExpect(jsonPath("$.retirementReadiness").exists())
                .andExpect(jsonPath("$.breakdown").exists())
                .andExpect(jsonPath("$.breakdown.total401kBalance").exists())
                .andExpect(jsonPath("$.breakdown.totalIraBalance").exists())
                .andExpect(jsonPath("$.breakdown.totalOtherSavings").exists())
                .andExpect(jsonPath("$.yearlyProjections").isArray())
                .andExpect(jsonPath("$.yearlyProjections").isNotEmpty());
    }

    @Test
    void calculateRetirementProjectionWithCustomParameters_ShouldReturnCalculation() throws Exception {
        RetirementPlanRequest request = new RetirementPlanRequest();
        request.setCurrentAge(25);
        request.setRetirementAge(60);
        request.setCurrentAnnualIncome(new BigDecimal("50000"));
        request.setDesiredReplacementRatio(new BigDecimal("0.7"));
        request.setCurrent401kBalance(new BigDecimal("5000"));
        request.setCurrentIraBalance(new BigDecimal("3000"));
        request.setOtherRetirementSavings(new BigDecimal("2000"));
        request.setMonthly401kContribution(new BigDecimal("300"));
        request.setMonthlyIraContribution(new BigDecimal("200"));
        request.setEmployerMatchRate(new BigDecimal("0.5"));
        request.setEmployerMatchLimit(new BigDecimal("0.04"));
        request.setExpectedAnnualReturn(new BigDecimal("0.08"));
        request.setExpectedInflationRate(new BigDecimal("0.025"));
        request.setSocialSecurityBenefit(new BigDecimal("1500"));
        request.setLifeExpectancy(80);

        mockMvc.perform(post("/api/retirement/calculate")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.projectedRetirementBalance").exists())
                .andExpect(jsonPath("$.monthlyRetirementIncome").exists())
                .andExpect(jsonPath("$.retirementReadiness").exists())
                .andExpect(jsonPath("$.yearlyProjections").isArray());
    }

    @Test
    void createRetirementPlan_WithInvalidData_ShouldReturnBadRequest() throws Exception {
        // Test with invalid age (too young)
        RetirementPlanRequest request = new RetirementPlanRequest();
        request.setCurrentAge(15); // Invalid - too young
        request.setRetirementAge(65);
        request.setLifeExpectancy(85);

        mockMvc.perform(post("/api/retirement/plan")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getRetirementReadiness_ShouldReturnReadinessAssessment() throws Exception {
        // First create a retirement plan
        RetirementPlanRequest request = new RetirementPlanRequest();
        request.setCurrentAge(40);
        request.setRetirementAge(65);
        request.setCurrentAnnualIncome(new BigDecimal("80000"));
        request.setDesiredReplacementRatio(new BigDecimal("0.8"));
        request.setCurrent401kBalance(new BigDecimal("100000"));
        request.setCurrentIraBalance(new BigDecimal("50000"));
        request.setMonthly401kContribution(new BigDecimal("600"));
        request.setMonthlyIraContribution(new BigDecimal("400"));
        request.setEmployerMatchRate(new BigDecimal("0.5"));
        request.setEmployerMatchLimit(new BigDecimal("0.06"));
        request.setExpectedAnnualReturn(new BigDecimal("0.07"));
        request.setExpectedInflationRate(new BigDecimal("0.03"));
        request.setSocialSecurityBenefit(new BigDecimal("2200"));
        request.setLifeExpectancy(85);

        mockMvc.perform(post("/api/retirement/plan")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        // Then get retirement readiness
        mockMvc.perform(get("/api/retirement/readiness")
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.retirementReadiness").value(org.hamcrest.Matchers.oneOf("ON_TRACK", "NEEDS_IMPROVEMENT", "BEHIND")));
    }
}