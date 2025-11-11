package com.budgettracker.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.cache.interceptor.KeyGenerator;
import org.springframework.cache.interceptor.SimpleKeyGenerator;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Cache configuration for BudgetWise application
 * Provides caching for analytics data to improve performance
 */
@Configuration
@EnableCaching
public class CacheConfig {

    /**
     * Configure cache manager with TTL support
     */
    @Bean
    public CacheManager cacheManager() {
        ConcurrentMapCacheManager cacheManager = new ConcurrentMapCacheManager(
            "monthlyTrends",
            "categoryBreakdown", 
            "financialHealth",
            "budgetAnalysis",
            "savingsProgress",
            "enhancedFinancialHealth",
            "spendingPatterns"
        );
        
        // Set cache properties
        cacheManager.setAllowNullValues(false);
        
        return cacheManager;
    }

    /**
     * Custom key generator for cache keys
     */
    @Bean
    public KeyGenerator keyGenerator() {
        return new SimpleKeyGenerator();
    }
}