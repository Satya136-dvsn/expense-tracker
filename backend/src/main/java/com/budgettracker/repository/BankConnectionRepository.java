package com.budgettracker.repository;

import com.budgettracker.model.BankConnection;
import com.budgettracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BankConnectionRepository extends JpaRepository<BankConnection, Long> {
    
    /**
     * Find all bank connections for a user
     */
    List<BankConnection> findByUserOrderByCreatedAtDesc(User user);
    
    /**
     * Find bank connections by user ID
     */
    @Query("SELECT bc FROM BankConnection bc WHERE bc.user.id = :userId ORDER BY bc.createdAt DESC")
    List<BankConnection> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);
    
    /**
     * Find active bank connections for a user
     */
    List<BankConnection> findByUserAndStatusOrderByCreatedAtDesc(User user, BankConnection.ConnectionStatus status);
    
    /**
     * Find bank connection by item ID
     */
    Optional<BankConnection> findByItemId(String itemId);
    
    /**
     * Find bank connection by institution ID and user
     */
    Optional<BankConnection> findByUserAndInstitutionId(User user, String institutionId);
    
    /**
     * Find connections that need sync
     */
    @Query("SELECT bc FROM BankConnection bc WHERE bc.status = 'ACTIVE' AND (bc.lastSuccessfulSync IS NULL OR bc.lastSuccessfulSync < :cutoffTime)")
    List<BankConnection> findConnectionsNeedingSync(@Param("cutoffTime") LocalDateTime cutoffTime);
    
    /**
     * Find connections with errors
     */
    List<BankConnection> findByStatusOrderByUpdatedAtDesc(BankConnection.ConnectionStatus status);
    
    /**
     * Find connections expiring soon
     */
    @Query("SELECT bc FROM BankConnection bc WHERE bc.consentExpiration IS NOT NULL AND bc.consentExpiration < :expirationTime AND bc.status = 'ACTIVE'")
    List<BankConnection> findConnectionsExpiringSoon(@Param("expirationTime") LocalDateTime expirationTime);
    
    /**
     * Count active connections for a user
     */
    long countByUserAndStatus(User user, BankConnection.ConnectionStatus status);
    
    /**
     * Check if user has any active connections
     */
    boolean existsByUserAndStatus(User user, BankConnection.ConnectionStatus status);
    
    /**
     * Find connections by institution name
     */
    List<BankConnection> findByUserAndInstitutionNameContainingIgnoreCaseOrderByCreatedAtDesc(User user, String institutionName);
    
    /**
     * Delete old inactive connections
     */
    @Query("DELETE FROM BankConnection bc WHERE bc.status = 'INACTIVE' AND bc.updatedAt < :cutoffDate")
    void deleteOldInactiveConnections(@Param("cutoffDate") LocalDateTime cutoffDate);
}