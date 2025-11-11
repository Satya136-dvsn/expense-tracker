package com.budgettracker.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class MarketDataScheduler {
    
    @Autowired
    private MarketDataService marketDataService;
    
    // Update prices every 30 minutes during market hours (9 AM to 4 PM EST, Monday to Friday)
    @Scheduled(cron = "0 */30 9-16 * * MON-FRI", zone = "America/New_York")
    public void updatePricesDuringMarketHours() {
        try {
            System.out.println("Starting scheduled price update during market hours...");
            marketDataService.updateAllOutdatedPrices();
            System.out.println("Completed scheduled price update during market hours.");
        } catch (Exception e) {
            System.err.println("Error during scheduled price update: " + e.getMessage());
        }
    }
    
    // Update prices every 2 hours outside market hours
    @Scheduled(cron = "0 0 */2 * * *")
    public void updatePricesOutsideMarketHours() {
        try {
            System.out.println("Starting scheduled price update outside market hours...");
            marketDataService.updateAllOutdatedPrices();
            System.out.println("Completed scheduled price update outside market hours.");
        } catch (Exception e) {
            System.err.println("Error during scheduled price update: " + e.getMessage());
        }
    }
    
    // Clear cache daily at midnight
    @Scheduled(cron = "0 0 0 * * *")
    public void clearPriceCache() {
        try {
            System.out.println("Clearing market data cache...");
            marketDataService.evictAllPriceCache();
            System.out.println("Market data cache cleared.");
        } catch (Exception e) {
            System.err.println("Error clearing market data cache: " + e.getMessage());
        }
    }
}