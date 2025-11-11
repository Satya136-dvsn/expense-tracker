package com.budgettracker.repository;

import com.budgettracker.model.Currency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CurrencyRepository extends JpaRepository<Currency, Long> {
    
    /**
     * Find currency by code (e.g., "USD", "EUR")
     */
    Optional<Currency> findByCode(String code);
    
    /**
     * Find currency by code ignoring case
     */
    Optional<Currency> findByCodeIgnoreCase(String code);
    
    /**
     * Find all active currencies
     */
    List<Currency> findByIsActiveTrue();
    
    /**
     * Find all active currencies ordered by code
     */
    @Query("SELECT c FROM Currency c WHERE c.isActive = true ORDER BY c.code")
    List<Currency> findAllActiveCurrenciesOrderByCode();
    
    /**
     * Check if currency code exists
     */
    boolean existsByCode(String code);
    
    /**
     * Check if currency code exists ignoring case
     */
    boolean existsByCodeIgnoreCase(String code);
    
    /**
     * Find currencies by name containing (case insensitive)
     */
    @Query("SELECT c FROM Currency c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%')) AND c.isActive = true")
    List<Currency> findByNameContainingIgnoreCase(@Param("name") String name);
    
    /**
     * Get most commonly used currencies (predefined list)
     */
    @Query("SELECT c FROM Currency c WHERE c.code IN ('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY') AND c.isActive = true ORDER BY c.code")
    List<Currency> findMostCommonCurrencies();
}