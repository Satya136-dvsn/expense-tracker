package com.budgettracker.service;

import com.budgettracker.model.Investment;
import com.budgettracker.repository.InvestmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
@Transactional
public class MarketDataService {
    
    @Autowired
    private AlphaVantageService alphaVantageService;
    
    @Autowired
    private InvestmentRepository investmentRepository;
    
    @Cacheable(value = "marketPrices", key = "#symbol")
    public BigDecimal getCurrentPrice(String symbol) {
        try {
            return alphaVantageService.getCurrentPrice(symbol);
        } catch (Exception e) {
            // Log error and return null if price fetch fails
            System.err.println("Failed to fetch price for " + symbol + ": " + e.getMessage());
            return null;
        }
    }
    
    @Cacheable(value = "marketQuotes", key = "#symbol")
    public Map<String, Object> getQuote(String symbol) {
        try {
            return alphaVantageService.getQuote(symbol);
        } catch (Exception e) {
            // Log error and return null if quote fetch fails
            System.err.println("Failed to fetch quote for " + symbol + ": " + e.getMessage());
            return null;
        }
    }
    
    public Map<String, Object> searchSymbol(String keywords) {
        try {
            return alphaVantageService.searchSymbol(keywords);
        } catch (Exception e) {
            // Log error and return null if search fails
            System.err.println("Failed to search for " + keywords + ": " + e.getMessage());
            return null;
        }
    }
    
    @Async
    public CompletableFuture<Void> updateInvestmentPrice(Long investmentId) {
        try {
            Investment investment = investmentRepository.findById(investmentId).orElse(null);
            if (investment == null) {
                return CompletableFuture.completedFuture(null);
            }
            
            BigDecimal currentPrice = getCurrentPrice(investment.getSymbol());
            if (currentPrice != null) {
                investment.setCurrentPrice(currentPrice);
                investment.setLastPriceUpdate(LocalDateTime.now());
                investmentRepository.save(investment);
            }
        } catch (Exception e) {
            System.err.println("Failed to update price for investment " + investmentId + ": " + e.getMessage());
        }
        
        return CompletableFuture.completedFuture(null);
    }
    
    @Async
    public CompletableFuture<Void> updateUserInvestmentPrices(Long userId) {
        try {
            List<Investment> investments = investmentRepository.findByUserIdOrderByPurchaseDateDesc(userId);
            
            for (Investment investment : investments) {
                try {
                    BigDecimal currentPrice = getCurrentPrice(investment.getSymbol());
                    if (currentPrice != null) {
                        investment.setCurrentPrice(currentPrice);
                        investment.setLastPriceUpdate(LocalDateTime.now());
                        investmentRepository.save(investment);
                    }
                    
                    // Add small delay to avoid hitting API rate limits
                    Thread.sleep(200);
                } catch (Exception e) {
                    System.err.println("Failed to update price for " + investment.getSymbol() + ": " + e.getMessage());
                    // Continue with next investment even if one fails
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to update prices for user " + userId + ": " + e.getMessage());
        }
        
        return CompletableFuture.completedFuture(null);
    }
    
    @Async
    public CompletableFuture<Void> updateAllOutdatedPrices() {
        try {
            // Find investments with prices older than 1 hour
            LocalDateTime cutoffTime = LocalDateTime.now().minusHours(1);
            List<Investment> outdatedInvestments = investmentRepository
                    .findInvestmentsWithOutdatedPrices(cutoffTime);
            
            for (Investment investment : outdatedInvestments) {
                try {
                    BigDecimal currentPrice = getCurrentPrice(investment.getSymbol());
                    if (currentPrice != null) {
                        investment.setCurrentPrice(currentPrice);
                        investment.setLastPriceUpdate(LocalDateTime.now());
                        investmentRepository.save(investment);
                    }
                    
                    // Add delay to avoid hitting API rate limits
                    Thread.sleep(200);
                } catch (Exception e) {
                    System.err.println("Failed to update price for " + investment.getSymbol() + ": " + e.getMessage());
                    // Continue with next investment even if one fails
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to update outdated prices: " + e.getMessage());
        }
        
        return CompletableFuture.completedFuture(null);
    }
    
    @CacheEvict(value = {"marketPrices", "marketQuotes"}, key = "#symbol")
    public void evictPriceCache(String symbol) {
        // This method will evict the cached price for the given symbol
    }
    
    @CacheEvict(value = {"marketPrices", "marketQuotes"}, allEntries = true)
    public void evictAllPriceCache() {
        // This method will evict all cached prices
    }
    
    public boolean isPriceDataStale(Investment investment, int maxAgeHours) {
        if (investment.getLastPriceUpdate() == null) {
            return true;
        }
        
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(maxAgeHours);
        return investment.getLastPriceUpdate().isBefore(cutoffTime);
    }
}