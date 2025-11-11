package com.budgettracker.repository;

import com.budgettracker.model.Currency;
import com.budgettracker.model.ExchangeRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExchangeRateRepository extends JpaRepository<ExchangeRate, Long> {
    
    /**
     * Find latest exchange rate between two currencies
     */
    @Query("SELECT er FROM ExchangeRate er WHERE er.fromCurrency = :fromCurrency AND er.toCurrency = :toCurrency ORDER BY er.rateDate DESC LIMIT 1")
    Optional<ExchangeRate> findLatestRate(@Param("fromCurrency") Currency fromCurrency, 
                                         @Param("toCurrency") Currency toCurrency);
    
    /**
     * Find exchange rate for specific date
     */
    Optional<ExchangeRate> findByFromCurrencyAndToCurrencyAndRateDate(Currency fromCurrency, 
                                                                     Currency toCurrency, 
                                                                     LocalDate rateDate);
    
    /**
     * Find exchange rate for specific date or closest previous date
     */
    @Query("SELECT er FROM ExchangeRate er WHERE er.fromCurrency = :fromCurrency AND er.toCurrency = :toCurrency AND er.rateDate <= :date ORDER BY er.rateDate DESC LIMIT 1")
    Optional<ExchangeRate> findRateOnOrBefore(@Param("fromCurrency") Currency fromCurrency,
                                             @Param("toCurrency") Currency toCurrency,
                                             @Param("date") LocalDate date);
    
    /**
     * Find all rates for a specific date
     */
    List<ExchangeRate> findByRateDate(LocalDate rateDate);
    
    /**
     * Find all rates from a specific currency
     */
    List<ExchangeRate> findByFromCurrency(Currency fromCurrency);
    
    /**
     * Find all rates to a specific currency
     */
    List<ExchangeRate> findByToCurrency(Currency toCurrency);
    
    /**
     * Find rates between date range
     */
    @Query("SELECT er FROM ExchangeRate er WHERE er.fromCurrency = :fromCurrency AND er.toCurrency = :toCurrency AND er.rateDate BETWEEN :startDate AND :endDate ORDER BY er.rateDate DESC")
    List<ExchangeRate> findRatesBetweenDates(@Param("fromCurrency") Currency fromCurrency,
                                           @Param("toCurrency") Currency toCurrency,
                                           @Param("startDate") LocalDate startDate,
                                           @Param("endDate") LocalDate endDate);
    
    /**
     * Check if rate exists for specific currencies and date
     */
    boolean existsByFromCurrencyAndToCurrencyAndRateDate(Currency fromCurrency, 
                                                        Currency toCurrency, 
                                                        LocalDate rateDate);
    
    /**
     * Delete old rates (older than specified date)
     */
    @Query("DELETE FROM ExchangeRate er WHERE er.rateDate < :cutoffDate")
    void deleteRatesOlderThan(@Param("cutoffDate") LocalDate cutoffDate);
    
    /**
     * Get latest rates for all currency pairs from a base currency
     */
    @Query("SELECT er FROM ExchangeRate er WHERE er.fromCurrency = :baseCurrency AND er.rateDate = (SELECT MAX(er2.rateDate) FROM ExchangeRate er2 WHERE er2.fromCurrency = er.fromCurrency AND er2.toCurrency = er.toCurrency)")
    List<ExchangeRate> findLatestRatesFromBaseCurrency(@Param("baseCurrency") Currency baseCurrency);
}