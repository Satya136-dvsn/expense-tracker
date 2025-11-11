package com.budgettracker.service;

import com.budgettracker.dto.InvestmentRequest;
import com.budgettracker.dto.InvestmentResponse;
import com.budgettracker.model.Investment;
import com.budgettracker.model.Investment.InvestmentType;
import com.budgettracker.model.User;
import com.budgettracker.repository.InvestmentRepository;
import com.budgettracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class InvestmentService {
    
    @Autowired
    private InvestmentRepository investmentRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private MarketDataService marketDataService;
    
    public List<InvestmentResponse> getAllInvestments(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        List<Investment> investments = investmentRepository.findByUserIdOrderByPurchaseDateDesc(user.getId());
        return investments.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public List<InvestmentResponse> getInvestmentsByType(String username, InvestmentType type) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        List<Investment> investments = investmentRepository.findByUserIdAndTypeOrderByPurchaseDateDesc(user.getId(), type);
        return investments.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public InvestmentResponse getInvestmentById(String username, Long investmentId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        Investment investment = investmentRepository.findById(investmentId)
                .orElseThrow(() -> new RuntimeException("Investment not found"));
        
        if (!investment.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Investment not found");
        }
        
        return convertToResponse(investment);
    }
    
    public InvestmentResponse createInvestment(String username, InvestmentRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        Investment investment = new Investment();
        investment.setUser(user);
        investment.setSymbol(request.getSymbol().toUpperCase());
        investment.setName(request.getName());
        investment.setType(request.getType());
        investment.setQuantity(request.getQuantity());
        investment.setPurchasePrice(request.getPurchasePrice());
        investment.setPurchaseDate(request.getPurchaseDate());
        investment.setBrokerage(request.getBrokerage());
        investment.setNotes(request.getNotes());
        
        Investment savedInvestment = investmentRepository.save(investment);
        return convertToResponse(savedInvestment);
    }
    
    public InvestmentResponse updateInvestment(String username, Long investmentId, InvestmentRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        Investment investment = investmentRepository.findById(investmentId)
                .orElseThrow(() -> new RuntimeException("Investment not found"));
        
        if (!investment.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Investment not found");
        }
        
        investment.setSymbol(request.getSymbol().toUpperCase());
        investment.setName(request.getName());
        investment.setType(request.getType());
        investment.setQuantity(request.getQuantity());
        investment.setPurchasePrice(request.getPurchasePrice());
        investment.setPurchaseDate(request.getPurchaseDate());
        investment.setBrokerage(request.getBrokerage());
        investment.setNotes(request.getNotes());
        
        Investment updatedInvestment = investmentRepository.save(investment);
        return convertToResponse(updatedInvestment);
    }
    
    public void deleteInvestment(String username, Long investmentId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        Investment investment = investmentRepository.findById(investmentId)
                .orElseThrow(() -> new RuntimeException("Investment not found"));
        
        if (!investment.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Investment not found");
        }
        
        investmentRepository.delete(investment);
    }
    
    public BigDecimal getTotalPortfolioValue(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        return investmentRepository.calculateTotalPortfolioValue(user.getId());
    }
    
    public BigDecimal getTotalCostBasis(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        return investmentRepository.calculateTotalCostBasis(user.getId());
    }
    
    public Map<InvestmentType, BigDecimal> getPortfolioAllocation(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        List<Object[]> results = investmentRepository.getPortfolioAllocationByType(user.getId());
        return results.stream()
                .collect(Collectors.toMap(
                    result -> (InvestmentType) result[0],
                    result -> (BigDecimal) result[1]
                ));
    }
    
    public List<InvestmentResponse> getInvestmentsByDateRange(String username, LocalDate startDate, LocalDate endDate) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        List<Investment> investments = investmentRepository
                .findByUserIdAndPurchaseDateBetweenOrderByPurchaseDateDesc(user.getId(), startDate, endDate);
        return investments.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public List<InvestmentResponse> getTopPerformingInvestments(String username, int limit) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        List<Investment> investments = investmentRepository.findTopPerformingInvestments(user.getId());
        return investments.stream()
                .limit(limit)
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public List<InvestmentResponse> getWorstPerformingInvestments(String username, int limit) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        List<Investment> investments = investmentRepository.findWorstPerformingInvestments(user.getId());
        return investments.stream()
                .limit(limit)
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public List<String> getUserBrokerages(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        return investmentRepository.findDistinctBrokeragesByUserId(user.getId());
    }
    
    public List<String> getUserSymbols(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        return investmentRepository.findDistinctSymbolsByUserId(user.getId());
    }
    
    public void refreshInvestmentPrice(String username, Long investmentId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        Investment investment = investmentRepository.findById(investmentId)
                .orElseThrow(() -> new RuntimeException("Investment not found"));
        
        if (!investment.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Investment not found");
        }
        
        marketDataService.updateInvestmentPrice(investmentId);
    }
    
    public void refreshAllUserInvestmentPrices(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        marketDataService.updateUserInvestmentPrices(user.getId());
    }
    
    public BigDecimal getCurrentMarketPrice(String symbol) {
        return marketDataService.getCurrentPrice(symbol);
    }
    
    public Map<String, Object> getMarketQuote(String symbol) {
        return marketDataService.getQuote(symbol);
    }
    
    private InvestmentResponse convertToResponse(Investment investment) {
        InvestmentResponse response = new InvestmentResponse();
        response.setId(investment.getId());
        response.setSymbol(investment.getSymbol());
        response.setName(investment.getName());
        response.setType(investment.getType());
        response.setQuantity(investment.getQuantity());
        response.setPurchasePrice(investment.getPurchasePrice());
        response.setPurchaseDate(investment.getPurchaseDate());
        response.setCurrentPrice(investment.getCurrentPrice());
        response.setLastPriceUpdate(investment.getLastPriceUpdate());
        response.setBrokerage(investment.getBrokerage());
        response.setNotes(investment.getNotes());
        response.setCreatedAt(investment.getCreatedAt());
        response.setUpdatedAt(investment.getUpdatedAt());
        
        // Set calculated fields
        response.setTotalCost(investment.getTotalCost());
        response.setCurrentValue(investment.getCurrentValue());
        response.setGainLoss(investment.getGainLoss());
        response.setGainLossPercentage(investment.getGainLossPercentage());
        
        return response;
    }
}