package com.budgettracker.service;

import com.budgettracker.dto.DebtRequest;
import com.budgettracker.dto.DebtResponse;
import com.budgettracker.model.Debt;
import com.budgettracker.model.User;
import com.budgettracker.repository.DebtRepository;
import com.budgettracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class DebtService {
    
    @Autowired
    private DebtRepository debtRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    // Create new debt
    public DebtResponse createDebt(DebtRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Debt debt = new Debt(user, request.getName(), request.getDescription(),
                request.getType(), request.getCurrentBalance(), 
                request.getInterestRate(), request.getMinimumPayment());
        
        // Set optional fields
        if (request.getOriginalBalance() != null) {
            debt.setOriginalBalance(request.getOriginalBalance());
        } else {
            debt.setOriginalBalance(request.getCurrentBalance());
        }
        
        debt.setDueDate(request.getDueDate());
        debt.setPaymentStartDate(request.getPaymentStartDate());
        
        Debt savedDebt = debtRepository.save(debt);
        return new DebtResponse(savedDebt);
    }
    
    // Get all debts for user
    public List<DebtResponse> getUserDebts(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Debt> debts = debtRepository.findByUserOrderByCreatedAtDesc(user);
        return debts.stream()
                .map(DebtResponse::new)
                .collect(Collectors.toList());
    }
    
    // Get active debts (ACTIVE status)
    public List<DebtResponse> getActiveDebts(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Debt> debts = debtRepository.findByUserAndStatus(user, Debt.DebtStatus.ACTIVE);
        return debts.stream()
                .map(DebtResponse::new)
                .collect(Collectors.toList());
    }
    
    // Get debts by status
    public List<DebtResponse> getDebtsByStatus(String status, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Debt.DebtStatus debtStatus;
        try {
            debtStatus = Debt.DebtStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + status);
        }
        
        List<Debt> debts = debtRepository.findByUserAndStatusOrderByCreatedAtDesc(user, debtStatus);
        return debts.stream()
                .map(DebtResponse::new)
                .collect(Collectors.toList());
    }
    
    // Get debt by ID
    public Optional<DebtResponse> getDebtById(Long id, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return debtRepository.findByUserAndId(user, id)
                .map(DebtResponse::new);
    }
    
    // Update debt
    public DebtResponse updateDebt(Long id, DebtRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Debt debt = debtRepository.findByUserAndId(user, id)
                .orElseThrow(() -> new RuntimeException("Debt not found"));
        
        debt.setName(request.getName());
        debt.setDescription(request.getDescription());
        debt.setType(request.getType());
        debt.setCurrentBalance(request.getCurrentBalance());
        debt.setInterestRate(request.getInterestRate());
        debt.setMinimumPayment(request.getMinimumPayment());
        debt.setDueDate(request.getDueDate());
        debt.setPaymentStartDate(request.getPaymentStartDate());
        
        if (request.getOriginalBalance() != null) {
            debt.setOriginalBalance(request.getOriginalBalance());
        }
        
        Debt updatedDebt = debtRepository.save(debt);
        return new DebtResponse(updatedDebt);
    }
    
    // Update debt balance
    public DebtResponse updateBalance(Long id, BigDecimal newBalance, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Debt debt = debtRepository.findByUserAndId(user, id)
                .orElseThrow(() -> new RuntimeException("Debt not found"));
        
        if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Debt balance cannot be negative");
        }
        
        debt.setCurrentBalance(newBalance);
        
        // Check if debt is paid off
        if (newBalance.compareTo(BigDecimal.ZERO) == 0 && debt.getStatus() == Debt.DebtStatus.ACTIVE) {
            debt.setStatus(Debt.DebtStatus.PAID_OFF);
            debt.setPaidOffAt(LocalDateTime.now());
        } else if (newBalance.compareTo(BigDecimal.ZERO) > 0 && debt.getStatus() == Debt.DebtStatus.PAID_OFF) {
            // Reopen debt if balance increased
            debt.setStatus(Debt.DebtStatus.ACTIVE);
            debt.setPaidOffAt(null);
        }
        
        Debt updatedDebt = debtRepository.save(debt);
        return new DebtResponse(updatedDebt);
    }
    
    // Make payment (reduce balance)
    public DebtResponse makePayment(Long id, BigDecimal paymentAmount, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Debt debt = debtRepository.findByUserAndId(user, id)
                .orElseThrow(() -> new RuntimeException("Debt not found"));
        
        if (paymentAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Payment amount must be greater than zero");
        }
        
        BigDecimal newBalance = debt.getCurrentBalance().subtract(paymentAmount);
        
        // Don't allow negative balance
        if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
            newBalance = BigDecimal.ZERO;
        }
        
        return updateBalance(id, newBalance, username);
    }
    
    // Mark debt as paid off
    public DebtResponse markAsPaidOff(Long id, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Debt debt = debtRepository.findByUserAndId(user, id)
                .orElseThrow(() -> new RuntimeException("Debt not found"));
        
        debt.setCurrentBalance(BigDecimal.ZERO);
        debt.setStatus(Debt.DebtStatus.PAID_OFF);
        debt.setPaidOffAt(LocalDateTime.now());
        
        Debt updatedDebt = debtRepository.save(debt);
        return new DebtResponse(updatedDebt);
    }
    
    // Reactivate debt
    public DebtResponse reactivateDebt(Long id, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Debt debt = debtRepository.findByUserAndId(user, id)
                .orElseThrow(() -> new RuntimeException("Debt not found"));
        
        debt.setStatus(Debt.DebtStatus.ACTIVE);
        debt.setPaidOffAt(null);
        
        Debt updatedDebt = debtRepository.save(debt);
        return new DebtResponse(updatedDebt);
    }
    
    // Delete debt
    public void deleteDebt(Long id, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Debt debt = debtRepository.findByUserAndId(user, id)
                .orElseThrow(() -> new RuntimeException("Debt not found"));
        
        debtRepository.delete(debt);
    }
    
    // Get debt summary statistics
    public Map<String, Object> getDebtSummary(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Map<String, Object> summary = new HashMap<>();
        
        BigDecimal totalActiveDebt = debtRepository.getTotalActiveDebt(user);
        BigDecimal totalMinimumPayments = debtRepository.getTotalMinimumPayments(user);
        BigDecimal averageInterestRate = debtRepository.getWeightedAverageInterestRate(user);
        long activeDebtCount = debtRepository.countByUserAndStatus(user, Debt.DebtStatus.ACTIVE);
        long totalDebtCount = debtRepository.countByUser(user);
        
        summary.put("totalActiveDebt", totalActiveDebt);
        summary.put("totalMinimumPayments", totalMinimumPayments);
        summary.put("averageInterestRate", averageInterestRate);
        summary.put("activeDebtCount", activeDebtCount);
        summary.put("totalDebtCount", totalDebtCount);
        
        // Get debt breakdown by type
        List<Object[]> debtByType = debtRepository.getDebtSummaryByType(user);
        Map<String, Map<String, Object>> debtBreakdown = new HashMap<>();
        
        for (Object[] row : debtByType) {
            String type = ((Debt.DebtType) row[0]).name();
            Long count = (Long) row[1];
            BigDecimal totalBalance = (BigDecimal) row[2];
            BigDecimal avgRate = (BigDecimal) row[3];
            
            Map<String, Object> typeData = new HashMap<>();
            typeData.put("count", count);
            typeData.put("totalBalance", totalBalance);
            typeData.put("averageRate", avgRate);
            
            debtBreakdown.put(type, typeData);
        }
        
        summary.put("debtBreakdown", debtBreakdown);
        
        return summary;
    }
}