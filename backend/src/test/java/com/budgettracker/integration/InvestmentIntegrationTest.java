package com.budgettracker.integration;

import com.budgettracker.dto.InvestmentRequest;
import com.budgettracker.model.Investment.InvestmentType;
import com.budgettracker.model.User;
import com.budgettracker.repository.InvestmentRepository;
import com.budgettracker.repository.UserRepository;
import com.budgettracker.util.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@Transactional
class InvestmentIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InvestmentRepository investmentRepository;

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
        // Clean up
        investmentRepository.deleteAll();
        userRepository.deleteAll();

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
    void createInvestment_ShouldCreateSuccessfully() throws Exception {
        // Arrange
        InvestmentRequest request = new InvestmentRequest();
        request.setSymbol("AAPL");
        request.setName("Apple Inc.");
        request.setType(InvestmentType.STOCK);
        request.setQuantity(new BigDecimal("10"));
        request.setPurchasePrice(new BigDecimal("150.00"));
        request.setPurchaseDate(LocalDate.now().minusDays(30));
        request.setBrokerage("Fidelity");
        request.setNotes("Long-term investment");

        // Act & Assert
        mockMvc.perform(post("/api/investments")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.symbol").value("AAPL"))
                .andExpect(jsonPath("$.name").value("Apple Inc."))
                .andExpect(jsonPath("$.type").value("STOCK"))
                .andExpect(jsonPath("$.quantity").value(10))
                .andExpect(jsonPath("$.purchasePrice").value(150.00))
                .andExpect(jsonPath("$.brokerage").value("Fidelity"))
                .andExpect(jsonPath("$.notes").value("Long-term investment"));
    }

    @Test
    void createInvestment_InvalidData_ShouldReturnBadRequest() throws Exception {
        // Arrange
        InvestmentRequest request = new InvestmentRequest();
        // Missing required fields

        // Act & Assert
        mockMvc.perform(post("/api/investments")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getAllInvestments_ShouldReturnUserInvestments() throws Exception {
        // Arrange - Create test investment through API first
        InvestmentRequest request = new InvestmentRequest();
        request.setSymbol("AAPL");
        request.setName("Apple Inc.");
        request.setType(InvestmentType.STOCK);
        request.setQuantity(new BigDecimal("10"));
        request.setPurchasePrice(new BigDecimal("150.00"));
        request.setPurchaseDate(LocalDate.now().minusDays(30));

        mockMvc.perform(post("/api/investments")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));

        // Act & Assert
        mockMvc.perform(get("/api/investments")
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].symbol").value("AAPL"))
                .andExpect(jsonPath("$[0].name").value("Apple Inc."));
    }

    @Test
    void getInvestmentById_ShouldReturnInvestment() throws Exception {
        // Arrange - Create test investment
        InvestmentRequest request = new InvestmentRequest();
        request.setSymbol("AAPL");
        request.setName("Apple Inc.");
        request.setType(InvestmentType.STOCK);
        request.setQuantity(new BigDecimal("10"));
        request.setPurchasePrice(new BigDecimal("150.00"));
        request.setPurchaseDate(LocalDate.now().minusDays(30));

        String createResponse = mockMvc.perform(post("/api/investments")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        // Extract ID from response
        Long investmentId = objectMapper.readTree(createResponse).get("id").asLong();

        // Act & Assert
        mockMvc.perform(get("/api/investments/" + investmentId)
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(investmentId))
                .andExpect(jsonPath("$.symbol").value("AAPL"));
    }

    @Test
    void updateInvestment_ShouldUpdateSuccessfully() throws Exception {
        // Arrange - Create test investment
        InvestmentRequest createRequest = new InvestmentRequest();
        createRequest.setSymbol("AAPL");
        createRequest.setName("Apple Inc.");
        createRequest.setType(InvestmentType.STOCK);
        createRequest.setQuantity(new BigDecimal("10"));
        createRequest.setPurchasePrice(new BigDecimal("150.00"));
        createRequest.setPurchaseDate(LocalDate.now().minusDays(30));

        String createResponse = mockMvc.perform(post("/api/investments")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long investmentId = objectMapper.readTree(createResponse).get("id").asLong();

        // Prepare update request
        InvestmentRequest updateRequest = new InvestmentRequest();
        updateRequest.setSymbol("AAPL");
        updateRequest.setName("Apple Inc.");
        updateRequest.setType(InvestmentType.STOCK);
        updateRequest.setQuantity(new BigDecimal("15")); // Updated quantity
        updateRequest.setPurchasePrice(new BigDecimal("155.00")); // Updated price
        updateRequest.setPurchaseDate(LocalDate.now().minusDays(30));

        // Act & Assert
        mockMvc.perform(put("/api/investments/" + investmentId)
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity").value(15))
                .andExpect(jsonPath("$.purchasePrice").value(155.00));
    }

    @Test
    void deleteInvestment_ShouldDeleteSuccessfully() throws Exception {
        // Arrange - Create test investment
        InvestmentRequest request = new InvestmentRequest();
        request.setSymbol("AAPL");
        request.setName("Apple Inc.");
        request.setType(InvestmentType.STOCK);
        request.setQuantity(new BigDecimal("10"));
        request.setPurchasePrice(new BigDecimal("150.00"));
        request.setPurchaseDate(LocalDate.now().minusDays(30));

        String createResponse = mockMvc.perform(post("/api/investments")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long investmentId = objectMapper.readTree(createResponse).get("id").asLong();

        // Act & Assert
        mockMvc.perform(delete("/api/investments/" + investmentId)
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNoContent());

        // Verify deletion
        mockMvc.perform(get("/api/investments/" + investmentId)
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getPortfolioSummary_ShouldReturnSummary() throws Exception {
        // Arrange - Create test investments
        InvestmentRequest request1 = new InvestmentRequest();
        request1.setSymbol("AAPL");
        request1.setName("Apple Inc.");
        request1.setType(InvestmentType.STOCK);
        request1.setQuantity(new BigDecimal("10"));
        request1.setPurchasePrice(new BigDecimal("150.00"));
        request1.setPurchaseDate(LocalDate.now().minusDays(30));

        InvestmentRequest request2 = new InvestmentRequest();
        request2.setSymbol("BND");
        request2.setName("Vanguard Total Bond Market ETF");
        request2.setType(InvestmentType.BOND);
        request2.setQuantity(new BigDecimal("20"));
        request2.setPurchasePrice(new BigDecimal("80.00"));
        request2.setPurchaseDate(LocalDate.now().minusDays(60));

        mockMvc.perform(post("/api/investments")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request1)));

        mockMvc.perform(post("/api/investments")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request2)));

        // Act & Assert
        mockMvc.perform(get("/api/investments/portfolio/summary")
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCostBasis").exists())
                .andExpect(jsonPath("$.totalValue").exists())
                .andExpect(jsonPath("$.allocation").exists());
    }

    @Test
    void getInvestmentsByType_ShouldReturnFilteredInvestments() throws Exception {
        // Arrange - Create investments of different types
        InvestmentRequest stockRequest = new InvestmentRequest();
        stockRequest.setSymbol("AAPL");
        stockRequest.setName("Apple Inc.");
        stockRequest.setType(InvestmentType.STOCK);
        stockRequest.setQuantity(new BigDecimal("10"));
        stockRequest.setPurchasePrice(new BigDecimal("150.00"));
        stockRequest.setPurchaseDate(LocalDate.now().minusDays(30));

        InvestmentRequest bondRequest = new InvestmentRequest();
        bondRequest.setSymbol("BND");
        bondRequest.setName("Vanguard Total Bond Market ETF");
        bondRequest.setType(InvestmentType.BOND);
        bondRequest.setQuantity(new BigDecimal("20"));
        bondRequest.setPurchasePrice(new BigDecimal("80.00"));
        bondRequest.setPurchaseDate(LocalDate.now().minusDays(60));

        mockMvc.perform(post("/api/investments")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(stockRequest)));

        mockMvc.perform(post("/api/investments")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(bondRequest)));

        // Act & Assert - Get only stocks
        mockMvc.perform(get("/api/investments/type/STOCK")
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].type").value("STOCK"))
                .andExpect(jsonPath("$[0].symbol").value("AAPL"));
    }

    @Test
    void unauthorizedAccess_ShouldReturnUnauthorized() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/investments"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void invalidToken_ShouldReturnUnauthorized() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/investments")
                .header("Authorization", "Bearer invalid-token"))
                .andExpect(status().isUnauthorized());
    }
}