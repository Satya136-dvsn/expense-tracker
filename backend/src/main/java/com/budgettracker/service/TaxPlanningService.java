package com.budgettracker.service;

import com.budgettracker.dto.TaxCalculationResponse;
import com.budgettracker.dto.TaxPlanRequest;
import com.budgettracker.model.TaxPlan;
import com.budgettracker.model.User;
import com.budgettracker.repository.TaxPlanRepository;
import com.budgettracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
@Transactional
public class TaxPlanningService {
    
    @Autowired
    private TaxPlanRepository taxPlanRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    private static final int SCALE = 2;
    private static final RoundingMode ROUNDING_MODE = RoundingMode.HALF_UP;
    
    // 2024 Tax brackets for single filers (simplified)
    private static final Map<TaxPlan.FilingStatus, List<TaxBracket>> TAX_BRACKETS_2024 = new HashMap<>();
    
    static {
        // Single filers
        TAX_BRACKETS_2024.put(TaxPlan.FilingStatus.SINGLE, Arrays.asList(
            new TaxBracket(BigDecimal.ZERO, new BigDecimal("11000"), new BigDecimal("0.10")),
            new TaxBracket(new BigDecimal("11000"), new BigDecimal("44725"), new BigDecimal("0.12")),
            new TaxBracket(new BigDecimal("44725"), new BigDecimal("95375"), new BigDecimal("0.22")),
            new TaxBracket(new BigDecimal("95375"), new BigDecimal("182050"), new BigDecimal("0.24")),
            new TaxBracket(new BigDecimal("182050"), new BigDecimal("231250"), new BigDecimal("0.32")),
            new TaxBracket(new BigDecimal("231250"), new BigDecimal("578125"), new BigDecimal("0.35")),
            new TaxBracket(new BigDecimal("578125"), null, new BigDecimal("0.37"))
        ));
        
        // Married filing jointly
        TAX_BRACKETS_2024.put(TaxPlan.FilingStatus.MARRIED_FILING_JOINTLY, Arrays.asList(
            new TaxBracket(BigDecimal.ZERO, new BigDecimal("22000"), new BigDecimal("0.10")),
            new TaxBracket(new BigDecimal("22000"), new BigDecimal("89450"), new BigDecimal("0.12")),
            new TaxBracket(new BigDecimal("89450"), new BigDecimal("190750"), new BigDecimal("0.22")),
            new TaxBracket(new BigDecimal("190750"), new BigDecimal("364200"), new BigDecimal("0.24")),
            new TaxBracket(new BigDecimal("364200"), new BigDecimal("462500"), new BigDecimal("0.32")),
            new TaxBracket(new BigDecimal("462500"), new BigDecimal("693750"), new BigDecimal("0.35")),
            new TaxBracket(new BigDecimal("693750"), null, new BigDecimal("0.37"))
        ));
        
        // Head of household
        TAX_BRACKETS_2024.put(TaxPlan.FilingStatus.HEAD_OF_HOUSEHOLD, Arrays.asList(
            new TaxBracket(BigDecimal.ZERO, new BigDecimal("15700"), new BigDecimal("0.10")),
            new TaxBracket(new BigDecimal("15700"), new BigDecimal("59850"), new BigDecimal("0.12")),
            new TaxBracket(new BigDecimal("59850"), new BigDecimal("95350"), new BigDecimal("0.22")),
            new TaxBracket(new BigDecimal("95350"), new BigDecimal("182050"), new BigDecimal("0.24")),
            new TaxBracket(new BigDecimal("182050"), new BigDecimal("231250"), new BigDecimal("0.32")),
            new TaxBracket(new BigDecimal("231250"), new BigDecimal("578100"), new BigDecimal("0.35")),
            new TaxBracket(new BigDecimal("578100"), null, new BigDecimal("0.37"))
        ));
    }
    
    // 2024 Standard deductions
    private static final Map<TaxPlan.FilingStatus, BigDecimal> STANDARD_DEDUCTIONS_2024 = new HashMap<>();
    
    static {
        STANDARD_DEDUCTIONS_2024.put(TaxPlan.FilingStatus.SINGLE, new BigDecimal("13850"));
        STANDARD_DEDUCTIONS_2024.put(TaxPlan.FilingStatus.MARRIED_FILING_JOINTLY, new BigDecimal("27700"));
        STANDARD_DEDUCTIONS_2024.put(TaxPlan.FilingStatus.MARRIED_FILING_SEPARATELY, new BigDecimal("13850"));
        STANDARD_DEDUCTIONS_2024.put(TaxPlan.FilingStatus.HEAD_OF_HOUSEHOLD, new BigDecimal("20800"));
        STANDARD_DEDUCTIONS_2024.put(TaxPlan.FilingStatus.QUALIFYING_WIDOW, new BigDecimal("27700"));
    }
    
    // 2024 Contribution limits
    private static final Map<String, BigDecimal> CONTRIBUTION_LIMITS_2024 = new HashMap<>();
    
    static {
        CONTRIBUTION_LIMITS_2024.put("401k", new BigDecimal("22500"));
        CONTRIBUTION_LIMITS_2024.put("401k_catchup", new BigDecimal("7500")); // Age 50+
        CONTRIBUTION_LIMITS_2024.put("ira", new BigDecimal("6000"));
        CONTRIBUTION_LIMITS_2024.put("ira_catchup", new BigDecimal("1000")); // Age 50+
        CONTRIBUTION_LIMITS_2024.put("hsa_individual", new BigDecimal("3650"));
        CONTRIBUTION_LIMITS_2024.put("hsa_family", new BigDecimal("7300"));
        CONTRIBUTION_LIMITS_2024.put("hsa_catchup", new BigDecimal("1000")); // Age 55+
    }
    
    /**
     * Create or update tax plan
     */
    public TaxPlan createOrUpdateTaxPlan(TaxPlanRequest request, String username) {
        User user = getUserByUsername(username);
        
        // Check if plan already exists for this year
        Optional<TaxPlan> existingPlan = taxPlanRepository.findByUserAndTaxYear(user, request.getTaxYear());
        
        TaxPlan taxPlan;
        if (existingPlan.isPresent()) {
            taxPlan = existingPlan.get();
        } else {
            taxPlan = new TaxPlan(user, request.getTaxYear(), request.getFilingStatus(), request.getAnnualIncome());
        }
        
        // Update all fields
        updateTaxPlanFromRequest(taxPlan, request);
        
        // Set standard deduction if not provided
        if (taxPlan.getStandardDeduction() == null || taxPlan.getStandardDeduction().compareTo(BigDecimal.ZERO) == 0) {
            taxPlan.setStandardDeduction(getStandardDeduction(taxPlan.getFilingStatus(), taxPlan.getTaxYear()));
        }
        
        return taxPlanRepository.save(taxPlan);
    }
    
    /**
     * Calculate comprehensive tax information
     */
    public TaxCalculationResponse calculateTaxes(TaxPlan taxPlan) {
        TaxCalculationResponse response = new TaxCalculationResponse();
        
        response.setTaxYear(taxPlan.getTaxYear());
        response.setFilingStatus(taxPlan.getFilingStatus().name());
        response.setAnnualIncome(taxPlan.getAnnualIncome());
        
        // Calculate AGI (simplified - just subtract pre-tax contributions)
        BigDecimal agi = calculateAdjustedGrossIncome(taxPlan);
        response.setAdjustedGrossIncome(agi);
        
        // Calculate deductions
        BigDecimal standardDeduction = getStandardDeduction(taxPlan.getFilingStatus(), taxPlan.getTaxYear());
        BigDecimal itemizedDeductions = calculateItemizedDeductions(taxPlan);
        
        response.setStandardDeduction(standardDeduction);
        response.setItemizedDeductions(itemizedDeductions);
        response.setShouldItemize(itemizedDeductions.compareTo(standardDeduction) > 0);
        response.setTotalDeductions(response.getShouldItemize() ? itemizedDeductions : standardDeduction);
        
        // Calculate taxable income
        BigDecimal taxableIncome = agi.subtract(response.getTotalDeductions());
        if (taxableIncome.compareTo(BigDecimal.ZERO) < 0) {
            taxableIncome = BigDecimal.ZERO;
        }
        response.setTaxableIncome(taxableIncome);
        
        // Calculate federal tax
        TaxCalculationResult federalTax = calculateFederalTax(taxableIncome, taxPlan.getFilingStatus());
        response.setFederalTaxOwed(federalTax.getTaxOwed());
        response.setFederalTaxBrackets(federalTax.getTaxBrackets());
        response.setEffectiveTaxRate(federalTax.getEffectiveRate());
        response.setMarginalTaxRate(federalTax.getMarginalRate());
        
        // Calculate state tax (simplified - assume 5% flat rate)
        BigDecimal stateTax = taxableIncome.multiply(new BigDecimal("0.05")).setScale(SCALE, ROUNDING_MODE);
        response.setStateTaxOwed(stateTax);
        
        BigDecimal totalTax = federalTax.getTaxOwed().add(stateTax);
        response.setTotalTaxOwed(totalTax);
        
        // Calculate withholding and refund/amount due
        BigDecimal totalWithholding = taxPlan.getTotalWithholding();
        response.setTotalWithholding(totalWithholding);
        response.setFederalWithholding(taxPlan.getFederalWithholding());
        response.setStateWithholding(taxPlan.getStateWithholding());
        response.setEstimatedTaxPayments(taxPlan.getEstimatedTaxPayments());
        
        BigDecimal refundOrDue = totalWithholding.subtract(totalTax);
        response.setRefundOrAmountDue(refundOrDue.abs());
        response.setIsRefund(refundOrDue.compareTo(BigDecimal.ZERO) >= 0);
        
        // Generate optimization suggestions
        response.setOptimizationSuggestions(generateOptimizationSuggestions(taxPlan, response));
        response.setPotentialTaxSavings(calculatePotentialSavings(response.getOptimizationSuggestions()));
        
        // Tax-advantaged account analysis
        response.setTaxAdvantageAnalysis(analyzeTaxAdvantageAccounts(taxPlan));
        
        return response;
    }
    
    /**
     * Calculate tax bracket information
     */
    public TaxCalculationResponse calculateTaxBrackets(BigDecimal income, TaxPlan.FilingStatus filingStatus) {
        TaxCalculationResponse response = new TaxCalculationResponse();
        
        TaxCalculationResult result = calculateFederalTax(income, filingStatus);
        response.setFederalTaxBrackets(result.getTaxBrackets());
        response.setEffectiveTaxRate(result.getEffectiveRate());
        response.setMarginalTaxRate(result.getMarginalRate());
        response.setFederalTaxOwed(result.getTaxOwed());
        
        return response;
    }
    
    /**
     * Optimize tax-advantaged account contributions
     */
    public Map<String, Object> optimizeContributions(BigDecimal income, TaxPlan.FilingStatus filingStatus, Integer age) {
        Map<String, Object> optimization = new HashMap<>();
        
        // Calculate current tax bracket
        TaxCalculationResult currentTax = calculateFederalTax(income, filingStatus);
        BigDecimal marginalRate = currentTax.getMarginalRate();
        
        // Calculate optimal contributions
        Map<String, BigDecimal> optimalContributions = new HashMap<>();
        Map<String, BigDecimal> taxSavings = new HashMap<>();
        
        // 401k optimization
        BigDecimal max401k = CONTRIBUTION_LIMITS_2024.get("401k");
        if (age >= 50) {
            max401k = max401k.add(CONTRIBUTION_LIMITS_2024.get("401k_catchup"));
        }
        optimalContributions.put("401k", max401k);
        taxSavings.put("401k", max401k.multiply(marginalRate).setScale(SCALE, ROUNDING_MODE));
        
        // IRA optimization
        BigDecimal maxIra = CONTRIBUTION_LIMITS_2024.get("ira");
        if (age >= 50) {
            maxIra = maxIra.add(CONTRIBUTION_LIMITS_2024.get("ira_catchup"));
        }
        optimalContributions.put("traditionalIRA", maxIra);
        taxSavings.put("traditionalIRA", maxIra.multiply(marginalRate).setScale(SCALE, ROUNDING_MODE));
        
        // HSA optimization (assume individual coverage)
        BigDecimal maxHsa = CONTRIBUTION_LIMITS_2024.get("hsa_individual");
        if (age >= 55) {
            maxHsa = maxHsa.add(CONTRIBUTION_LIMITS_2024.get("hsa_catchup"));
        }
        optimalContributions.put("hsa", maxHsa);
        taxSavings.put("hsa", maxHsa.multiply(marginalRate).setScale(SCALE, ROUNDING_MODE));
        
        BigDecimal totalOptimalContributions = optimalContributions.values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalTaxSavings = taxSavings.values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        optimization.put("optimalContributions", optimalContributions);
        optimization.put("taxSavings", taxSavings);
        optimization.put("totalOptimalContributions", totalOptimalContributions);
        optimization.put("totalTaxSavings", totalTaxSavings);
        optimization.put("marginalTaxRate", marginalRate);
        
        return optimization;
    }
    
    /**
     * Calculate tax-loss harvesting opportunities
     */
    public Map<String, Object> calculateTaxLossHarvesting(BigDecimal capitalGains, BigDecimal capitalLosses, 
                                                          BigDecimal marginalTaxRate) {
        Map<String, Object> analysis = new HashMap<>();
        
        BigDecimal netGains = capitalGains.subtract(capitalLosses);
        BigDecimal maxLossDeduction = new BigDecimal("3000"); // Annual limit for ordinary income offset
        
        if (netGains.compareTo(BigDecimal.ZERO) > 0) {
            // Net gains - calculate tax owed
            BigDecimal capitalGainsTax = netGains.multiply(new BigDecimal("0.15")).setScale(SCALE, ROUNDING_MODE); // Assume 15% capital gains rate
            analysis.put("capitalGainsTaxOwed", capitalGainsTax);
            analysis.put("recommendation", "Consider harvesting losses to offset gains");
        } else if (netGains.compareTo(BigDecimal.ZERO) < 0) {
            // Net losses
            BigDecimal netLosses = netGains.abs();
            BigDecimal ordinaryIncomeOffset = netLosses.min(maxLossDeduction);
            BigDecimal carryForwardLoss = netLosses.subtract(ordinaryIncomeOffset);
            
            BigDecimal taxSavings = ordinaryIncomeOffset.multiply(marginalTaxRate).setScale(SCALE, ROUNDING_MODE);
            
            analysis.put("ordinaryIncomeOffset", ordinaryIncomeOffset);
            analysis.put("carryForwardLoss", carryForwardLoss);
            analysis.put("taxSavings", taxSavings);
            analysis.put("recommendation", "Utilize capital losses to reduce taxable income");
        } else {
            analysis.put("recommendation", "No capital gains or losses to optimize");
        }
        
        analysis.put("netCapitalGains", netGains);
        analysis.put("maxAnnualLossDeduction", maxLossDeduction);
        
        return analysis;
    }
    
    // Private helper methods
    
    private User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    private void updateTaxPlanFromRequest(TaxPlan taxPlan, TaxPlanRequest request) {
        taxPlan.setTaxYear(request.getTaxYear());
        taxPlan.setFilingStatus(request.getFilingStatus());
        taxPlan.setAnnualIncome(request.getAnnualIncome());
        taxPlan.setFederalWithholding(request.getFederalWithholding());
        taxPlan.setStateWithholding(request.getStateWithholding());
        taxPlan.setEstimatedTaxPayments(request.getEstimatedTaxPayments());
        taxPlan.setStandardDeduction(request.getStandardDeduction());
        taxPlan.setItemizedDeductions(request.getItemizedDeductions());
        taxPlan.setMortgageInterest(request.getMortgageInterest());
        taxPlan.setStateLocalTaxes(request.getStateLocalTaxes());
        taxPlan.setCharitableContributions(request.getCharitableContributions());
        taxPlan.setMedicalExpenses(request.getMedicalExpenses());
        taxPlan.setTraditional401kContribution(request.getTraditional401kContribution());
        taxPlan.setTraditionalIraContribution(request.getTraditionalIraContribution());
        taxPlan.setRothIraContribution(request.getRothIraContribution());
        taxPlan.setHsaContribution(request.getHsaContribution());
        taxPlan.setCapitalGains(request.getCapitalGains());
        taxPlan.setCapitalLosses(request.getCapitalLosses());
        taxPlan.setDividendIncome(request.getDividendIncome());
        taxPlan.setInterestIncome(request.getInterestIncome());
    }
    
    private BigDecimal getStandardDeduction(TaxPlan.FilingStatus filingStatus, Integer taxYear) {
        // For now, use 2024 values regardless of year
        return STANDARD_DEDUCTIONS_2024.getOrDefault(filingStatus, new BigDecimal("13850"));
    }
    
    private BigDecimal calculateAdjustedGrossIncome(TaxPlan taxPlan) {
        BigDecimal income = taxPlan.getAnnualIncome();
        
        // Subtract pre-tax contributions
        if (taxPlan.getTraditional401kContribution() != null) {
            income = income.subtract(taxPlan.getTraditional401kContribution());
        }
        if (taxPlan.getTraditionalIraContribution() != null) {
            income = income.subtract(taxPlan.getTraditionalIraContribution());
        }
        if (taxPlan.getHsaContribution() != null) {
            income = income.subtract(taxPlan.getHsaContribution());
        }
        
        // Add investment income
        if (taxPlan.getDividendIncome() != null) {
            income = income.add(taxPlan.getDividendIncome());
        }
        if (taxPlan.getInterestIncome() != null) {
            income = income.add(taxPlan.getInterestIncome());
        }
        if (taxPlan.getNetCapitalGains().compareTo(BigDecimal.ZERO) > 0) {
            income = income.add(taxPlan.getNetCapitalGains());
        }
        
        return income;
    }
    
    private BigDecimal calculateItemizedDeductions(TaxPlan taxPlan) {
        BigDecimal itemized = BigDecimal.ZERO;
        
        if (taxPlan.getMortgageInterest() != null) {
            itemized = itemized.add(taxPlan.getMortgageInterest());
        }
        if (taxPlan.getStateLocalTaxes() != null) {
            // SALT deduction cap of $10,000
            BigDecimal saltCap = new BigDecimal("10000");
            itemized = itemized.add(taxPlan.getStateLocalTaxes().min(saltCap));
        }
        if (taxPlan.getCharitableContributions() != null) {
            itemized = itemized.add(taxPlan.getCharitableContributions());
        }
        if (taxPlan.getMedicalExpenses() != null) {
            // Medical expenses over 7.5% of AGI
            BigDecimal agi = calculateAdjustedGrossIncome(taxPlan);
            BigDecimal threshold = agi.multiply(new BigDecimal("0.075"));
            BigDecimal deductibleMedical = taxPlan.getMedicalExpenses().subtract(threshold);
            if (deductibleMedical.compareTo(BigDecimal.ZERO) > 0) {
                itemized = itemized.add(deductibleMedical);
            }
        }
        
        return itemized;
    }
    
    private TaxCalculationResult calculateFederalTax(BigDecimal taxableIncome, TaxPlan.FilingStatus filingStatus) {
        List<TaxBracket> brackets = TAX_BRACKETS_2024.get(filingStatus);
        if (brackets == null) {
            brackets = TAX_BRACKETS_2024.get(TaxPlan.FilingStatus.SINGLE);
        }
        
        BigDecimal totalTax = BigDecimal.ZERO;
        BigDecimal remainingIncome = taxableIncome;
        List<TaxCalculationResponse.TaxBracketInfo> bracketInfos = new ArrayList<>();
        BigDecimal marginalRate = BigDecimal.ZERO;
        
        for (TaxBracket bracket : brackets) {
            if (remainingIncome.compareTo(BigDecimal.ZERO) <= 0) {
                break;
            }
            
            BigDecimal bracketMin = bracket.getMinIncome();
            BigDecimal bracketMax = bracket.getMaxIncome();
            BigDecimal rate = bracket.getRate();
            
            if (taxableIncome.compareTo(bracketMin) > 0) {
                BigDecimal taxableInThisBracket;
                
                if (bracketMax == null) {
                    // Top bracket
                    taxableInThisBracket = remainingIncome;
                } else {
                    taxableInThisBracket = taxableIncome.min(bracketMax).subtract(bracketMin);
                }
                
                if (taxableInThisBracket.compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal taxInBracket = taxableInThisBracket.multiply(rate).setScale(SCALE, ROUNDING_MODE);
                    totalTax = totalTax.add(taxInBracket);
                    
                    bracketInfos.add(new TaxCalculationResponse.TaxBracketInfo(
                            bracketMin, bracketMax, rate.multiply(new BigDecimal("100")), taxInBracket));
                    
                    marginalRate = rate;
                    remainingIncome = remainingIncome.subtract(taxableInThisBracket);
                }
            }
        }
        
        BigDecimal effectiveRate = taxableIncome.compareTo(BigDecimal.ZERO) > 0 ?
                totalTax.divide(taxableIncome, 4, ROUNDING_MODE) : BigDecimal.ZERO;
        
        return new TaxCalculationResult(totalTax, bracketInfos, effectiveRate.multiply(new BigDecimal("100")), 
                marginalRate.multiply(new BigDecimal("100")));
    }
    
    private List<TaxCalculationResponse.TaxOptimizationSuggestion> generateOptimizationSuggestions(TaxPlan taxPlan, TaxCalculationResponse response) {
        List<TaxCalculationResponse.TaxOptimizationSuggestion> suggestions = new ArrayList<>();
        
        // Check if should itemize
        if (!response.getShouldItemize() && response.getItemizedDeductions().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal potentialSavings = response.getItemizedDeductions().subtract(response.getStandardDeduction())
                    .multiply(response.getMarginalTaxRate().divide(new BigDecimal("100"), 4, ROUNDING_MODE));
            
            if (potentialSavings.compareTo(BigDecimal.ZERO) > 0) {
                suggestions.add(new TaxCalculationResponse.TaxOptimizationSuggestion(
                        "Deductions", "Consider itemizing deductions", potentialSavings, "HIGH",
                        "Your itemized deductions may exceed the standard deduction"));
            }
        }
        
        // Check 401k contributions
        BigDecimal current401k = taxPlan.getTraditional401kContribution() != null ? 
                taxPlan.getTraditional401kContribution() : BigDecimal.ZERO;
        BigDecimal max401k = CONTRIBUTION_LIMITS_2024.get("401k");
        
        if (current401k.compareTo(max401k) < 0) {
            BigDecimal additional = max401k.subtract(current401k);
            BigDecimal savings = additional.multiply(response.getMarginalTaxRate().divide(new BigDecimal("100"), 4, ROUNDING_MODE));
            
            suggestions.add(new TaxCalculationResponse.TaxOptimizationSuggestion(
                    "Retirement", "Maximize 401k contributions", savings, "HIGH",
                    String.format("You can contribute an additional $%.2f to your 401k", additional)));
        }
        
        // Check HSA contributions
        BigDecimal currentHsa = taxPlan.getHsaContribution() != null ? 
                taxPlan.getHsaContribution() : BigDecimal.ZERO;
        BigDecimal maxHsa = CONTRIBUTION_LIMITS_2024.get("hsa_individual");
        
        if (currentHsa.compareTo(maxHsa) < 0) {
            BigDecimal additional = maxHsa.subtract(currentHsa);
            BigDecimal savings = additional.multiply(response.getMarginalTaxRate().divide(new BigDecimal("100"), 4, ROUNDING_MODE));
            
            suggestions.add(new TaxCalculationResponse.TaxOptimizationSuggestion(
                    "Healthcare", "Maximize HSA contributions", savings, "HIGH",
                    "HSA contributions are triple tax-advantaged"));
        }
        
        // Check capital loss harvesting
        if (taxPlan.getCapitalLosses() != null && taxPlan.getCapitalLosses().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal maxDeduction = new BigDecimal("3000");
            BigDecimal deductibleLoss = taxPlan.getCapitalLosses().min(maxDeduction);
            BigDecimal savings = deductibleLoss.multiply(response.getMarginalTaxRate().divide(new BigDecimal("100"), 4, ROUNDING_MODE));
            
            suggestions.add(new TaxCalculationResponse.TaxOptimizationSuggestion(
                    "Investments", "Utilize capital losses", savings, "MEDIUM",
                    "Capital losses can offset ordinary income up to $3,000 annually"));
        }
        
        return suggestions;
    }
    
    private BigDecimal calculatePotentialSavings(List<TaxCalculationResponse.TaxOptimizationSuggestion> suggestions) {
        return suggestions.stream()
                .map(TaxCalculationResponse.TaxOptimizationSuggestion::getPotentialSavings)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    private TaxCalculationResponse.TaxAdvantageAnalysis analyzeTaxAdvantageAccounts(TaxPlan taxPlan) {
        TaxCalculationResponse.TaxAdvantageAnalysis analysis = new TaxCalculationResponse.TaxAdvantageAnalysis();
        
        Map<String, BigDecimal> current = new HashMap<>();
        Map<String, BigDecimal> max = new HashMap<>();
        Map<String, BigDecimal> remaining = new HashMap<>();
        
        // 401k analysis
        BigDecimal current401k = taxPlan.getTraditional401kContribution() != null ? 
                taxPlan.getTraditional401kContribution() : BigDecimal.ZERO;
        BigDecimal max401k = CONTRIBUTION_LIMITS_2024.get("401k");
        
        current.put("401k", current401k);
        max.put("401k", max401k);
        remaining.put("401k", max401k.subtract(current401k));
        
        // IRA analysis
        BigDecimal currentIra = taxPlan.getTraditionalIraContribution() != null ? 
                taxPlan.getTraditionalIraContribution() : BigDecimal.ZERO;
        BigDecimal maxIra = CONTRIBUTION_LIMITS_2024.get("ira");
        
        current.put("traditionalIRA", currentIra);
        max.put("traditionalIRA", maxIra);
        remaining.put("traditionalIRA", maxIra.subtract(currentIra));
        
        // HSA analysis
        BigDecimal currentHsa = taxPlan.getHsaContribution() != null ? 
                taxPlan.getHsaContribution() : BigDecimal.ZERO;
        BigDecimal maxHsa = CONTRIBUTION_LIMITS_2024.get("hsa_individual");
        
        current.put("hsa", currentHsa);
        max.put("hsa", maxHsa);
        remaining.put("hsa", maxHsa.subtract(currentHsa));
        
        analysis.setCurrentContributions(current);
        analysis.setMaxContributions(max);
        analysis.setRemainingContributionRoom(remaining);
        
        // Calculate total tax savings from current contributions
        BigDecimal marginalRate = new BigDecimal("0.22"); // Assume 22% bracket
        BigDecimal totalContributions = current.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalSavings = totalContributions.multiply(marginalRate);
        analysis.setTotalTaxSavingsFromContributions(totalSavings);
        
        return analysis;
    }
    
    // Helper classes
    private static class TaxBracket {
        private final BigDecimal minIncome;
        private final BigDecimal maxIncome;
        private final BigDecimal rate;
        
        public TaxBracket(BigDecimal minIncome, BigDecimal maxIncome, BigDecimal rate) {
            this.minIncome = minIncome;
            this.maxIncome = maxIncome;
            this.rate = rate;
        }
        
        public BigDecimal getMinIncome() { return minIncome; }
        public BigDecimal getMaxIncome() { return maxIncome; }
        public BigDecimal getRate() { return rate; }
    }
    
    private static class TaxCalculationResult {
        private final BigDecimal taxOwed;
        private final List<TaxCalculationResponse.TaxBracketInfo> taxBrackets;
        private final BigDecimal effectiveRate;
        private final BigDecimal marginalRate;
        
        public TaxCalculationResult(BigDecimal taxOwed, List<TaxCalculationResponse.TaxBracketInfo> taxBrackets, 
                                    BigDecimal effectiveRate, BigDecimal marginalRate) {
            this.taxOwed = taxOwed;
            this.taxBrackets = taxBrackets;
            this.effectiveRate = effectiveRate;
            this.marginalRate = marginalRate;
        }
        
        public BigDecimal getTaxOwed() { return taxOwed; }
        public List<TaxCalculationResponse.TaxBracketInfo> getTaxBrackets() { return taxBrackets; }
        public BigDecimal getEffectiveRate() { return effectiveRate; }
        public BigDecimal getMarginalRate() { return marginalRate; }
    }
}