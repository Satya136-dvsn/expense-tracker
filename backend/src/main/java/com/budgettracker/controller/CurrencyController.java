package com.budgettracker.controller;

import com.budgettracker.dto.*;
import com.budgettracker.service.CurrencyService;
import com.budgettracker.service.ExchangeRateService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/currencies")
@CrossOrigin(origins = "*")
public class CurrencyController {
    
    private static final Logger logger = LoggerFactory.getLogger(CurrencyController.class);
    
    @Autowired
    private CurrencyService currencyService;
    
    @Autowired
    private ExchangeRateService exchangeRateService;
    
    /**
     * Get all active currencies
     */
    @GetMapping
    public ResponseEntity<List<CurrencyResponse>> getAllCurrencies() {
        logger.debug("GET /api/currencies - Fetching all active currencies");
        
        try {
            List<CurrencyResponse> currencies = currencyService.getAllActiveCurrencies();
            return ResponseEntity.ok(currencies);
        } catch (Exception e) {
            logger.error("Error fetching currencies: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get most commonly used currencies
     */
    @GetMapping("/common")
    public ResponseEntity<List<CurrencyResponse>> getCommonCurrencies() {
        logger.debug("GET /api/currencies/common - Fetching common currencies");
        
        try {
            List<CurrencyResponse> currencies = currencyService.getMostCommonCurrencies();
            return ResponseEntity.ok(currencies);
        } catch (Exception e) {
            logger.error("Error fetching common currencies: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get currency by code
     */
    @GetMapping("/{code}")
    public ResponseEntity<CurrencyResponse> getCurrencyByCode(@PathVariable String code) {
        logger.debug("GET /api/currencies/{} - Fetching currency by code", code);
        
        try {
            CurrencyResponse currency = currencyService.getCurrencyByCode(code);
            return ResponseEntity.ok(currency);
        } catch (RuntimeException e) {
            logger.error("Currency not found: {}", code);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error fetching currency {}: {}", code, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Search currencies by name
     */
    @GetMapping("/search")
    public ResponseEntity<List<CurrencyResponse>> searchCurrencies(@RequestParam String query) {
        logger.debug("GET /api/currencies/search?query={} - Searching currencies", query);
        
        try {
            List<CurrencyResponse> currencies = currencyService.searchCurrencies(query);
            return ResponseEntity.ok(currencies);
        } catch (Exception e) {
            logger.error("Error searching currencies with query {}: {}", query, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Create new currency (admin only)
     */
    @PostMapping
    public ResponseEntity<CurrencyResponse> createCurrency(@Valid @RequestBody CurrencyRequest request) {
        logger.info("POST /api/currencies - Creating new currency: {}", request.getCode());
        
        try {
            CurrencyResponse currency = currencyService.createCurrency(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(currency);
        } catch (RuntimeException e) {
            logger.error("Error creating currency: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Unexpected error creating currency: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Update currency (admin only)
     */
    @PutMapping("/{id}")
    public ResponseEntity<CurrencyResponse> updateCurrency(@PathVariable Long id, 
                                                          @Valid @RequestBody CurrencyRequest request) {
        logger.info("PUT /api/currencies/{} - Updating currency", id);
        
        try {
            CurrencyResponse currency = currencyService.updateCurrency(id, request);
            return ResponseEntity.ok(currency);
        } catch (RuntimeException e) {
            logger.error("Error updating currency {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Unexpected error updating currency {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Convert currency amount
     */
    @PostMapping("/convert")
    public ResponseEntity<CurrencyConversionResponse> convertCurrency(@Valid @RequestBody CurrencyConversionRequest request) {
        logger.debug("POST /api/currencies/convert - Converting {} {} to {}", 
                request.getAmount(), request.getFromCurrencyCode(), request.getToCurrencyCode());
        
        try {
            CurrencyConversionResponse conversion = currencyService.convertCurrency(request);
            return ResponseEntity.ok(conversion);
        } catch (RuntimeException e) {
            logger.error("Error converting currency: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Unexpected error converting currency: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get latest exchange rates for a base currency
     */
    @GetMapping("/rates/{baseCurrency}")
    public ResponseEntity<List<ExchangeRateResponse>> getLatestRates(@PathVariable String baseCurrency) {
        logger.debug("GET /api/currencies/rates/{} - Fetching latest exchange rates", baseCurrency);
        
        try {
            List<ExchangeRateResponse> rates = exchangeRateService.getLatestRates(baseCurrency);
            return ResponseEntity.ok(rates);
        } catch (RuntimeException e) {
            logger.error("Error fetching exchange rates for {}: {}", baseCurrency, e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Unexpected error fetching exchange rates: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get exchange rate between two currencies for a specific date
     */
    @GetMapping("/rates/{fromCurrency}/{toCurrency}")
    public ResponseEntity<ExchangeRateResponse> getExchangeRate(
            @PathVariable String fromCurrency,
            @PathVariable String toCurrency,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        LocalDate queryDate = date != null ? date : LocalDate.now();
        logger.debug("GET /api/currencies/rates/{}/{} - Fetching exchange rate for date {}", 
                fromCurrency, toCurrency, queryDate);
        
        try {
            ExchangeRateResponse rate = exchangeRateService.getExchangeRate(fromCurrency, toCurrency, queryDate);
            return ResponseEntity.ok(rate);
        } catch (RuntimeException e) {
            logger.error("Error fetching exchange rate from {} to {}: {}", fromCurrency, toCurrency, e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Unexpected error fetching exchange rate: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get historical exchange rates between two currencies
     */
    @GetMapping("/rates/{fromCurrency}/{toCurrency}/history")
    public ResponseEntity<List<ExchangeRateResponse>> getHistoricalRates(
            @PathVariable String fromCurrency,
            @PathVariable String toCurrency,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        logger.debug("GET /api/currencies/rates/{}/{}/history - Fetching historical rates from {} to {}", 
                fromCurrency, toCurrency, startDate, endDate);
        
        try {
            List<ExchangeRateResponse> rates = exchangeRateService.getHistoricalRates(fromCurrency, toCurrency, startDate, endDate);
            return ResponseEntity.ok(rates);
        } catch (RuntimeException e) {
            logger.error("Error fetching historical exchange rates: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Unexpected error fetching historical exchange rates: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Force update exchange rates (admin only)
     */
    @PostMapping("/rates/update")
    public ResponseEntity<String> updateExchangeRates() {
        logger.info("POST /api/currencies/rates/update - Manual exchange rate update triggered");
        
        try {
            exchangeRateService.forceUpdateExchangeRates();
            return ResponseEntity.ok("Exchange rates update initiated successfully");
        } catch (Exception e) {
            logger.error("Error updating exchange rates: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update exchange rates: " + e.getMessage());
        }
    }
    
    /**
     * Initialize default currencies (admin only)
     */
    @PostMapping("/initialize")
    public ResponseEntity<String> initializeDefaultCurrencies() {
        logger.info("POST /api/currencies/initialize - Initializing default currencies");
        
        try {
            currencyService.initializeDefaultCurrencies();
            return ResponseEntity.ok("Default currencies initialized successfully");
        } catch (Exception e) {
            logger.error("Error initializing default currencies: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to initialize default currencies: " + e.getMessage());
        }
    }
}