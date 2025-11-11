package com.budgettracker.service;

import com.budgettracker.dto.TransactionRequest;
import com.budgettracker.dto.TransactionResponse;
import com.budgettracker.model.Transaction;
import com.budgettracker.model.User;
import com.budgettracker.repository.TransactionRepository;
import com.budgettracker.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TransactionService transactionService;

    private User testUser;
    private TransactionRequest validRequest;
    private Transaction savedTransaction;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");

        validRequest = new TransactionRequest();
        validRequest.setTitle("Test Transaction");
        validRequest.setDescription("Test Description");
        validRequest.setAmount(new BigDecimal("100.50"));
        validRequest.setType(Transaction.TransactionType.EXPENSE);
        validRequest.setCategory("Food");
        validRequest.setTransactionDate(LocalDateTime.now());

        savedTransaction = new Transaction();
        savedTransaction.setId(1L);
        savedTransaction.setUser(testUser);
        savedTransaction.setTitle("Test Transaction");
        savedTransaction.setDescription("Test Description");
        savedTransaction.setAmount(new BigDecimal("100.50"));
        savedTransaction.setType(Transaction.TransactionType.EXPENSE);
        savedTransaction.setCategory("Food");
        savedTransaction.setTransactionDate(LocalDateTime.now());
        savedTransaction.setCreatedAt(LocalDateTime.now());
        savedTransaction.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    void createTransaction_WithValidData_ShouldReturnTransactionResponse() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(transactionRepository.save(any(Transaction.class))).thenReturn(savedTransaction);

        // Act
        TransactionResponse response = transactionService.createTransaction(validRequest, "testuser");

        // Assert
        assertNotNull(response);
        assertEquals("Test Transaction", response.getTitle());
        assertEquals(new BigDecimal("100.50"), response.getAmount());
        assertEquals(Transaction.TransactionType.EXPENSE, response.getType());
        assertEquals("Food", response.getCategory());
        
        verify(userRepository).findByUsername("testuser");
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    void createTransaction_WithNullTitle_ShouldThrowException() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        validRequest.setTitle(null);

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, 
            () -> transactionService.createTransaction(validRequest, "testuser"));
        
        assertEquals("Transaction title is required", exception.getMessage());
        verify(transactionRepository, never()).save(any(Transaction.class));
    }

    @Test
    void createTransaction_WithEmptyTitle_ShouldThrowException() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        validRequest.setTitle("   ");

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, 
            () -> transactionService.createTransaction(validRequest, "testuser"));
        
        assertEquals("Transaction title is required", exception.getMessage());
        verify(transactionRepository, never()).save(any(Transaction.class));
    }

    @Test
    void createTransaction_WithNullAmount_ShouldThrowException() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        validRequest.setAmount(null);

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, 
            () -> transactionService.createTransaction(validRequest, "testuser"));
        
        assertEquals("Transaction amount must be greater than zero", exception.getMessage());
        verify(transactionRepository, never()).save(any(Transaction.class));
    }

    @Test
    void createTransaction_WithZeroAmount_ShouldThrowException() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        validRequest.setAmount(BigDecimal.ZERO);

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, 
            () -> transactionService.createTransaction(validRequest, "testuser"));
        
        assertEquals("Transaction amount must be greater than zero", exception.getMessage());
        verify(transactionRepository, never()).save(any(Transaction.class));
    }

    @Test
    void createTransaction_WithNegativeAmount_ShouldThrowException() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        validRequest.setAmount(new BigDecimal("-10.00"));

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, 
            () -> transactionService.createTransaction(validRequest, "testuser"));
        
        assertEquals("Transaction amount must be greater than zero", exception.getMessage());
        verify(transactionRepository, never()).save(any(Transaction.class));
    }

    @Test
    void createTransaction_WithNullType_ShouldThrowException() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        validRequest.setType(null);

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, 
            () -> transactionService.createTransaction(validRequest, "testuser"));
        
        assertEquals("Transaction type is required", exception.getMessage());
        verify(transactionRepository, never()).save(any(Transaction.class));
    }

    @Test
    void createTransaction_WithNullCategory_ShouldThrowException() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        validRequest.setCategory(null);

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, 
            () -> transactionService.createTransaction(validRequest, "testuser"));
        
        assertEquals("Transaction category is required", exception.getMessage());
        verify(transactionRepository, never()).save(any(Transaction.class));
    }

    @Test
    void createTransaction_WithEmptyCategory_ShouldThrowException() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        validRequest.setCategory("   ");

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, 
            () -> transactionService.createTransaction(validRequest, "testuser"));
        
        assertEquals("Transaction category is required", exception.getMessage());
        verify(transactionRepository, never()).save(any(Transaction.class));
    }

    @Test
    void createTransaction_WithNullTransactionDate_ShouldThrowException() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        validRequest.setTransactionDate(null);

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, 
            () -> transactionService.createTransaction(validRequest, "testuser"));
        
        assertEquals("Transaction date is required", exception.getMessage());
        verify(transactionRepository, never()).save(any(Transaction.class));
    }

    @Test
    void createTransaction_WithNonExistentUser_ShouldThrowException() {
        // Arrange
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> transactionService.createTransaction(validRequest, "nonexistent"));
        
        assertEquals("User not found: nonexistent", exception.getMessage());
        verify(transactionRepository, never()).save(any(Transaction.class));
    }

    @Test
    void createTransaction_WithTitleTrimming_ShouldTrimWhitespace() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(transactionRepository.save(any(Transaction.class))).thenReturn(savedTransaction);
        validRequest.setTitle("  Test Transaction  ");
        validRequest.setCategory("  Food  ");
        validRequest.setDescription("  Test Description  ");

        // Act
        TransactionResponse response = transactionService.createTransaction(validRequest, "testuser");

        // Assert
        assertNotNull(response);
        verify(transactionRepository).save(argThat(transaction -> 
            "Test Transaction".equals(transaction.getTitle()) &&
            "Food".equals(transaction.getCategory()) &&
            "Test Description".equals(transaction.getDescription())
        ));
    }

    @Test
    void updateTransaction_WithValidData_ShouldReturnUpdatedTransaction() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(transactionRepository.findById(1L)).thenReturn(Optional.of(savedTransaction));
        when(transactionRepository.save(any(Transaction.class))).thenReturn(savedTransaction);

        TransactionRequest updateRequest = new TransactionRequest();
        updateRequest.setTitle("Updated Transaction");
        updateRequest.setDescription("Updated Description");
        updateRequest.setAmount(new BigDecimal("200.00"));
        updateRequest.setType(Transaction.TransactionType.INCOME);
        updateRequest.setCategory("Salary");
        updateRequest.setTransactionDate(LocalDateTime.now());

        // Act
        TransactionResponse response = transactionService.updateTransaction(1L, updateRequest, "testuser");

        // Assert
        assertNotNull(response);
        verify(userRepository).findByUsername("testuser");
        verify(transactionRepository).findById(1L);
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    void updateTransaction_WithNonExistentTransaction_ShouldThrowException() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(transactionRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> transactionService.updateTransaction(999L, validRequest, "testuser"));
        
        assertEquals("Transaction not found or access denied for ID: 999", exception.getMessage());
        verify(transactionRepository, never()).save(any(Transaction.class));
    }
}