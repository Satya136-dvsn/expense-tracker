package com.budgettracker.service;

import com.budgettracker.dto.*;
import com.budgettracker.model.Debt;
import com.budgettracker.model.User;
import com.budgettracker.repository.DebtRepository;
import com.budgettracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class DebtOptimizationService {
    
    @Autowired
    private DebtRepository debtRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    private static final int SCALE = 2;
    private static final RoundingMode ROUNDING_MODE = RoundingMode.HALF_UP;
    
    /**
     * Calculate debt avalanche strategy (highest interest rate first)
     */
    public DebtOptimizationResponse calculateAvalancheStrategy(DebtOptimizationRequest request, String username) {
        User user = getUserByUsername(username);
        List<Debt> debts = getDebtsForOptimization(user, request.getDebtIds());
        
        if (debts.isEmpty()) {
            throw new RuntimeException("No active debts found for optimization");
        }
        
        // Sort by interest rate (highest first)
        List<Debt> sortedDebts = request.getDebtIds() != null && !request.getDebtIds().isEmpty() ?
                debtRepository.findSpecificDebtsOrderedByInterestRateDesc(user, request.getDebtIds()) :
                debtRepository.findActiveDebtsOrderedByInterestRateDesc(user);
        
        return calculateOptimizationStrategy(sortedDebts, request.getExtraPaymentAmount(), "AVALANCHE");
    }
    
    /**
     * Calculate debt snowball strategy (smallest balance first)
     */
    public DebtOptimizationResponse calculateSnowballStrategy(DebtOptimizationRequest request, String username) {
        User user = getUserByUsername(username);
        List<Debt> debts = getDebtsForOptimization(user, request.getDebtIds());
        
        if (debts.isEmpty()) {
            throw new RuntimeException("No active debts found for optimization");
        }
        
        // Sort by balance (smallest first)
        List<Debt> sortedDebts = request.getDebtIds() != null && !request.getDebtIds().isEmpty() ?
                debtRepository.findSpecificDebtsOrderedByBalanceAsc(user, request.getDebtIds()) :
                debtRepository.findActiveDebtsOrderedByBalanceAsc(user);
        
        return calculateOptimizationStrategy(sortedDebts, request.getExtraPaymentAmount(), "SNOWBALL");
    }
    
    /**
     * Compare both strategies and provide recommendation
     */
    public DebtOptimizationResponse.DebtOptimizationComparison compareStrategies(DebtOptimizationRequest request, String username) {
        DebtOptimizationResponse avalanche = calculateAvalancheStrategy(request, username);
        DebtOptimizationResponse snowball = calculateSnowballStrategy(request, username);
        
        // Determine recommended strategy
        String recommendedStrategy;
        String recommendationReason;
        
        BigDecimal interestSavings = avalanche.getTotalInterestPaid().subtract(snowball.getTotalInterestPaid());
        int timeDifference = avalanche.getPayoffTimeMonths() - snowball.getPayoffTimeMonths();
        
        if (interestSavings.compareTo(new BigDecimal("1000")) > 0 || Math.abs(timeDifference) <= 3) {
            recommendedStrategy = "AVALANCHE";
            recommendationReason = String.format(
                "The avalanche method saves $%.2f in interest over the snowball method. " +
                "This strategy is mathematically optimal and recommended when interest savings are significant.",
                interestSavings
            );
        } else if (snowball.getPayoffPlan().size() > 3) {
            recommendedStrategy = "SNOWBALL";
            recommendationReason = "The snowball method is recommended for psychological motivation. " +
                "With multiple debts, paying off smaller balances first can provide momentum and motivation to continue.";
        } else {
            recommendedStrategy = "AVALANCHE";
            recommendationReason = "The avalanche method is recommended as it minimizes total interest paid " +
                "and the psychological benefits of the snowball method are less significant with fewer debts.";
        }
        
        return new DebtOptimizationResponse.DebtOptimizationComparison(
                avalanche, snowball, recommendedStrategy, recommendationReason
        );
    }
    
    /**
     * Analyze debt consolidation options
     */
    public DebtConsolidationResponse analyzeConsolidation(BigDecimal consolidationRate, String username) {
        User user = getUserByUsername(username);
        List<Debt> activeDebts = debtRepository.findByUserAndStatus(user, Debt.DebtStatus.ACTIVE);
        
        if (activeDebts.isEmpty()) {
            throw new RuntimeException("No active debts found for consolidation analysis");
        }
        
        DebtConsolidationResponse response = new DebtConsolidationResponse();
        
        // Calculate current debt situation
        BigDecimal totalDebt = activeDebts.stream()
                .map(Debt::getCurrentBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalMinimumPayments = activeDebts.stream()
                .map(Debt::getMinimumPayment)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Calculate current total interest and payoff time using minimum payments
        DebtPayoffCalculation currentSituation = calculateTotalPayoffWithMinimumPayments(activeDebts);
        
        response.setTotalCurrentDebt(totalDebt);
        response.setTotalCurrentMinimumPayments(totalMinimumPayments);
        response.setTotalCurrentInterestPaid(currentSituation.getTotalInterest());
        response.setCurrentPayoffTimeMonths(currentSituation.getPayoffTimeMonths());
        
        // Calculate consolidated loan scenario
        response.setConsolidatedLoanAmount(totalDebt);
        response.setConsolidatedInterestRate(consolidationRate);
        
        // Calculate consolidated monthly payment (same as current total minimum payments)
        BigDecimal consolidatedPayment = totalMinimumPayments;
        response.setConsolidatedMonthlyPayment(consolidatedPayment);
        
        // Calculate consolidated loan payoff time and interest
        DebtPayoffCalculation consolidatedCalculation = calculateLoanPayoff(
                totalDebt, consolidationRate, consolidatedPayment
        );
        
        response.setConsolidatedTotalInterest(consolidatedCalculation.getTotalInterest());
        response.setConsolidatedPayoffTimeMonths(consolidatedCalculation.getPayoffTimeMonths());
        
        // Calculate savings
        BigDecimal interestSavings = currentSituation.getTotalInterest().subtract(consolidatedCalculation.getTotalInterest());
        Integer timeSavings = currentSituation.getPayoffTimeMonths() - consolidatedCalculation.getPayoffTimeMonths();
        
        response.setMonthlySavings(BigDecimal.ZERO); // Same monthly payment
        response.setTotalInterestSavings(interestSavings);
        response.setTimeSavingsMonths(timeSavings);
        
        // Determine if consolidation is beneficial
        boolean isBeneficial = interestSavings.compareTo(BigDecimal.ZERO) > 0 || timeSavings > 0;
        response.setIsConsolidationBeneficial(isBeneficial);
        
        // Generate recommendation and considerations
        generateConsolidationRecommendation(response, consolidationRate, activeDebts);
        
        return response;
    }
    
    /**
     * Compare minimum payments vs accelerated payments
     */
    public Map<String, Object> comparePaymentStrategies(BigDecimal extraPayment, String username) {
        User user = getUserByUsername(username);
        List<Debt> activeDebts = debtRepository.findByUserAndStatus(user, Debt.DebtStatus.ACTIVE);
        
        if (activeDebts.isEmpty()) {
            throw new RuntimeException("No active debts found for payment comparison");
        }
        
        Map<String, Object> comparison = new HashMap<>();
        
        // Calculate minimum payment scenario
        DebtPayoffCalculation minimumPaymentScenario = calculateTotalPayoffWithMinimumPayments(activeDebts);
        
        // Calculate accelerated payment scenario (using avalanche method)
        DebtOptimizationRequest request = new DebtOptimizationRequest(extraPayment);
        DebtOptimizationResponse acceleratedScenario = calculateAvalancheStrategy(request, username);
        
        // Prepare comparison data
        Map<String, Object> minimumPayments = new HashMap<>();
        minimumPayments.put("strategy", "Minimum Payments Only");
        minimumPayments.put("monthlyPayment", activeDebts.stream()
                .map(Debt::getMinimumPayment)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        minimumPayments.put("payoffTimeMonths", minimumPaymentScenario.getPayoffTimeMonths());
        minimumPayments.put("totalInterestPaid", minimumPaymentScenario.getTotalInterest());
        minimumPayments.put("totalAmountPaid", minimumPaymentScenario.getTotalAmountPaid());
        
        Map<String, Object> acceleratedPayments = new HashMap<>();
        acceleratedPayments.put("strategy", "Accelerated Payments (Avalanche)");
        acceleratedPayments.put("monthlyPayment", acceleratedScenario.getTotalMinimumPayments().add(extraPayment));
        acceleratedPayments.put("payoffTimeMonths", acceleratedScenario.getPayoffTimeMonths());
        acceleratedPayments.put("totalInterestPaid", acceleratedScenario.getTotalInterestPaid());
        acceleratedPayments.put("totalAmountPaid", acceleratedScenario.getTotalDebt().add(acceleratedScenario.getTotalInterestPaid()));
        
        // Calculate savings
        BigDecimal interestSavings = minimumPaymentScenario.getTotalInterest().subtract(acceleratedScenario.getTotalInterestPaid());
        Integer timeSavings = minimumPaymentScenario.getPayoffTimeMonths() - acceleratedScenario.getPayoffTimeMonths();
        BigDecimal totalSavings = minimumPaymentScenario.getTotalAmountPaid()
                .subtract(acceleratedScenario.getTotalDebt().add(acceleratedScenario.getTotalInterestPaid()));
        
        Map<String, Object> savings = new HashMap<>();
        savings.put("interestSavings", interestSavings);
        savings.put("timeSavingsMonths", timeSavings);
        savings.put("timeSavingsYears", timeSavings / 12.0);
        savings.put("totalSavings", totalSavings);
        
        comparison.put("minimumPaymentScenario", minimumPayments);
        comparison.put("acceleratedPaymentScenario", acceleratedPayments);
        comparison.put("savings", savings);
        comparison.put("extraPaymentAmount", extraPayment);
        
        // Add recommendation
        String recommendation;
        if (interestSavings.compareTo(new BigDecimal("500")) > 0) {
            recommendation = String.format(
                "Highly recommended! Extra payments of $%.2f per month will save you $%.2f in interest " +
                "and %d months of payments. This represents significant long-term savings.",
                extraPayment, interestSavings, timeSavings
            );
        } else if (interestSavings.compareTo(BigDecimal.ZERO) > 0) {
            recommendation = String.format(
                "Recommended if budget allows. Extra payments will save $%.2f in interest " +
                "and %d months of payments.",
                interestSavings, timeSavings
            );
        } else {
            recommendation = "Consider focusing on building an emergency fund or investing if debt interest rates are low.";
        }
        
        comparison.put("recommendation", recommendation);
        
        return comparison;
    }
    
    // Private helper methods
    
    private User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    private List<Debt> getDebtsForOptimization(User user, List<Long> debtIds) {
        if (debtIds != null && !debtIds.isEmpty()) {
            return debtRepository.findByUserAndIdIn(user, debtIds).stream()
                    .filter(debt -> debt.getStatus() == Debt.DebtStatus.ACTIVE)
                    .collect(Collectors.toList());
        } else {
            return debtRepository.findByUserAndStatus(user, Debt.DebtStatus.ACTIVE);
        }
    }
    
    private DebtOptimizationResponse calculateOptimizationStrategy(List<Debt> sortedDebts, 
                                                                   BigDecimal extraPayment, 
                                                                   String strategy) {
        BigDecimal totalDebt = sortedDebts.stream()
                .map(Debt::getCurrentBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalMinimumPayments = sortedDebts.stream()
                .map(Debt::getMinimumPayment)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        List<DebtOptimizationResponse.DebtPayoffPlan> payoffPlan = new ArrayList<>();
        BigDecimal totalInterestPaid = BigDecimal.ZERO;
        int maxPayoffTime = 0;
        
        // Calculate payoff plan for each debt
        BigDecimal availableExtraPayment = extraPayment;
        
        for (int i = 0; i < sortedDebts.size(); i++) {
            Debt debt = sortedDebts.get(i);
            
            // For the first debt in order, add all extra payment
            BigDecimal debtPayment = debt.getMinimumPayment();
            if (i == 0) {
                debtPayment = debtPayment.add(availableExtraPayment);
            }
            
            // Calculate payoff time and interest for this debt
            DebtPayoffCalculation calculation = calculateLoanPayoff(
                    debt.getCurrentBalance(), 
                    debt.getInterestRate(), 
                    debtPayment
            );
            
            DebtOptimizationResponse.DebtPayoffPlan plan = new DebtOptimizationResponse.DebtPayoffPlan(
                    debt.getId(),
                    debt.getName(),
                    debt.getCurrentBalance(),
                    debt.getInterestRate(),
                    debt.getMinimumPayment(),
                    debtPayment,
                    i + 1,
                    calculation.getPayoffTimeMonths(),
                    calculation.getTotalInterest()
            );
            
            payoffPlan.add(plan);
            totalInterestPaid = totalInterestPaid.add(calculation.getTotalInterest());
            
            // Update max payoff time (considering debt order)
            int cumulativeTime = i == 0 ? calculation.getPayoffTimeMonths() : 
                    maxPayoffTime + calculation.getPayoffTimeMonths();
            maxPayoffTime = Math.max(maxPayoffTime, cumulativeTime);
            
            // After first debt is paid off, its payment becomes available for the next debt
            if (i == 0) {
                availableExtraPayment = debtPayment;
            }
        }
        
        DebtOptimizationResponse response = new DebtOptimizationResponse(
                strategy,
                totalDebt,
                totalMinimumPayments,
                extraPayment,
                maxPayoffTime,
                totalInterestPaid,
                payoffPlan
        );
        
        return response;
    }
    
    private DebtPayoffCalculation calculateLoanPayoff(BigDecimal principal, BigDecimal annualRate, BigDecimal monthlyPayment) {
        if (monthlyPayment.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Monthly payment must be greater than zero");
        }
        
        BigDecimal monthlyRate = annualRate.divide(new BigDecimal("1200"), 6, ROUNDING_MODE);
        BigDecimal balance = principal;
        BigDecimal totalInterest = BigDecimal.ZERO;
        int months = 0;
        
        // Prevent infinite loops
        int maxMonths = 600; // 50 years maximum
        
        while (balance.compareTo(new BigDecimal("0.01")) > 0 && months < maxMonths) {
            BigDecimal interestPayment = balance.multiply(monthlyRate).setScale(SCALE, ROUNDING_MODE);
            BigDecimal principalPayment = monthlyPayment.subtract(interestPayment);
            
            // If payment is less than interest, loan will never be paid off
            if (principalPayment.compareTo(BigDecimal.ZERO) <= 0) {
                throw new RuntimeException("Monthly payment is too low to pay off the debt");
            }
            
            // Don't pay more principal than remaining balance
            if (principalPayment.compareTo(balance) > 0) {
                principalPayment = balance;
            }
            
            balance = balance.subtract(principalPayment);
            totalInterest = totalInterest.add(interestPayment);
            months++;
        }
        
        return new DebtPayoffCalculation(months, totalInterest, principal.add(totalInterest));
    }
    
    private DebtPayoffCalculation calculateTotalPayoffWithMinimumPayments(List<Debt> debts) {
        BigDecimal totalInterest = BigDecimal.ZERO;
        int maxPayoffTime = 0;
        BigDecimal totalAmountPaid = BigDecimal.ZERO;
        
        for (Debt debt : debts) {
            try {
                DebtPayoffCalculation calculation = calculateLoanPayoff(
                        debt.getCurrentBalance(),
                        debt.getInterestRate(),
                        debt.getMinimumPayment()
                );
                
                totalInterest = totalInterest.add(calculation.getTotalInterest());
                maxPayoffTime = Math.max(maxPayoffTime, calculation.getPayoffTimeMonths());
                totalAmountPaid = totalAmountPaid.add(calculation.getTotalAmountPaid());
            } catch (RuntimeException e) {
                // If a debt can't be paid off with minimum payment, use a high estimate
                maxPayoffTime = Math.max(maxPayoffTime, 600); // 50 years
                totalInterest = totalInterest.add(debt.getCurrentBalance().multiply(new BigDecimal("2"))); // Rough estimate
                totalAmountPaid = totalAmountPaid.add(debt.getCurrentBalance().multiply(new BigDecimal("3")));
            }
        }
        
        return new DebtPayoffCalculation(maxPayoffTime, totalInterest, totalAmountPaid);
    }
    
    private void generateConsolidationRecommendation(DebtConsolidationResponse response, 
                                                     BigDecimal consolidationRate, 
                                                     List<Debt> debts) {
        List<String> benefits = new ArrayList<>();
        List<String> considerations = new ArrayList<>();
        
        if (response.getIsConsolidationBeneficial()) {
            response.setRecommendation(String.format(
                "Debt consolidation is recommended. You could save $%.2f in interest over the life of your loans.",
                response.getTotalInterestSavings()
            ));
            
            benefits.add("Lower overall interest rate");
            benefits.add("Simplified payment management (one payment instead of " + debts.size() + ")");
            benefits.add(String.format("Save $%.2f in total interest", response.getTotalInterestSavings()));
            
            if (response.getTimeSavingsMonths() > 0) {
                benefits.add(String.format("Pay off debt %d months earlier", response.getTimeSavingsMonths()));
            }
        } else {
            response.setRecommendation(
                "Debt consolidation may not be beneficial at this interest rate. " +
                "Consider negotiating a lower rate or exploring other debt reduction strategies."
            );
            
            considerations.add("Consolidation rate is not significantly lower than current average rate");
            considerations.add("May not provide substantial interest savings");
        }
        
        // General considerations
        considerations.add("Ensure you qualify for the consolidation loan rate");
        considerations.add("Consider any fees associated with the consolidation loan");
        considerations.add("Avoid taking on new debt after consolidation");
        considerations.add("Consider the impact on your credit score");
        
        response.setBenefits(benefits);
        response.setConsiderations(considerations);
    }
    
    // Helper class for payoff calculations
    private static class DebtPayoffCalculation {
        private final Integer payoffTimeMonths;
        private final BigDecimal totalInterest;
        private final BigDecimal totalAmountPaid;
        
        public DebtPayoffCalculation(Integer payoffTimeMonths, BigDecimal totalInterest, BigDecimal totalAmountPaid) {
            this.payoffTimeMonths = payoffTimeMonths;
            this.totalInterest = totalInterest;
            this.totalAmountPaid = totalAmountPaid;
        }
        
        public Integer getPayoffTimeMonths() {
            return payoffTimeMonths;
        }
        
        public BigDecimal getTotalInterest() {
            return totalInterest;
        }
        
        public BigDecimal getTotalAmountPaid() {
            return totalAmountPaid;
        }
    }
}