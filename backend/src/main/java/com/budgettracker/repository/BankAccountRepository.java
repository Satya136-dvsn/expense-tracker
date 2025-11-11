package com.budgettracker.repository;

import com.budgettracker.model.BankAccount;
import com.budgettracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BankAccountRepository extends JpaRepository<BankAccount, Long> {
    
    /**
     * Find all bank accounts for a user
     */
    List<BankAccount> findByUserOrderByCreatedAtDesc(User user);
    
    /**
     * Find bank accounts by user ID
     */
    @Query("SELECT ba FROM BankAccount ba WHERE ba.user.id = :userId ORDER BY ba.createdAt DESC")
    List<BankAccount> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);
    
    /**
     * Find active bank accounts for a user
     */
    List<BankAccount> findByUserAndConnectionStatusOrderByCreatedAtDesc(User user, BankAccount.ConnectionStatus status);
    
    /**
     * Find bank account by external account ID
     */
    Optional<BankAccount> findByExternalAccountId(String externalAccountId);
    
    /**
     * Find bank accounts by account type
     */
    List<BankAccount> findByUserAndAccountTypeOrderByCreatedAtDesc(User user, BankAccount.AccountType accountType);
    
    /**
     * Find bank accounts that need sync (haven't been synced recently)
     */
    @Query("SELECT ba FROM BankAccount ba WHERE ba.connectionStatus = 'ACTIVE' AND (ba.lastSyncAt IS NULL OR ba.lastSyncAt < :cutoffTime)")
    List<BankAccount> findAccountsNeedingSync(@Param("cutoffTime") LocalDateTime cutoffTime);
    
    /**
     * Count active bank accounts for a user
     */
    long countByUserAndConnectionStatus(User user, BankAccount.ConnectionStatus status);
    
    /**
     * Find bank accounts by bank name
     */
    List<BankAccount> findByUserAndBankNameContainingIgnoreCaseOrderByCreatedAtDesc(User user, String bankName);
    
    /**
     * Check if user has any active bank accounts
     */
    boolean existsByUserAndConnectionStatus(User user, BankAccount.ConnectionStatus status);
    
    /**
     * Find bank accounts with errors
     */
    List<BankAccount> findByConnectionStatusOrderByUpdatedAtDesc(BankAccount.ConnectionStatus status);
    
    /**
     * Get total balance across all active accounts for a user
     */
    @Query("SELECT COALESCE(SUM(ba.currentBalance), 0) FROM BankAccount ba WHERE ba.user = :user AND ba.connectionStatus = 'ACTIVE'")
    java.math.BigDecimal getTotalBalanceForUser(@Param("user") User user);
    
    /**
     * Get total balance by account type for a user
     */
    @Query("SELECT COALESCE(SUM(ba.currentBalance), 0) FROM BankAccount ba WHERE ba.user = :user AND ba.accountType = :accountType AND ba.connectionStatus = 'ACTIVE'")
    java.math.BigDecimal getTotalBalanceByAccountType(@Param("user") User user, @Param("accountType") BankAccount.AccountType accountType);
}