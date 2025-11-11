package com.budgettracker.service;

import com.budgettracker.dto.RetirementCalculationResponse;
import com.budgettracker.dto.RetirementPlanRequest;
import com.budgettracker.model.RetirementPlan;
import com.budgettracker.model.User;
import com.budgettracker.repository.RetirementPlanRepository;
import com.budgettracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class RetirementPlanningService {

    private static final MathContext MATH_CONTEXT = new MathContext(10, RoundingMode.HALF_UP);
    private static final BigDecimal TWELVE = new BigDecimal("12");
    private static final BigDecimal ONE_HUNDRED = new BigDecimal("100");
    
    @Autowired
    private RetirementPlanRepository retirementPlanRepository;
    
    @Autowired
    private UserRepository userRepository;

    /**
     * Create or update a retirement plan
     */
    public RetirementPlan createOrUpdateRetirementPlan(Long userId, RetirementPlanRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        RetirementPlan plan = new RetirementPlan(user, request.getCurrentAge(), request.getRetirementAge());
        
        // Set all the plan parameters
        plan.setCurrentAnnualIncome(request.getCurrentAnnualIncome());
        plan.setDesiredReplacementRatio(request.getDesiredReplacementRatio());
        plan.setCurrent401kBalance(request.getCurrent401kBalance());
        plan.setCurrentIraBalance(request.getCurrentIraBalance());
        plan.setOtherRetirementSavings(request.getOtherRetirementSavings());
        plan.setMonthly401kContribution(request.getMonthly401kContribution());
        plan.setMonthlyIraContribution(request.getMonthlyIraContribution());
        plan.setEmployerMatchRate(request.getEmployerMatchRate());
        plan.setEmployerMatchLimit(request.getEmployerMatchLimit());
        plan.setExpectedAnnualReturn(request.getExpectedAnnualReturn());
        plan.setExpectedInflationRate(request.getExpectedInflationRate());
        plan.setSocialSecurityBenefit(request.getSocialSecurityBenefit());
        plan.setLifeExpectancy(request.getLifeExpectancy());

        return retirementPlanRepository.save(plan);
    }

    /**
     * Calculate comprehensive retirement projections
     */
    public RetirementCalculationResponse calculateRetirementProjection(Long planId) {
        RetirementPlan plan = retirementPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Retirement plan not found"));

        return calculateRetirementProjection(plan);
    }

    /**
     * Calculate retirement projections for a given plan
     */
    public RetirementCalculationResponse calculateRetirementProjection(RetirementPlan plan) {
        RetirementCalculationResponse response = new RetirementCalculationResponse();
        response.setPlanId(plan.getId());

        // Calculate years to retirement
        int yearsToRetirement = plan.getRetirementAge() - plan.getCurrentAge();
        int retirementYears = plan.getLifeExpectancy() - plan.getRetirementAge();

        // Calculate projected balances at retirement
        BigDecimal projected401kBalance = calculate401kProjection(plan, yearsToRetirement);
        BigDecimal projectedIraBalance = calculateIraProjection(plan, yearsToRetirement);
        BigDecimal projectedOtherSavings = calculateOtherSavingsProjection(plan, yearsToRetirement);
        
        BigDecimal totalRetirementBalance = projected401kBalance
                .add(projectedIraBalance)
                .add(projectedOtherSavings);

        response.setProjectedRetirementBalance(totalRetirementBalance);

        // Calculate monthly retirement income using 4% rule adjusted for inflation
        BigDecimal monthlyRetirementIncome = calculateMonthlyRetirementIncome(
                totalRetirementBalance, plan.getSocialSecurityBenefit(), retirementYears);
        response.setMonthlyRetirementIncome(monthlyRetirementIncome);

        // Calculate required monthly income based on replacement ratio
        BigDecimal inflationAdjustedIncome = adjustForInflation(
                plan.getCurrentAnnualIncome(), plan.getExpectedInflationRate(), yearsToRetirement);
        BigDecimal requiredMonthlyIncome = inflationAdjustedIncome
                .multiply(plan.getDesiredReplacementRatio())
                .divide(TWELVE, MATH_CONTEXT);
        response.setRequiredMonthlyIncome(requiredMonthlyIncome);

        // Calculate income shortfall
        BigDecimal incomeShortfall = requiredMonthlyIncome.subtract(monthlyRetirementIncome);
        response.setIncomeShortfall(incomeShortfall.max(BigDecimal.ZERO));

        // Calculate actual replacement ratio
        BigDecimal actualReplacementRatio = monthlyRetirementIncome
                .multiply(TWELVE)
                .divide(inflationAdjustedIncome, MATH_CONTEXT);
        response.setReplacementRatio(actualReplacementRatio);

        // Assess retirement readiness
        response.setRetirementReadiness(assessRetirementReadiness(actualReplacementRatio, plan.getDesiredReplacementRatio()));

        // Calculate recommended monthly savings if there's a shortfall
        if (incomeShortfall.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal recommendedSavings = calculateRecommendedMonthlySavings(incomeShortfall, yearsToRetirement, plan.getExpectedAnnualReturn());
            response.setRecommendedMonthlySavings(recommendedSavings);
        }

        // Create detailed breakdown
        RetirementCalculationResponse.RetirementBreakdown breakdown = new RetirementCalculationResponse.RetirementBreakdown();
        breakdown.setTotal401kBalance(projected401kBalance);
        breakdown.setTotalIraBalance(projectedIraBalance);
        breakdown.setTotalOtherSavings(projectedOtherSavings);
        breakdown.setTotalEmployerMatch(calculateTotalEmployerMatch(plan, yearsToRetirement));
        breakdown.setSocialSecurityValue(plan.getSocialSecurityBenefit());
        breakdown.setInflationAdjustedIncome(inflationAdjustedIncome);
        response.setBreakdown(breakdown);

        // Generate yearly projections
        List<RetirementCalculationResponse.YearlyProjection> yearlyProjections = 
                generateYearlyProjections(plan, yearsToRetirement);
        response.setYearlyProjections(yearlyProjections);

        return response;
    }

    /**
     * Calculate 401k balance projection with compound interest and employer matching
     */
    private BigDecimal calculate401kProjection(RetirementPlan plan, int years) {
        BigDecimal currentBalance = plan.getCurrent401kBalance() != null ? plan.getCurrent401kBalance() : BigDecimal.ZERO;
        BigDecimal monthlyContribution = plan.getMonthly401kContribution() != null ? plan.getMonthly401kContribution() : BigDecimal.ZERO;
        BigDecimal annualReturn = plan.getExpectedAnnualReturn() != null ? plan.getExpectedAnnualReturn() : new BigDecimal("0.07");
        
        // Calculate employer match
        BigDecimal employerMatch = calculateMonthlyEmployerMatch(plan);
        BigDecimal totalMonthlyContribution = monthlyContribution.add(employerMatch);
        
        return calculateCompoundGrowth(currentBalance, totalMonthlyContribution, annualReturn, years);
    }

    /**
     * Calculate IRA balance projection
     */
    private BigDecimal calculateIraProjection(RetirementPlan plan, int years) {
        BigDecimal currentBalance = plan.getCurrentIraBalance() != null ? plan.getCurrentIraBalance() : BigDecimal.ZERO;
        BigDecimal monthlyContribution = plan.getMonthlyIraContribution() != null ? plan.getMonthlyIraContribution() : BigDecimal.ZERO;
        BigDecimal annualReturn = plan.getExpectedAnnualReturn() != null ? plan.getExpectedAnnualReturn() : new BigDecimal("0.07");
        
        return calculateCompoundGrowth(currentBalance, monthlyContribution, annualReturn, years);
    }

    /**
     * Calculate other retirement savings projection
     */
    private BigDecimal calculateOtherSavingsProjection(RetirementPlan plan, int years) {
        BigDecimal currentBalance = plan.getOtherRetirementSavings() != null ? plan.getOtherRetirementSavings() : BigDecimal.ZERO;
        BigDecimal annualReturn = plan.getExpectedAnnualReturn() != null ? plan.getExpectedAnnualReturn() : new BigDecimal("0.07");
        
        // Assume no additional contributions to other savings
        return calculateCompoundGrowth(currentBalance, BigDecimal.ZERO, annualReturn, years);
    }

    /**
     * Calculate compound growth with regular contributions
     */
    private BigDecimal calculateCompoundGrowth(BigDecimal principal, BigDecimal monthlyContribution, 
                                             BigDecimal annualReturn, int years) {
        if (years <= 0) return principal;
        
        BigDecimal monthlyReturn = annualReturn.divide(TWELVE, MATH_CONTEXT);
        int totalMonths = years * 12;
        
        // Future value of principal: P * (1 + r)^n
        BigDecimal futureValuePrincipal = principal.multiply(
                BigDecimal.ONE.add(monthlyReturn).pow(totalMonths, MATH_CONTEXT));
        
        // Future value of annuity: PMT * [((1 + r)^n - 1) / r]
        BigDecimal futureValueAnnuity = BigDecimal.ZERO;
        if (monthlyContribution.compareTo(BigDecimal.ZERO) > 0 && monthlyReturn.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal compoundFactor = BigDecimal.ONE.add(monthlyReturn).pow(totalMonths, MATH_CONTEXT);
            futureValueAnnuity = monthlyContribution.multiply(
                    compoundFactor.subtract(BigDecimal.ONE).divide(monthlyReturn, MATH_CONTEXT));
        } else if (monthlyContribution.compareTo(BigDecimal.ZERO) > 0) {
            // If no return, just sum the contributions
            futureValueAnnuity = monthlyContribution.multiply(new BigDecimal(totalMonths));
        }
        
        return futureValuePrincipal.add(futureValueAnnuity);
    }

    /**
     * Calculate monthly employer match
     */
    private BigDecimal calculateMonthlyEmployerMatch(RetirementPlan plan) {
        if (plan.getEmployerMatchRate() == null || plan.getEmployerMatchLimit() == null || 
            plan.getMonthly401kContribution() == null || plan.getCurrentAnnualIncome() == null) {
            return BigDecimal.ZERO;
        }
        
        BigDecimal monthlyIncome = plan.getCurrentAnnualIncome().divide(TWELVE, MATH_CONTEXT);
        BigDecimal maxMatchableContribution = monthlyIncome.multiply(plan.getEmployerMatchLimit());
        BigDecimal actualMatchableContribution = plan.getMonthly401kContribution().min(maxMatchableContribution);
        
        return actualMatchableContribution.multiply(plan.getEmployerMatchRate());
    }

    /**
     * Calculate total employer match over the years
     */
    private BigDecimal calculateTotalEmployerMatch(RetirementPlan plan, int years) {
        BigDecimal monthlyMatch = calculateMonthlyEmployerMatch(plan);
        return monthlyMatch.multiply(new BigDecimal(years * 12));
    }

    /**
     * Calculate monthly retirement income using sustainable withdrawal rate
     */
    private BigDecimal calculateMonthlyRetirementIncome(BigDecimal totalBalance, BigDecimal socialSecurityBenefit, int retirementYears) {
        // Use 4% rule adjusted for retirement duration
        BigDecimal withdrawalRate = new BigDecimal("0.04");
        if (retirementYears > 30) {
            withdrawalRate = new BigDecimal("0.035"); // More conservative for longer retirement
        }
        
        BigDecimal monthlyWithdrawal = totalBalance.multiply(withdrawalRate).divide(TWELVE, MATH_CONTEXT);
        BigDecimal monthlySocialSecurity = socialSecurityBenefit != null ? socialSecurityBenefit : BigDecimal.ZERO;
        
        return monthlyWithdrawal.add(monthlySocialSecurity);
    }

    /**
     * Adjust amount for inflation
     */
    private BigDecimal adjustForInflation(BigDecimal amount, BigDecimal inflationRate, int years) {
        if (amount == null || inflationRate == null || years <= 0) {
            return amount != null ? amount : BigDecimal.ZERO;
        }
        
        BigDecimal inflationFactor = BigDecimal.ONE.add(inflationRate).pow(years, MATH_CONTEXT);
        return amount.multiply(inflationFactor);
    }

    /**
     * Assess retirement readiness based on replacement ratio
     */
    private String assessRetirementReadiness(BigDecimal actualRatio, BigDecimal desiredRatio) {
        if (actualRatio.compareTo(desiredRatio) >= 0) {
            return "ON_TRACK";
        } else if (actualRatio.compareTo(desiredRatio.multiply(new BigDecimal("0.8"))) >= 0) {
            return "NEEDS_IMPROVEMENT";
        } else {
            return "BEHIND";
        }
    }

    /**
     * Calculate recommended monthly savings to meet retirement goals
     */
    private BigDecimal calculateRecommendedMonthlySavings(BigDecimal monthlyShortfall, int years, BigDecimal annualReturn) {
        if (years <= 0) return BigDecimal.ZERO;
        
        // Calculate required lump sum at retirement to generate the shortfall income
        BigDecimal requiredLumpSum = monthlyShortfall.multiply(TWELVE).divide(new BigDecimal("0.04"), MATH_CONTEXT);
        
        // Calculate monthly savings needed to accumulate this lump sum
        BigDecimal monthlyReturn = annualReturn.divide(TWELVE, MATH_CONTEXT);
        int totalMonths = years * 12;
        
        if (monthlyReturn.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal compoundFactor = BigDecimal.ONE.add(monthlyReturn).pow(totalMonths, MATH_CONTEXT);
            return requiredLumpSum.multiply(monthlyReturn)
                    .divide(compoundFactor.subtract(BigDecimal.ONE), MATH_CONTEXT);
        } else {
            return requiredLumpSum.divide(new BigDecimal(totalMonths), MATH_CONTEXT);
        }
    }

    /**
     * Generate yearly projections for visualization
     */
    private List<RetirementCalculationResponse.YearlyProjection> generateYearlyProjections(RetirementPlan plan, int years) {
        List<RetirementCalculationResponse.YearlyProjection> projections = new ArrayList<>();
        
        BigDecimal current401k = plan.getCurrent401kBalance() != null ? plan.getCurrent401kBalance() : BigDecimal.ZERO;
        BigDecimal currentIra = plan.getCurrentIraBalance() != null ? plan.getCurrentIraBalance() : BigDecimal.ZERO;
        BigDecimal currentOther = plan.getOtherRetirementSavings() != null ? plan.getOtherRetirementSavings() : BigDecimal.ZERO;
        
        BigDecimal monthly401k = plan.getMonthly401kContribution() != null ? plan.getMonthly401kContribution() : BigDecimal.ZERO;
        BigDecimal monthlyIra = plan.getMonthlyIraContribution() != null ? plan.getMonthlyIraContribution() : BigDecimal.ZERO;
        BigDecimal monthlyEmployerMatch = calculateMonthlyEmployerMatch(plan);
        BigDecimal annualReturn = plan.getExpectedAnnualReturn() != null ? plan.getExpectedAnnualReturn() : new BigDecimal("0.07");
        
        for (int year = 0; year <= years; year++) {
            RetirementCalculationResponse.YearlyProjection projection = 
                    new RetirementCalculationResponse.YearlyProjection(year, plan.getCurrentAge() + year);
            
            // Calculate balances for this year
            projection.setTotal401kBalance(calculateCompoundGrowth(current401k, monthly401k.add(monthlyEmployerMatch), annualReturn, year));
            projection.setTotalIraBalance(calculateCompoundGrowth(currentIra, monthlyIra, annualReturn, year));
            projection.setTotalOtherSavings(calculateCompoundGrowth(currentOther, BigDecimal.ZERO, annualReturn, year));
            
            BigDecimal totalBalance = projection.getTotal401kBalance()
                    .add(projection.getTotalIraBalance())
                    .add(projection.getTotalOtherSavings());
            projection.setTotalBalance(totalBalance);
            
            // Calculate annual contributions and employer match for this year
            projection.setAnnualContributions(monthly401k.add(monthlyIra).multiply(TWELVE));
            projection.setEmployerMatch(monthlyEmployerMatch.multiply(TWELVE));
            
            projections.add(projection);
        }
        
        return projections;
    }

    /**
     * Get retirement plan by user ID
     */
    public Optional<RetirementPlan> getRetirementPlanByUserId(Long userId) {
        return retirementPlanRepository.findLatestByUserId(userId);
    }

    /**
     * Get all retirement plans for a user
     */
    public List<RetirementPlan> getAllRetirementPlansByUserId(Long userId) {
        return retirementPlanRepository.findByUserIdOrderByUpdatedAtDesc(userId);
    }

    /**
     * Delete retirement plan
     */
    public void deleteRetirementPlan(Long planId, Long userId) {
        RetirementPlan plan = retirementPlanRepository.findByIdAndUserId(planId, userId)
                .orElseThrow(() -> new RuntimeException("Retirement plan not found"));
        retirementPlanRepository.delete(plan);
    }
}