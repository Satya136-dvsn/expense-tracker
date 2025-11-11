package com.budgettracker.controller;

import com.budgettracker.model.Transaction;
import com.budgettracker.model.User;
import com.budgettracker.repository.TransactionRepository;
import com.budgettracker.repository.UserRepository;
import com.budgettracker.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@Transactional
class TransactionControllerIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;



    private MockMvc mockMvc;
    private User testUser;
    private String jwtToken;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        // Create test user
        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword(passwordEncoder.encode("password123"));
        testUser = userRepository.save(testUser);

        // Generate JWT token
        jwtToken = jwtUtil.generateToken(testUser);
    }

    @Test
    void createTransaction_WithValidData_ShouldReturnCreated() throws Exception {
        // Arrange
        String requestJson = """
            {
                "title": "Test Transaction",
                "description": "Test Description",
                "amount": 100.50,
                "type": "EXPENSE",
                "category": "Food",
                "transactionDate": "2024-10-16T10:00:00"
            }
            """;

        // Act & Assert
        mockMvc.perform(post("/api/transactions")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Test Transaction"))
                .andExpect(jsonPath("$.amount").value(100.50))
                .andExpect(jsonPath("$.type").value("EXPENSE"))
                .andExpect(jsonPath("$.category").value("Food"))
                .andExpect(jsonPath("$.id").exists());
    }

    @Test
    void createTransaction_WithMissingTitle_ShouldReturnBadRequest() throws Exception {
        // Arrange
        String requestJson = """
            {
                "description": "Test Description",
                "amount": 100.50,
                "type": "EXPENSE",
                "category": "Food",
                "transactionDate": "2024-10-16T10:00:00"
            }
            """;

        // Act & Assert
        mockMvc.perform(post("/api/transactions")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createTransaction_WithInvalidAmount_ShouldReturnBadRequest() throws Exception {
        // Arrange
        String requestJson = """
            {
                "title": "Test Transaction",
                "description": "Test Description",
                "amount": -10.00,
                "type": "EXPENSE",
                "category": "Food",
                "transactionDate": "2024-10-16T10:00:00"
            }
            """;

        // Act & Assert
        mockMvc.perform(post("/api/transactions")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createTransaction_WithoutAuthentication_ShouldReturnForbidden() throws Exception {
        // Arrange
        String requestJson = """
            {
                "title": "Test Transaction",
                "description": "Test Description",
                "amount": 100.50,
                "type": "EXPENSE",
                "category": "Food",
                "transactionDate": "2024-10-16T10:00:00"
            }
            """;

        // Act & Assert
        mockMvc.perform(post("/api/transactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isForbidden());
    }

    @Test
    void getUserTransactions_WithValidToken_ShouldReturnTransactions() throws Exception {
        // Arrange - Create a test transaction
        Transaction transaction = new Transaction();
        transaction.setUser(testUser);
        transaction.setTitle("Test Transaction");
        transaction.setDescription("Test Description");
        transaction.setAmount(new BigDecimal("100.50"));
        transaction.setType(Transaction.TransactionType.EXPENSE);
        transaction.setCategory("Food");
        transaction.setTransactionDate(LocalDateTime.now());
        transactionRepository.save(transaction);

        // Act & Assert
        mockMvc.perform(get("/api/transactions")
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].title").value("Test Transaction"))
                .andExpect(jsonPath("$[0].amount").value(100.50));
    }

    @Test
    void getTransactionById_WithValidId_ShouldReturnTransaction() throws Exception {
        // Arrange - Create a test transaction
        Transaction transaction = new Transaction();
        transaction.setUser(testUser);
        transaction.setTitle("Test Transaction");
        transaction.setDescription("Test Description");
        transaction.setAmount(new BigDecimal("100.50"));
        transaction.setType(Transaction.TransactionType.EXPENSE);
        transaction.setCategory("Food");
        transaction.setTransactionDate(LocalDateTime.now());
        transaction = transactionRepository.save(transaction);

        // Act & Assert
        mockMvc.perform(get("/api/transactions/" + transaction.getId())
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Test Transaction"))
                .andExpect(jsonPath("$.amount").value(100.50));
    }

    @Test
    void getTransactionById_WithInvalidId_ShouldReturnNotFound() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/transactions/999")
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateTransaction_WithValidData_ShouldReturnUpdatedTransaction() throws Exception {
        // Arrange - Create a test transaction
        Transaction transaction = new Transaction();
        transaction.setUser(testUser);
        transaction.setTitle("Original Transaction");
        transaction.setDescription("Original Description");
        transaction.setAmount(new BigDecimal("50.00"));
        transaction.setType(Transaction.TransactionType.EXPENSE);
        transaction.setCategory("Food");
        transaction.setTransactionDate(LocalDateTime.now());
        transaction = transactionRepository.save(transaction);

        String updateRequestJson = """
            {
                "title": "Updated Transaction",
                "description": "Updated Description",
                "amount": 75.00,
                "type": "INCOME",
                "category": "Salary",
                "transactionDate": "2024-10-16T12:00:00"
            }
            """;

        // Act & Assert
        mockMvc.perform(put("/api/transactions/" + transaction.getId())
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(updateRequestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Transaction"))
                .andExpect(jsonPath("$.amount").value(75.00))
                .andExpect(jsonPath("$.type").value("INCOME"));
    }

    @Test
    void deleteTransaction_WithValidId_ShouldReturnOk() throws Exception {
        // Arrange - Create a test transaction
        Transaction transaction = new Transaction();
        transaction.setUser(testUser);
        transaction.setTitle("Test Transaction");
        transaction.setDescription("Test Description");
        transaction.setAmount(new BigDecimal("100.50"));
        transaction.setType(Transaction.TransactionType.EXPENSE);
        transaction.setCategory("Food");
        transaction.setTransactionDate(LocalDateTime.now());
        transaction = transactionRepository.save(transaction);

        // Act & Assert
        mockMvc.perform(delete("/api/transactions/" + transaction.getId())
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk());

        // Verify transaction is deleted
        mockMvc.perform(get("/api/transactions/" + transaction.getId())
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void getFinancialSummary_WithTransactions_ShouldReturnSummary() throws Exception {
        // Arrange - Create test transactions
        Transaction income = new Transaction();
        income.setUser(testUser);
        income.setTitle("Salary");
        income.setAmount(new BigDecimal("1000.00"));
        income.setType(Transaction.TransactionType.INCOME);
        income.setCategory("Salary");
        income.setTransactionDate(LocalDateTime.now());
        transactionRepository.save(income);

        Transaction expense = new Transaction();
        expense.setUser(testUser);
        expense.setTitle("Groceries");
        expense.setAmount(new BigDecimal("200.00"));
        expense.setType(Transaction.TransactionType.EXPENSE);
        expense.setCategory("Food");
        expense.setTransactionDate(LocalDateTime.now());
        transactionRepository.save(expense);

        // Act & Assert
        mockMvc.perform(get("/api/transactions/summary")
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalIncome").value(1000.00))
                .andExpect(jsonPath("$.totalExpenses").value(200.00))
                .andExpect(jsonPath("$.balance").value(800.00))
                .andExpect(jsonPath("$.transactionCount").value(2));
    }
}