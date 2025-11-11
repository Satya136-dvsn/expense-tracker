package com.budgettracker.service;

import com.budgettracker.dto.ExchangeRateResponse;
import com.budgettracker.model.Currency;
import com.budgettracker.model.ExchangeRate;
import com.budgettracker.repository.CurrencyRepository;
import com.budgettracker.repository.ExchangeRateRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ExchangeRateService {
    
    private static final Logger logger = LoggerFactory.getLogger(ExchangeRateService.class);
    private static final String EXCHANGE_RATE_API_URL = "https://api.exchangerate-api.com/v4/latest/";
    private static final String FIXER_API_URL = "http://data.fixer.io/api/latest";
    
    @Autowired
    private ExchangeRateRepository exchangeRateRepository;
    
    @Autowired
    private CurrencyRepository currencyRepository;
    
    @Value("${app.exchange-rate.api-key:}")
    private String apiKey;
    
    @Value("${app.exchange-rate.base-currency:USD}")
    private String baseCurrency;
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * Get latest exchange rates for a base currency
     */
    @Cacheable("exchangeRates")
    public List<ExchangeRateResponse> getLatestRates(String baseCurrencyCode) {
        logger.debug("Fetching latest exchange rates for base currency: {}", baseCurrencyCode);
        
        Currency currency = currencyRepository.findByCodeIgnoreCase(baseCurrencyCode)
                .orElseThrow(() -> new RuntimeException("Currency not found: " + baseCurrencyCode));
        
        return exchangeRateRepository.findLatestRatesFromBaseCurrency(currency)
                .stream()
                .map(ExchangeRateResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Get exchange rate between two currencies for a specific date
     */
    public ExchangeRateResponse getExchangeRate(String fromCurrencyCode, String toCurrencyCode, LocalDate date) {
        logger.debug("Fetching exchange rate from {} to {} for date {}", fromCurrencyCode, toCurrencyCode, date);
        
        Currency fromCurrency = currencyRepository.findByCodeIgnoreCase(fromCurrencyCode)
                .orElseThrow(() -> new RuntimeException("From currency not found: " + fromCurrencyCode));
        
        Currency toCurrency = currencyRepository.findByCodeIgnoreCase(toCurrencyCode)
                .orElseThrow(() -> new RuntimeException("To currency not found: " + toCurrencyCode));
        
        Optional<ExchangeRate> exchangeRate = exchangeRateRepository.findRateOnOrBefore(fromCurrency, toCurrency, date);
        
        if (exchangeRate.isPresent()) {
            return ExchangeRateResponse.fromEntity(exchangeRate.get());
        }
        
        throw new RuntimeException("Exchange rate not found for " + fromCurrencyCode + " to " + toCurrencyCode + " on " + date);
    }
    
    /**
     * Update exchange rates from external API
     */
    @Scheduled(fixedRate = 3600000) // Update every hour
    @Transactional
    public void updateExchangeRates() {
        logger.info("Starting scheduled exchange rate update");
        
        try {
            // Use free exchange rate API (no API key required)
            updateFromExchangeRateApi();
        } catch (Exception e) {
            logger.error("Failed to update exchange rates from primary API: {}", e.getMessage());
            
            // Fallback to alternative API if available
            if (apiKey != null && !apiKey.isEmpty()) {
                try {
                    updateFromFixerApi();
                } catch (Exception fallbackException) {
                    logger.error("Failed to update exchange rates from fallback API: {}", fallbackException.getMessage());
                }
            }
        }
    }
    
    /**
     * Update exchange rates from exchangerate-api.com (free tier)
     */
    private void updateFromExchangeRateApi() {
        logger.debug("Updating exchange rates from exchangerate-api.com");
        
        String url = EXCHANGE_RATE_API_URL + baseCurrency;
        
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            
            if (jsonNode.has("rates")) {
                Currency basecurr = currencyRepository.findByCodeIgnoreCase(baseCurrency)
                        .orElseThrow(() -> new RuntimeException("Base currency not found: " + baseCurrency));
                
                JsonNode rates = jsonNode.get("rates");
                LocalDate today = LocalDate.now();
                
                Iterator<Map.Entry<String, JsonNode>> fields = rates.fields();
                int updatedCount = 0;
                
                while (fields.hasNext()) {
                    Map.Entry<String, JsonNode> entry = fields.next();
                    String currencyCode = entry.getKey();
                    BigDecimal rate = entry.getValue().decimalValue();
                    
                    Optional<Currency> targetCurrency = currencyRepository.findByCodeIgnoreCase(currencyCode);
                    if (targetCurrency.isPresent()) {
                        // Check if rate already exists for today
                        if (!exchangeRateRepository.existsByFromCurrencyAndToCurrencyAndRateDate(
                                basecurr, targetCurrency.get(), today)) {
                            
                            ExchangeRate exchangeRate = new ExchangeRate(
                                    basecurr, 
                                    targetCurrency.get(), 
                                    rate, 
                                    today, 
                                    "exchangerate-api.com"
                            );
                            
                            exchangeRateRepository.save(exchangeRate);
                            updatedCount++;
                        }
                    }
                }
                
                logger.info("Updated {} exchange rates from exchangerate-api.com", updatedCount);
            }
        } catch (JsonProcessingException e) {
            logger.error("Error parsing JSON response from exchangerate-api.com: {}", e.getMessage());
            throw new RuntimeException("Failed to parse exchange rate data", e);
        } catch (Exception e) {
            logger.error("Error updating exchange rates from exchangerate-api.com: {}", e.getMessage());
            throw e;
        }
    }
    
    /**
     * Update exchange rates from fixer.io (requires API key)
     */
    private void updateFromFixerApi() {
        logger.debug("Updating exchange rates from fixer.io");
        
        String url = FIXER_API_URL + "?access_key=" + apiKey + "&base=" + baseCurrency;
        
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            
            if (jsonNode.has("success") && jsonNode.get("success").asBoolean() && jsonNode.has("rates")) {
                Currency basecurr = currencyRepository.findByCodeIgnoreCase(baseCurrency)
                        .orElseThrow(() -> new RuntimeException("Base currency not found: " + baseCurrency));
                
                JsonNode rates = jsonNode.get("rates");
                LocalDate today = LocalDate.now();
                
                Iterator<Map.Entry<String, JsonNode>> fields = rates.fields();
                int updatedCount = 0;
                
                while (fields.hasNext()) {
                    Map.Entry<String, JsonNode> entry = fields.next();
                    String currencyCode = entry.getKey();
                    BigDecimal rate = entry.getValue().decimalValue();
                    
                    Optional<Currency> targetCurrency = currencyRepository.findByCodeIgnoreCase(currencyCode);
                    if (targetCurrency.isPresent()) {
                        // Check if rate already exists for today
                        if (!exchangeRateRepository.existsByFromCurrencyAndToCurrencyAndRateDate(
                                basecurr, targetCurrency.get(), today)) {
                            
                            ExchangeRate exchangeRate = new ExchangeRate(
                                    basecurr, 
                                    targetCurrency.get(), 
                                    rate, 
                                    today, 
                                    "fixer.io"
                            );
                            
                            exchangeRateRepository.save(exchangeRate);
                            updatedCount++;
                        }
                    }
                }
                
                logger.info("Updated {} exchange rates from fixer.io", updatedCount);
            } else {
                logger.error("Fixer.io API returned error: {}", jsonNode.get("error"));
            }
        } catch (JsonProcessingException e) {
            logger.error("Error parsing JSON response from fixer.io: {}", e.getMessage());
            throw new RuntimeException("Failed to parse exchange rate data", e);
        } catch (Exception e) {
            logger.error("Error updating exchange rates from fixer.io: {}", e.getMessage());
            throw e;
        }
    }
    
    /**
     * Get historical exchange rates between two currencies
     */
    public List<ExchangeRateResponse> getHistoricalRates(String fromCurrencyCode, String toCurrencyCode, 
                                                        LocalDate startDate, LocalDate endDate) {
        logger.debug("Fetching historical exchange rates from {} to {} between {} and {}", 
                fromCurrencyCode, toCurrencyCode, startDate, endDate);
        
        Currency fromCurrency = currencyRepository.findByCodeIgnoreCase(fromCurrencyCode)
                .orElseThrow(() -> new RuntimeException("From currency not found: " + fromCurrencyCode));
        
        Currency toCurrency = currencyRepository.findByCodeIgnoreCase(toCurrencyCode)
                .orElseThrow(() -> new RuntimeException("To currency not found: " + toCurrencyCode));
        
        return exchangeRateRepository.findRatesBetweenDates(fromCurrency, toCurrency, startDate, endDate)
                .stream()
                .map(ExchangeRateResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Clean up old exchange rates (keep only last 2 years)
     */
    @Scheduled(cron = "0 0 2 * * ?") // Run daily at 2 AM
    @Transactional
    public void cleanupOldRates() {
        logger.info("Starting cleanup of old exchange rates");
        
        LocalDate cutoffDate = LocalDate.now().minusYears(2);
        
        try {
            exchangeRateRepository.deleteRatesOlderThan(cutoffDate);
            logger.info("Cleaned up exchange rates older than {}", cutoffDate);
        } catch (Exception e) {
            logger.error("Error cleaning up old exchange rates: {}", e.getMessage());
        }
    }
    
    /**
     * Manual trigger for exchange rate update
     */
    public void forceUpdateExchangeRates() {
        logger.info("Manual exchange rate update triggered");
        updateExchangeRates();
    }
}