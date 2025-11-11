package com.budgettracker.service;

import com.budgettracker.dto.SavingsGoalRequest;
import com.budgettracker.dto.SavingsGoalResponse;
import com.budgettracker.model.SavingsGoal;
import com.budgettracker.model.User;
import com.budgettracker.repository.SavingsGoalRepository;
import com.budgettracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class SavingsGoalService {
    
    @Autowired
    private SavingsGoalRepository savingsGoalRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    // Create new savings goal
    public SavingsGoalResponse createSavingsGoal(SavingsGoalRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        SavingsGoal goal = new SavingsGoal(user, request.getName(), request.getDescription(),
                request.getTargetAmount(), request.getTargetDate());
        
        SavingsGoal savedGoal = savingsGoalRepository.save(goal);
        return new SavingsGoalResponse(savedGoal);
    }
    
    // Get all savings goals for user
    public List<SavingsGoalResponse> getUserSavingsGoals(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<SavingsGoal> goals = savingsGoalRepository.findByUserOrderByCreatedAtDesc(user);
        return goals.stream()
                .map(SavingsGoalResponse::new)
                .collect(Collectors.toList());
    }
    
    // Get active savings goals (IN_PROGRESS)
    public List<SavingsGoalResponse> getActiveSavingsGoals(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<SavingsGoal> goals = savingsGoalRepository.findByUserAndStatus(user, SavingsGoal.GoalStatus.IN_PROGRESS);
        return goals.stream()
                .map(SavingsGoalResponse::new)
                .collect(Collectors.toList());
    }
    
    // Get savings goals by status
    public List<SavingsGoalResponse> getSavingsGoalsByStatus(String status, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        SavingsGoal.GoalStatus goalStatus;
        try {
            goalStatus = SavingsGoal.GoalStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + status);
        }
        
        List<SavingsGoal> goals = savingsGoalRepository.findByUserAndStatusOrderByCreatedAtDesc(user, goalStatus);
        return goals.stream()
                .map(SavingsGoalResponse::new)
                .collect(Collectors.toList());
    }
    
    // Get savings goal by ID
    public Optional<SavingsGoalResponse> getSavingsGoalById(Long id, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return savingsGoalRepository.findByUserAndId(user, id)
                .map(SavingsGoalResponse::new);
    }
    
    // Update savings goal
    public SavingsGoalResponse updateSavingsGoal(Long id, SavingsGoalRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        SavingsGoal goal = savingsGoalRepository.findByUserAndId(user, id)
                .orElseThrow(() -> new RuntimeException("Savings goal not found"));
        
        goal.setName(request.getName());
        goal.setDescription(request.getDescription());
        goal.setTargetAmount(request.getTargetAmount());
        goal.setTargetDate(request.getTargetDate());
        
        SavingsGoal updatedGoal = savingsGoalRepository.save(goal);
        return new SavingsGoalResponse(updatedGoal);
    }
    
    // Update savings goal progress (add/remove amount)
    public SavingsGoalResponse updateProgress(Long id, BigDecimal amount, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        SavingsGoal goal = savingsGoalRepository.findByUserAndId(user, id)
                .orElseThrow(() -> new RuntimeException("Savings goal not found"));
        
        BigDecimal newAmount = goal.getCurrentAmount().add(amount);
        
        // Prevent negative amounts
        if (newAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Current amount cannot be negative");
        }
        
        goal.setCurrentAmount(newAmount);
        
        // Check if goal is completed
        if (goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0 
                && goal.getStatus() == SavingsGoal.GoalStatus.IN_PROGRESS) {
            goal.setStatus(SavingsGoal.GoalStatus.COMPLETED);
            goal.setCompletedAt(LocalDateTime.now());
        }
        
        SavingsGoal updatedGoal = savingsGoalRepository.save(goal);
        return new SavingsGoalResponse(updatedGoal);
    }
    
    // Set current amount directly
    public SavingsGoalResponse setCurrentAmount(Long id, BigDecimal currentAmount, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        SavingsGoal goal = savingsGoalRepository.findByUserAndId(user, id)
                .orElseThrow(() -> new RuntimeException("Savings goal not found"));
        
        if (currentAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Current amount cannot be negative");
        }
        
        goal.setCurrentAmount(currentAmount);
        
        // Check if goal is completed
        if (goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0
                && goal.getStatus() == SavingsGoal.GoalStatus.IN_PROGRESS) {
            goal.setStatus(SavingsGoal.GoalStatus.COMPLETED);
            goal.setCompletedAt(LocalDateTime.now());
        } else if (goal.getCurrentAmount().compareTo(goal.getTargetAmount()) < 0
                && goal.getStatus() == SavingsGoal.GoalStatus.COMPLETED) {
            // Reopen goal if amount decreased below target
            goal.setStatus(SavingsGoal.GoalStatus.IN_PROGRESS);
            goal.setCompletedAt(null);
        }
        
        SavingsGoal updatedGoal = savingsGoalRepository.save(goal);
        return new SavingsGoalResponse(updatedGoal);
    }
    
    // Mark goal as completed
    public SavingsGoalResponse completeGoal(Long id, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        SavingsGoal goal = savingsGoalRepository.findByUserAndId(user, id)
                .orElseThrow(() -> new RuntimeException("Savings goal not found"));
        
        goal.setStatus(SavingsGoal.GoalStatus.COMPLETED);
        goal.setCompletedAt(LocalDateTime.now());
        
        SavingsGoal updatedGoal = savingsGoalRepository.save(goal);
        return new SavingsGoalResponse(updatedGoal);
    }
    
    // Mark goal as cancelled
    public SavingsGoalResponse cancelGoal(Long id, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        SavingsGoal goal = savingsGoalRepository.findByUserAndId(user, id)
                .orElseThrow(() -> new RuntimeException("Savings goal not found"));
        
        goal.setStatus(SavingsGoal.GoalStatus.CANCELLED);
        
        SavingsGoal updatedGoal = savingsGoalRepository.save(goal);
        return new SavingsGoalResponse(updatedGoal);
    }
    
    // Reopen goal (set back to IN_PROGRESS)
    public SavingsGoalResponse reopenGoal(Long id, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        SavingsGoal goal = savingsGoalRepository.findByUserAndId(user, id)
                .orElseThrow(() -> new RuntimeException("Savings goal not found"));
        
        goal.setStatus(SavingsGoal.GoalStatus.IN_PROGRESS);
        goal.setCompletedAt(null);
        
        SavingsGoal updatedGoal = savingsGoalRepository.save(goal);
        return new SavingsGoalResponse(updatedGoal);
    }
    
    // Delete savings goal
    public void deleteSavingsGoal(Long id, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        SavingsGoal goal = savingsGoalRepository.findByUserAndId(user, id)
                .orElseThrow(() -> new RuntimeException("Savings goal not found"));
        
        savingsGoalRepository.delete(goal);
    }
}
