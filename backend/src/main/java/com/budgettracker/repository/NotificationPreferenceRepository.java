package com.budgettracker.repository;

import com.budgettracker.model.NotificationPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, Long> {
    
    /**
     * Find notification preferences by user ID
     */
    Optional<NotificationPreference> findByUserId(Long userId);
    
    /**
     * Check if notification preferences exist for a user
     */
    boolean existsByUserId(Long userId);
    
    /**
     * Delete notification preferences by user ID
     */
    void deleteByUserId(Long userId);
}