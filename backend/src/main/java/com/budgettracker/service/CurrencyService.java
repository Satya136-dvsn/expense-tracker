package com.budgettracker.service;

import com.budgettracker.dto.*;
import com.budgettracker.model.Currency;
import com.budgettracker.model.ExchangeRate;
import com.budgettracker.repository.CurrencyRepository;
import com.budgettracker.repository.ExchangeRateRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CurrencyService {
    
    private static final Logger logger = LoggerFactory.getLogger(CurrencyService.class);
    
    @Autowired
    private CurrencyRepository currencyRepository;
    
    @Autowired
    private ExchangeRateRepository exchangeRateRepository;
    
    @Autowired
    private ExchangeRateService exchangeRateService;
    
    /**
     * Get all active currencies
     */
    @Cacheable("currencies")
    public List<CurrencyResponse> getAllActiveCurrencies() {
        logger.debug("Fetching all active currencies");
        return currencyRepository.findAllActiveCurrenciesOrderByCode()
                .stream()
                .map(CurrencyResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Get most commonly used currencies
     */
    @Cacheable("commonCurrencies")
    public List<CurrencyResponse> getMostCommonCurrencies() {
        logger.debug("Fetching most common currencies");
        return currencyRepository.findMostCommonCurrencies()
                .stream()
                .map(CurrencyResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Get currency by code
     */
    public CurrencyResponse getCurrencyByCode(String code) {
        logger.debug("Fetching currency by code: {}", code);
        Currency currency = currencyRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new RuntimeException("Currency not found: " + code));
        return CurrencyResponse.fromEntity(currency);
    }
    
    /**
     * Create new currency
     */
    public CurrencyResponse createCurrency(CurrencyRequest request) {
        logger.info("Creating new currency: {}", request.getCode());
        
        if (currencyRepository.existsByCodeIgnoreCase(request.getCode())) {
            throw new RuntimeException("Currency already exists: " + request.getCode());
        }
        
        Currency currency = new Currency();
        currency.setCode(request.getCode().toUpperCase());
        currency.setName(request.getName());
        currency.setSymbol(request.getSymbol());
        currency.setIsActive(request.getIsActive());
        
        Currency savedCurrency = currencyRepository.save(currency);
        logger.info("Currency created successfully: {}", savedCurrency.getCode());
        
        return CurrencyResponse.fromEntity(savedCurrency);
    }
    
    /**
     * Update currency
     */
    public CurrencyResponse updateCurrency(Long id, CurrencyRequest request) {
        logger.info("Updating currency with id: {}", id);
        
        Currency currency = currencyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Currency not found with id: " + id));
        
        // Check if code is being changed and if new code already exists
        if (!currency.getCode().equalsIgnoreCase(request.getCode()) && 
            currencyRepository.existsByCodeIgnoreCase(request.getCode())) {
            throw new RuntimeException("Currency already exists: " + request.getCode());
        }
        
        currency.setCode(request.getCode().toUpperCase());
        currency.setName(request.getName());
        currency.setSymbol(request.getSymbol());
        currency.setIsActive(request.getIsActive());
        
        Currency updatedCurrency = currencyRepository.save(currency);
        logger.info("Currency updated successfully: {}", updatedCurrency.getCode());
        
        return CurrencyResponse.fromEntity(updatedCurrency);
    }
    
    /**
     * Convert currency amount
     */
    public CurrencyConversionResponse convertCurrency(CurrencyConversionRequest request) {
        logger.debug("Converting {} {} to {}", request.getAmount(), request.getFromCurrencyCode(), request.getToCurrencyCode());
        
        // If same currency, return original amount
        if (request.getFromCurrencyCode().equalsIgnoreCase(request.getToCurrencyCode())) {
            Currency currency = currencyRepository.findByCodeIgnoreCase(request.getFromCurrencyCode())
                    .orElseThrow(() -> new RuntimeException("Currency not found: " + request.getFromCurrencyCode()));
            
            return new CurrencyConversionResponse(
                    request.getAmount(),
                    currency.getCode(),
                    currency.getSymbol(),
                    request.getAmount(),
                    currency.getCode(),
                    currency.getSymbol(),
                    BigDecimal.ONE,
                    request.getConversionDate() != null ? request.getConversionDate() : LocalDate.now()
            );
        }
        
        // Get currencies
        Currency fromCurrency = currencyRepository.findByCodeIgnoreCase(request.getFromCurrencyCode())
                .orElseThrow(() -> new RuntimeException("From currency not found: " + request.getFromCurrencyCode()));
        
        Currency toCurrency = currencyRepository.findByCodeIgnoreCase(request.getToCurrencyCode())
                .orElseThrow(() -> new RuntimeException("To currency not found: " + request.getToCurrencyCode()));
        
        // Get exchange rate
        LocalDate conversionDate = request.getConversionDate() != null ? request.getConversionDate() : LocalDate.now();
        BigDecimal exchangeRate = getExchangeRate(fromCurrency, toCurrency, conversionDate);
        
        // Calculate converted amount
        BigDecimal convertedAmount = request.getAmount().multiply(exchangeRate).setScale(2, RoundingMode.HALF_UP);
        
        CurrencyConversionResponse response = new CurrencyConversionResponse(
                request.getAmount(),
                fromCurrency.getCode(),
                fromCurrency.getSymbol(),
                convertedAmount,
                toCurrency.getCode(),
                toCurrency.getSymbol(),
                exchangeRate,
                conversionDate
        );
        
        logger.debug("Conversion result: {} {} = {} {}", 
                request.getAmount(), fromCurrency.getCode(), 
                convertedAmount, toCurrency.getCode());
        
        return response;
    }
    
    /**
     * Get exchange rate between two currencies
     */
    private BigDecimal getExchangeRate(Currency fromCurrency, Currency toCurrency, LocalDate date) {
        // Try to find direct exchange rate
        Optional<ExchangeRate> directRate = exchangeRateRepository.findRateOnOrBefore(fromCurrency, toCurrency, date);
        if (directRate.isPresent()) {
            return directRate.get().getRate();
        }
        
        // Try to find inverse rate
        Optional<ExchangeRate> inverseRate = exchangeRateRepository.findRateOnOrBefore(toCurrency, fromCurrency, date);
        if (inverseRate.isPresent()) {
            return BigDecimal.ONE.divide(inverseRate.get().getRate(), 6, RoundingMode.HALF_UP);
        }
        
        // If no rate found, try to fetch from external API
        try {
            exchangeRateService.updateExchangeRates();
            
            // Try again after update
            Optional<ExchangeRate> updatedRate = exchangeRateRepository.findRateOnOrBefore(fromCurrency, toCurrency, date);
            if (updatedRate.isPresent()) {
                return updatedRate.get().getRate();
            }
            
            // Try inverse again
            Optional<ExchangeRate> updatedInverseRate = exchangeRateRepository.findRateOnOrBefore(toCurrency, fromCurrency, date);
            if (updatedInverseRate.isPresent()) {
                return BigDecimal.ONE.divide(updatedInverseRate.get().getRate(), 6, RoundingMode.HALF_UP);
            }
        } catch (Exception e) {
            logger.warn("Failed to update exchange rates: {}", e.getMessage());
        }
        
        throw new RuntimeException("Exchange rate not available for " + fromCurrency.getCode() + " to " + toCurrency.getCode());
    }
    
    /**
     * Search currencies by name
     */
    public List<CurrencyResponse> searchCurrencies(String query) {
        logger.debug("Searching currencies with query: {}", query);
        return currencyRepository.findByNameContainingIgnoreCase(query)
                .stream()
                .map(CurrencyResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Initialize default currencies
     */
    @Transactional
    public void initializeDefaultCurrencies() {
        logger.info("Initializing default currencies");
        
        if (currencyRepository.count() > 0) {
            logger.info("Currencies already exist, skipping initialization");
            return;
        }
        
        // Major world currencies
        Currency[] defaultCurrencies = {
            new Currency("USD", "US Dollar", "$"),
            new Currency("EUR", "Euro", "€"),
            new Currency("GBP", "British Pound", "£"),
            new Currency("JPY", "Japanese Yen", "¥"),
            new Currency("CAD", "Canadian Dollar", "C$"),
            new Currency("AUD", "Australian Dollar", "A$"),
            new Currency("CHF", "Swiss Franc", "CHF"),
            new Currency("CNY", "Chinese Yuan", "¥"),
            new Currency("INR", "Indian Rupee", "₹"),
            new Currency("KRW", "South Korean Won", "₩"),
            new Currency("MXN", "Mexican Peso", "$"),
            new Currency("BRL", "Brazilian Real", "R$"),
            new Currency("RUB", "Russian Ruble", "₽"),
            new Currency("ZAR", "South African Rand", "R"),
            new Currency("SGD", "Singapore Dollar", "S$"),
            new Currency("HKD", "Hong Kong Dollar", "HK$"),
            new Currency("NOK", "Norwegian Krone", "kr"),
            new Currency("SEK", "Swedish Krona", "kr"),
            new Currency("DKK", "Danish Krone", "kr"),
            new Currency("PLN", "Polish Zloty", "zł")
        };
        
        for (Currency currency : defaultCurrencies) {
            currencyRepository.save(currency);
        }
        
        logger.info("Default currencies initialized successfully");
    }
}