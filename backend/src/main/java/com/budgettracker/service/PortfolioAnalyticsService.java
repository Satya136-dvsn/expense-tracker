package com.budgettracker.service;

import com.budgettracker.model.Investment;
import com.budgettracker.model.Investment.InvestmentType;
import com.budgettracker.model.User;
import com.budgettracker.repository.InvestmentRepository;
import com.budgettracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PortfolioAnalyticsService {
    
    @Autowired
    private InvestmentRepository investmentRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public Map<String, Object> getPortfolioPerformance(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        List<Investment> investments = investmentRepository.findByUserIdOrderByPurchaseDateDesc(user.getId());
        
        Map<String, Object> performance = new HashMap<>();
        
        BigDecimal totalCostBasis = BigDecimal.ZERO;
        BigDecimal totalCurrentValue = BigDecimal.ZERO;
        
        for (Investment investment : investments) {
            totalCostBasis = totalCostBasis.add(investment.getTotalCost());
            totalCurrentValue = totalCurrentValue.add(investment.getCurrentValue());
        }
        
        BigDecimal totalGainLoss = totalCurrentValue.subtract(totalCostBasis);
        BigDecimal totalGainLossPercentage = BigDecimal.ZERO;
        
        if (totalCostBasis.compareTo(BigDecimal.ZERO) > 0) {
            totalGainLossPercentage = totalGainLoss.divide(totalCostBasis, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
        }
        
        performance.put("totalCostBasis", totalCostBasis);
        performance.put("totalCurrentValue", totalCurrentValue);
        performance.put("totalGainLoss", totalGainLoss);
        performance.put("totalGainLossPercentage", totalGainLossPercentage);
        performance.put("numberOfInvestments", investments.size());
        
        return performance;
    }
    
    public Map<String, Object> getAssetAllocation(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        List<Investment> investments = investmentRepository.findByUserIdOrderByPurchaseDateDesc(user.getId());
        
        Map<InvestmentType, BigDecimal> allocationByType = new HashMap<>();
        BigDecimal totalValue = BigDecimal.ZERO;
        
        // Calculate total value and allocation by type
        for (Investment investment : investments) {
            BigDecimal currentValue = investment.getCurrentValue();
            totalValue = totalValue.add(currentValue);
            
            allocationByType.merge(investment.getType(), currentValue, BigDecimal::add);
        }
        
        // Calculate percentages
        Map<InvestmentType, BigDecimal> allocationPercentages = new HashMap<>();
        if (totalValue.compareTo(BigDecimal.ZERO) > 0) {
            for (Map.Entry<InvestmentType, BigDecimal> entry : allocationByType.entrySet()) {
                BigDecimal percentage = entry.getValue().divide(totalValue, 4, RoundingMode.HALF_UP)
                        .multiply(new BigDecimal("100"));
                allocationPercentages.put(entry.getKey(), percentage);
            }
        }
        
        Map<String, Object> allocation = new HashMap<>();
        allocation.put("totalValue", totalValue);
        allocation.put("allocationByType", allocationByType);
        allocation.put("allocationPercentages", allocationPercentages);
        
        return allocation;
    }
    
    public Map<String, Object> getRiskMetrics(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        List<Investment> investments = investmentRepository.findByUserIdOrderByPurchaseDateDesc(user.getId());
        
        Map<String, Object> riskMetrics = new HashMap<>();
        
        // Calculate portfolio volatility (simplified version using gain/loss percentages)
        List<BigDecimal> returns = investments.stream()
                .filter(inv -> inv.getCurrentPrice() != null)
                .map(Investment::getGainLossPercentage)
                .collect(Collectors.toList());
        
        if (!returns.isEmpty()) {
            BigDecimal avgReturn = returns.stream()
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(new BigDecimal(returns.size()), 4, RoundingMode.HALF_UP);
            
            // Calculate standard deviation (volatility)
            BigDecimal variance = returns.stream()
                    .map(ret -> ret.subtract(avgReturn).pow(2))
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(new BigDecimal(returns.size()), 4, RoundingMode.HALF_UP);
            
            double volatility = Math.sqrt(variance.doubleValue());
            
            riskMetrics.put("averageReturn", avgReturn);
            riskMetrics.put("volatility", BigDecimal.valueOf(volatility));
            
            // Simplified Sharpe ratio (assuming risk-free rate of 2%)
            BigDecimal riskFreeRate = new BigDecimal("2.0");
            if (BigDecimal.valueOf(volatility).compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal sharpeRatio = avgReturn.subtract(riskFreeRate)
                        .divide(BigDecimal.valueOf(volatility), 4, RoundingMode.HALF_UP);
                riskMetrics.put("sharpeRatio", sharpeRatio);
            }
        }
        
        // Diversification score (based on number of different types and symbols)
        Set<InvestmentType> uniqueTypes = investments.stream()
                .map(Investment::getType)
                .collect(Collectors.toSet());
        
        Set<String> uniqueSymbols = investments.stream()
                .map(Investment::getSymbol)
                .collect(Collectors.toSet());
        
        // Simple diversification score (0-100)
        int diversificationScore = Math.min(100, 
                (uniqueTypes.size() * 10) + Math.min(50, uniqueSymbols.size() * 5));
        
        riskMetrics.put("diversificationScore", diversificationScore);
        riskMetrics.put("uniqueAssetTypes", uniqueTypes.size());
        riskMetrics.put("uniqueSymbols", uniqueSymbols.size());
        
        return riskMetrics;
    }
    
    public Map<String, Object> getPerformanceBenchmark(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        List<Investment> investments = investmentRepository.findByUserIdOrderByPurchaseDateDesc(user.getId());
        
        Map<String, Object> benchmark = new HashMap<>();
        
        // Calculate portfolio performance
        Map<String, Object> portfolioPerformance = getPortfolioPerformance(username);
        BigDecimal portfolioReturn = (BigDecimal) portfolioPerformance.get("totalGainLossPercentage");
        
        // Simplified benchmark comparison (assuming S&P 500 average return of 10% annually)
        BigDecimal sp500BenchmarkReturn = new BigDecimal("10.0");
        
        // Calculate time-weighted return based on average holding period
        if (!investments.isEmpty()) {
            double avgHoldingDays = investments.stream()
                    .mapToLong(inv -> ChronoUnit.DAYS.between(inv.getPurchaseDate(), LocalDate.now()))
                    .average()
                    .orElse(0.0);
            
            double avgHoldingYears = avgHoldingDays / 365.0;
            
            if (avgHoldingYears > 0) {
                // Annualize the portfolio return
                BigDecimal annualizedReturn = portfolioReturn.divide(
                        BigDecimal.valueOf(avgHoldingYears), 4, RoundingMode.HALF_UP);
                
                BigDecimal outperformance = annualizedReturn.subtract(sp500BenchmarkReturn);
                
                benchmark.put("portfolioAnnualizedReturn", annualizedReturn);
                benchmark.put("sp500BenchmarkReturn", sp500BenchmarkReturn);
                benchmark.put("outperformance", outperformance);
                benchmark.put("avgHoldingPeriodYears", BigDecimal.valueOf(avgHoldingYears));
            }
        }
        
        benchmark.put("portfolioTotalReturn", portfolioReturn);
        
        return benchmark;
    }
    
    public List<Map<String, Object>> getTopPerformers(String username, int limit) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        List<Investment> investments = investmentRepository.findTopPerformingInvestments(user.getId());
        
        return investments.stream()
                .limit(limit)
                .map(this::createPerformanceMap)
                .collect(Collectors.toList());
    }
    
    public List<Map<String, Object>> getWorstPerformers(String username, int limit) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        List<Investment> investments = investmentRepository.findWorstPerformingInvestments(user.getId());
        
        return investments.stream()
                .limit(limit)
                .map(this::createPerformanceMap)
                .collect(Collectors.toList());
    }
    
    public Map<String, Object> getPortfolioSummary(String username) {
        Map<String, Object> summary = new HashMap<>();
        
        summary.put("performance", getPortfolioPerformance(username));
        summary.put("allocation", getAssetAllocation(username));
        summary.put("riskMetrics", getRiskMetrics(username));
        summary.put("benchmark", getPerformanceBenchmark(username));
        summary.put("topPerformers", getTopPerformers(username, 5));
        summary.put("worstPerformers", getWorstPerformers(username, 5));
        
        return summary;
    }
    
    private Map<String, Object> createPerformanceMap(Investment investment) {
        Map<String, Object> performance = new HashMap<>();
        performance.put("id", investment.getId());
        performance.put("symbol", investment.getSymbol());
        performance.put("name", investment.getName());
        performance.put("type", investment.getType());
        performance.put("totalCost", investment.getTotalCost());
        performance.put("currentValue", investment.getCurrentValue());
        performance.put("gainLoss", investment.getGainLoss());
        performance.put("gainLossPercentage", investment.getGainLossPercentage());
        performance.put("purchaseDate", investment.getPurchaseDate());
        
        return performance;
    }
}