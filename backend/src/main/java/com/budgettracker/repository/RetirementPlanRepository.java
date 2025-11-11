package com.budgettracker.repository;

import com.budgettracker.model.RetirementPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RetirementPlanRepository extends JpaRepository<RetirementPlan, Long> {
    
    /**
     * Find all retirement plans for a specific user
     */
    List<RetirementPlan> findByUserIdOrderByUpdatedAtDesc(Long userId);
    
    /**
     * Find the most recent retirement plan for a user
     */
    @Query("SELECT rp FROM RetirementPlan rp WHERE rp.user.id = :userId ORDER BY rp.updatedAt DESC LIMIT 1")
    Optional<RetirementPlan> findLatestByUserId(@Param("userId") Long userId);
    
    /**
     * Find retirement plan by ID and user ID for security
     */
    Optional<RetirementPlan> findByIdAndUserId(Long id, Long userId);
    
    /**
     * Check if user has any retirement plans
     */
    boolean existsByUserId(Long userId);
    
    /**
     * Count retirement plans for a user
     */
    long countByUserId(Long userId);
    
    /**
     * Delete all retirement plans for a user
     */
    void deleteByUserId(Long userId);
}