package com.budgettracker.service;

import com.budgettracker.dto.InvestmentRequest;
import com.budgettracker.dto.InvestmentResponse;
import com.budgettracker.model.Investment;
import com.budgettracker.model.Investment.InvestmentType;
import com.budgettracker.model.User;
import com.budgettracker.repository.InvestmentRepository;
import com.budgettracker.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvestmentServiceTest {

    @Mock
    private InvestmentRepository investmentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private MarketDataService marketDataService;

    @InjectMocks
    private InvestmentService investmentService;

    private User testUser;
    private Investment testInvestment;
    private InvestmentRequest testRequest;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");

        testInvestment = new Investment();
        testInvestment.setId(1L);
        testInvestment.setUser(testUser);
        testInvestment.setSymbol("AAPL");
        testInvestment.setName("Apple Inc.");
        testInvestment.setType(InvestmentType.STOCK);
        testInvestment.setQuantity(new BigDecimal("10"));
        testInvestment.setPurchasePrice(new BigDecimal("150.00"));
        testInvestment.setPurchaseDate(LocalDate.now().minusDays(30));
        testInvestment.setCurrentPrice(new BigDecimal("160.00"));
        testInvestment.setLastPriceUpdate(LocalDateTime.now());
        testInvestment.setCreatedAt(LocalDateTime.now());
        testInvestment.setUpdatedAt(LocalDateTime.now());

        testRequest = new InvestmentRequest();
        testRequest.setSymbol("AAPL");
        testRequest.setName("Apple Inc.");
        testRequest.setType(InvestmentType.STOCK);
        testRequest.setQuantity(new BigDecimal("10"));
        testRequest.setPurchasePrice(new BigDecimal("150.00"));
        testRequest.setPurchaseDate(LocalDate.now().minusDays(30));
    }

    @Test
    void getAllInvestments_ShouldReturnInvestmentList() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(investmentRepository.findByUserIdOrderByPurchaseDateDesc(1L))
                .thenReturn(Arrays.asList(testInvestment));

        // Act
        List<InvestmentResponse> result = investmentService.getAllInvestments("testuser");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("AAPL", result.get(0).getSymbol());
        assertEquals("Apple Inc.", result.get(0).getName());
        assertEquals(InvestmentType.STOCK, result.get(0).getType());
    }

    @Test
    void getAllInvestments_UserNotFound_ShouldThrowException() {
        // Arrange
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> investmentService.getAllInvestments("nonexistent"));
        assertEquals("User not found: nonexistent", exception.getMessage());
    }

    @Test
    void createInvestment_ShouldCreateAndReturnInvestment() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(investmentRepository.save(any(Investment.class))).thenReturn(testInvestment);

        // Act
        InvestmentResponse result = investmentService.createInvestment("testuser", testRequest);

        // Assert
        assertNotNull(result);
        assertEquals("AAPL", result.getSymbol());
        assertEquals("Apple Inc.", result.getName());
        assertEquals(InvestmentType.STOCK, result.getType());
        assertEquals(new BigDecimal("10"), result.getQuantity());
        assertEquals(new BigDecimal("150.00"), result.getPurchasePrice());
        
        verify(investmentRepository).save(any(Investment.class));
    }

    @Test
    void updateInvestment_ShouldUpdateAndReturnInvestment() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(investmentRepository.findById(1L)).thenReturn(Optional.of(testInvestment));
        when(investmentRepository.save(any(Investment.class))).thenReturn(testInvestment);

        testRequest.setQuantity(new BigDecimal("15"));
        testRequest.setPurchasePrice(new BigDecimal("155.00"));

        // Act
        InvestmentResponse result = investmentService.updateInvestment("testuser", 1L, testRequest);

        // Assert
        assertNotNull(result);
        verify(investmentRepository).save(any(Investment.class));
    }

    @Test
    void updateInvestment_InvestmentNotFound_ShouldThrowException() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(investmentRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> investmentService.updateInvestment("testuser", 999L, testRequest));
        assertEquals("Investment not found", exception.getMessage());
    }

    @Test
    void updateInvestment_WrongUser_ShouldThrowException() {
        // Arrange
        User otherUser = new User();
        otherUser.setId(2L);
        otherUser.setUsername("otheruser");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        
        Investment otherInvestment = new Investment();
        otherInvestment.setId(1L);
        otherInvestment.setUser(otherUser);
        
        when(investmentRepository.findById(1L)).thenReturn(Optional.of(otherInvestment));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> investmentService.updateInvestment("testuser", 1L, testRequest));
        assertEquals("Investment not found", exception.getMessage());
    }

    @Test
    void deleteInvestment_ShouldDeleteInvestment() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(investmentRepository.findById(1L)).thenReturn(Optional.of(testInvestment));

        // Act
        investmentService.deleteInvestment("testuser", 1L);

        // Assert
        verify(investmentRepository).delete(testInvestment);
    }

    @Test
    void getTotalPortfolioValue_ShouldReturnCorrectValue() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(investmentRepository.calculateTotalPortfolioValue(1L))
                .thenReturn(new BigDecimal("1600.00"));

        // Act
        BigDecimal result = investmentService.getTotalPortfolioValue("testuser");

        // Assert
        assertEquals(new BigDecimal("1600.00"), result);
    }

    @Test
    void getTotalCostBasis_ShouldReturnCorrectValue() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(investmentRepository.calculateTotalCostBasis(1L))
                .thenReturn(new BigDecimal("1500.00"));

        // Act
        BigDecimal result = investmentService.getTotalCostBasis("testuser");

        // Assert
        assertEquals(new BigDecimal("1500.00"), result);
    }

    @Test
    void getInvestmentsByType_ShouldReturnFilteredList() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(investmentRepository.findByUserIdAndTypeOrderByPurchaseDateDesc(1L, InvestmentType.STOCK))
                .thenReturn(Arrays.asList(testInvestment));

        // Act
        List<InvestmentResponse> result = investmentService.getInvestmentsByType("testuser", InvestmentType.STOCK);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(InvestmentType.STOCK, result.get(0).getType());
    }

    @Test
    void getInvestmentById_ShouldReturnInvestment() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(investmentRepository.findById(1L)).thenReturn(Optional.of(testInvestment));

        // Act
        InvestmentResponse result = investmentService.getInvestmentById("testuser", 1L);

        // Assert
        assertNotNull(result);
        assertEquals("AAPL", result.getSymbol());
        assertEquals(1L, result.getId());
    }

    @Test
    void refreshInvestmentPrice_ShouldCallMarketDataService() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(investmentRepository.findById(1L)).thenReturn(Optional.of(testInvestment));

        // Act
        investmentService.refreshInvestmentPrice("testuser", 1L);

        // Assert
        verify(marketDataService).updateInvestmentPrice(1L);
    }

    @Test
    void refreshAllUserInvestmentPrices_ShouldCallMarketDataService() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // Act
        investmentService.refreshAllUserInvestmentPrices("testuser");

        // Assert
        verify(marketDataService).updateUserInvestmentPrices(1L);
    }
}