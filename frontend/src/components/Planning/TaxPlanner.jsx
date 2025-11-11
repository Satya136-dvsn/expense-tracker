import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../Common/Card';
import { Button } from '../Common/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../Common/Tabs';
import './TaxPlanner.css';

const TaxPlanner = () => {
  const [taxPlan, setTaxPlan] = useState({
    taxYear: new Date().getFullYear(),
    filingStatus: 'SINGLE',
    annualIncome: '',
    federalWithholding: '',
    stateWithholding: '',
    estimatedTaxPayments: '',
    standardDeduction: '',
    itemizedDeductions: '',
    mortgageInterest: '',
    stateLocalTaxes: '',
    charitableContributions: '',
    medicalExpenses: '',
    traditional401kContribution: '',
    traditionalIraContribution: '',
    rothIraContribution: '',
    hsaContribution: '',
    capitalGains: '',
    capitalLosses: '',
    dividendIncome: '',
    interestIncome: ''
  });

  const [calculation, setCalculation] = useState(null);
  const [optimization, setOptimization] = useState(null);
  const [deductionComparison, setDeductionComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('input');

  const filingStatusOptions = [
    { value: 'SINGLE', label: 'Single' },
    { value: 'MARRIED_FILING_JOINTLY', label: 'Married Filing Jointly' },
    { value: 'MARRIED_FILING_SEPARATELY', label: 'Married Filing Separately' },
    { value: 'HEAD_OF_HOUSEHOLD', label: 'Head of Household' },
    { value: 'QUALIFYING_WIDOW', label: 'Qualifying Widow(er)' }
  ];

  useEffect(() => {
    if (taxPlan.annualIncome && taxPlan.filingStatus) {
      calculateOptimization();
    }
  }, [taxPlan.annualIncome, taxPlan.filingStatus]);

  const handleInputChange = (field, value) => {
    setTaxPlan(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateTaxes = async () => {
    if (!taxPlan.annualIncome || !taxPlan.filingStatus) {
      alert('Please enter your annual income and filing status');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/tax-planning/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...taxPlan,
          annualIncome: parseFloat(taxPlan.annualIncome) || 0,
          federalWithholding: parseFloat(taxPlan.federalWithholding) || 0,
          stateWithholding: parseFloat(taxPlan.stateWithholding) || 0,
          estimatedTaxPayments: parseFloat(taxPlan.estimatedTaxPayments) || 0,
          standardDeduction: parseFloat(taxPlan.standardDeduction) || 0,
          itemizedDeductions: parseFloat(taxPlan.itemizedDeductions) || 0,
          mortgageInterest: parseFloat(taxPlan.mortgageInterest) || 0,
          stateLocalTaxes: parseFloat(taxPlan.stateLocalTaxes) || 0,
          charitableContributions: parseFloat(taxPlan.charitableContributions) || 0,
          medicalExpenses: parseFloat(taxPlan.medicalExpenses) || 0,
          traditional401kContribution: parseFloat(taxPlan.traditional401kContribution) || 0,
          traditionalIraContribution: parseFloat(taxPlan.traditionalIraContribution) || 0,
          rothIraContribution: parseFloat(taxPlan.rothIraContribution) || 0,
          hsaContribution: parseFloat(taxPlan.hsaContribution) || 0,
          capitalGains: parseFloat(taxPlan.capitalGains) || 0,
          capitalLosses: parseFloat(taxPlan.capitalLosses) || 0,
          dividendIncome: parseFloat(taxPlan.dividendIncome) || 0,
          interestIncome: parseFloat(taxPlan.interestIncome) || 0
        })
      });

      if (response.ok) {
        const calculationData = await response.json();
        setCalculation(calculationData);
        setActiveTab('results');
        
        // Also calculate deduction comparison
        await compareDeductions();
      } else {
        const error = await response.text();
        alert(`Error calculating taxes: ${error}`);
      }
    } catch (error) {
      console.error('Error calculating taxes:', error);
      alert('Error calculating taxes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateOptimization = async () => {
    if (!taxPlan.annualIncome || !taxPlan.filingStatus) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tax-planning/optimize-contributions?income=${taxPlan.annualIncome}&filingStatus=${taxPlan.filingStatus}&age=35`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const optimizationData = await response.json();
        setOptimization(optimizationData);
      }
    } catch (error) {
      console.error('Error calculating optimization:', error);
    }
  };

  const compareDeductions = async () => {
    try {
      const token = localStorage.getItem('token');
      const deductions = {
        mortgageInterest: parseFloat(taxPlan.mortgageInterest) || 0,
        stateLocalTaxes: parseFloat(taxPlan.stateLocalTaxes) || 0,
        charitableContributions: parseFloat(taxPlan.charitableContributions) || 0,
        medicalExpenses: parseFloat(taxPlan.medicalExpenses) || 0
      };

      const response = await fetch(`/api/tax-planning/deduction-comparison?filingStatus=${taxPlan.filingStatus}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(deductions)
      });

      if (response.ok) {
        const comparisonData = await response.json();
        setDeductionComparison(comparisonData);
      }
    } catch (error) {
      console.error('Error comparing deductions:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (rate) => {
    return `${rate.toFixed(2)}%`;
  };

  return (
    <div className="tax-planner">
      <div className="planner-header">
        <h2>Tax Planning & Optimization</h2>
        <p>Optimize your tax strategy and maximize your savings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="tax-tabs">
          <TabsTrigger value="input">Tax Information</TabsTrigger>
          <TabsTrigger value="results">Tax Calculation</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="input">
          <div className="tax-input-form">
            {/* Basic Information */}
            <Card className="basic-info-card">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="taxYear">Tax Year</label>
                    <select
                      id="taxYear"
                      value={taxPlan.taxYear}
                      onChange={(e) => handleInputChange('taxYear', parseInt(e.target.value))}
                      className="form-input"
                    >
                      <option value={2024}>2024</option>
                      <option value={2023}>2023</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="filingStatus">Filing Status</label>
                    <select
                      id="filingStatus"
                      value={taxPlan.filingStatus}
                      onChange={(e) => handleInputChange('filingStatus', e.target.value)}
                      className="form-input"
                    >
                      {filingStatusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="annualIncome">Annual Income *</label>
                    <input
                      id="annualIncome"
                      type="number"
                      value={taxPlan.annualIncome}
                      onChange={(e) => handleInputChange('annualIncome', e.target.value)}
                      placeholder="75000"
                      className="form-input"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Withholding and Payments */}
            <Card className="withholding-card">
              <CardHeader>
                <CardTitle>Withholding & Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="federalWithholding">Federal Withholding</label>
                    <input
                      id="federalWithholding"
                      type="number"
                      value={taxPlan.federalWithholding}
                      onChange={(e) => handleInputChange('federalWithholding', e.target.value)}
                      placeholder="12000"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="stateWithholding">State Withholding</label>
                    <input
                      id="stateWithholding"
                      type="number"
                      value={taxPlan.stateWithholding}
                      onChange={(e) => handleInputChange('stateWithholding', e.target.value)}
                      placeholder="3000"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="estimatedTaxPayments">Estimated Tax Payments</label>
                    <input
                      id="estimatedTaxPayments"
                      type="number"
                      value={taxPlan.estimatedTaxPayments}
                      onChange={(e) => handleInputChange('estimatedTaxPayments', e.target.value)}
                      placeholder="2000"
                      className="form-input"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Deductions */}
            <Card className="deductions-card">
              <CardHeader>
                <CardTitle>Deductions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="mortgageInterest">Mortgage Interest</label>
                    <input
                      id="mortgageInterest"
                      type="number"
                      value={taxPlan.mortgageInterest}
                      onChange={(e) => handleInputChange('mortgageInterest', e.target.value)}
                      placeholder="8000"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="stateLocalTaxes">State & Local Taxes (SALT)</label>
                    <input
                      id="stateLocalTaxes"
                      type="number"
                      value={taxPlan.stateLocalTaxes}
                      onChange={(e) => handleInputChange('stateLocalTaxes', e.target.value)}
                      placeholder="10000"
                      className="form-input"
                    />
                    <small className="form-help">Limited to ₹8,30,000</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="charitableContributions">Charitable Contributions</label>
                    <input
                      id="charitableContributions"
                      type="number"
                      value={taxPlan.charitableContributions}
                      onChange={(e) => handleInputChange('charitableContributions', e.target.value)}
                      placeholder="2000"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="medicalExpenses">Medical Expenses</label>
                    <input
                      id="medicalExpenses"
                      type="number"
                      value={taxPlan.medicalExpenses}
                      onChange={(e) => handleInputChange('medicalExpenses', e.target.value)}
                      placeholder="5000"
                      className="form-input"
                    />
                    <small className="form-help">Only amount over 7.5% of AGI is deductible</small>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tax-Advantaged Accounts */}
            <Card className="accounts-card">
              <CardHeader>
                <CardTitle>Tax-Advantaged Account Contributions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="traditional401k">Traditional 401(k)</label>
                    <input
                      id="traditional401k"
                      type="number"
                      value={taxPlan.traditional401kContribution}
                      onChange={(e) => handleInputChange('traditional401kContribution', e.target.value)}
                      placeholder="22500"
                      className="form-input"
                    />
                    <small className="form-help">2024 limit: ₹18,67,500</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="traditionalIra">Traditional IRA</label>
                    <input
                      id="traditionalIra"
                      type="number"
                      value={taxPlan.traditionalIraContribution}
                      onChange={(e) => handleInputChange('traditionalIraContribution', e.target.value)}
                      placeholder="6000"
                      className="form-input"
                    />
                    <small className="form-help">2024 limit: ₹4,98,000</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="rothIra">Roth IRA</label>
                    <input
                      id="rothIra"
                      type="number"
                      value={taxPlan.rothIraContribution}
                      onChange={(e) => handleInputChange('rothIraContribution', e.target.value)}
                      placeholder="6000"
                      className="form-input"
                    />
                    <small className="form-help">After-tax contribution</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="hsa">HSA Contribution</label>
                    <input
                      id="hsa"
                      type="number"
                      value={taxPlan.hsaContribution}
                      onChange={(e) => handleInputChange('hsaContribution', e.target.value)}
                      placeholder="3650"
                      className="form-input"
                    />
                    <small className="form-help">2024 limit: ₹3,02,950 (individual)</small>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Investment Income */}
            <Card className="investment-card">
              <CardHeader>
                <CardTitle>Investment Income</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="capitalGains">Capital Gains</label>
                    <input
                      id="capitalGains"
                      type="number"
                      value={taxPlan.capitalGains}
                      onChange={(e) => handleInputChange('capitalGains', e.target.value)}
                      placeholder="5000"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="capitalLosses">Capital Losses</label>
                    <input
                      id="capitalLosses"
                      type="number"
                      value={taxPlan.capitalLosses}
                      onChange={(e) => handleInputChange('capitalLosses', e.target.value)}
                      placeholder="2000"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="dividendIncome">Dividend Income</label>
                    <input
                      id="dividendIncome"
                      type="number"
                      value={taxPlan.dividendIncome}
                      onChange={(e) => handleInputChange('dividendIncome', e.target.value)}
                      placeholder="1000"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="interestIncome">Interest Income</label>
                    <input
                      id="interestIncome"
                      type="number"
                      value={taxPlan.interestIncome}
                      onChange={(e) => handleInputChange('interestIncome', e.target.value)}
                      placeholder="500"
                      className="form-input"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="calculate-button-container">
              <Button 
                onClick={calculateTaxes}
                disabled={loading || !taxPlan.annualIncome}
                className="calculate-button"
              >
                {loading ? 'Calculating...' : 'Calculate Taxes'}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="results">
          {calculation && (
            <div className="tax-results">
              {/* Tax Summary */}
              <Card className="tax-summary-card">
                <CardHeader>
                  <CardTitle>Tax Calculation Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="summary-grid">
                    <div className="summary-item">
                      <span className="label">Annual Income</span>
                      <span className="value">{formatCurrency(calculation.annualIncome)}</span>
                    </div>
                    <div className="summary-item">
                      <span className="label">Adjusted Gross Income</span>
                      <span className="value">{formatCurrency(calculation.adjustedGrossIncome)}</span>
                    </div>
                    <div className="summary-item">
                      <span className="label">Taxable Income</span>
                      <span className="value">{formatCurrency(calculation.taxableIncome)}</span>
                    </div>
                    <div className="summary-item">
                      <span className="label">Federal Tax Owed</span>
                      <span className="value">{formatCurrency(calculation.federalTaxOwed)}</span>
                    </div>
                    <div className="summary-item">
                      <span className="label">State Tax Owed</span>
                      <span className="value">{formatCurrency(calculation.stateTaxOwed)}</span>
                    </div>
                    <div className="summary-item">
                      <span className="label">Total Tax Owed</span>
                      <span className="value total">{formatCurrency(calculation.totalTaxOwed)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Refund/Amount Due */}
              <Card className={`refund-card ${calculation.isRefund ? 'refund' : 'owe'}`}>
                <CardHeader>
                  <CardTitle>
                    {calculation.isRefund ? '💰 Expected Refund' : '💸 Amount Due'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="refund-amount">
                    <span className="amount">{formatCurrency(calculation.refundOrAmountDue)}</span>
                    <span className="description">
                      {calculation.isRefund ? 
                        'You have overpaid your taxes and should receive a refund' : 
                        'You owe additional taxes beyond what was withheld'}
                    </span>
                  </div>
                  
                  <div className="withholding-breakdown">
                    <div className="breakdown-item">
                      <span>Federal Withholding</span>
                      <span>{formatCurrency(calculation.federalWithholding)}</span>
                    </div>
                    <div className="breakdown-item">
                      <span>State Withholding</span>
                      <span>{formatCurrency(calculation.stateWithholding)}</span>
                    </div>
                    <div className="breakdown-item">
                      <span>Estimated Payments</span>
                      <span>{formatCurrency(calculation.estimatedTaxPayments)}</span>
                    </div>
                    <div className="breakdown-item total">
                      <span>Total Withholding</span>
                      <span>{formatCurrency(calculation.totalWithholding)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tax Rates */}
              <Card className="tax-rates-card">
                <CardHeader>
                  <CardTitle>Tax Rates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rates-grid">
                    <div className="rate-item">
                      <span className="rate-label">Effective Tax Rate</span>
                      <span className="rate-value">{formatPercentage(calculation.effectiveTaxRate)}</span>
                      <span className="rate-description">Average rate on all income</span>
                    </div>
                    <div className="rate-item">
                      <span className="rate-label">Marginal Tax Rate</span>
                      <span className="rate-value">{formatPercentage(calculation.marginalTaxRate)}</span>
                      <span className="rate-description">Rate on next dollar earned</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Deduction Analysis */}
              {deductionComparison && (
                <Card className="deduction-analysis-card">
                  <CardHeader>
                    <CardTitle>Deduction Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="deduction-comparison">
                      <div className="deduction-option">
                        <h4>Standard Deduction</h4>
                        <span className="deduction-amount">{formatCurrency(deductionComparison.standardDeduction)}</span>
                      </div>
                      <div className="vs">vs</div>
                      <div className="deduction-option">
                        <h4>Itemized Deductions</h4>
                        <span className="deduction-amount">{formatCurrency(deductionComparison.itemizedDeductions)}</span>
                      </div>
                    </div>
                    
                    <div className="recommendation">
                      <div className={`recommendation-badge ${deductionComparison.shouldItemize ? 'itemize' : 'standard'}`}>
                        {deductionComparison.shouldItemize ? 'Itemize Recommended' : 'Standard Recommended'}
                      </div>
                      <p>{deductionComparison.recommendation}</p>
                      {deductionComparison.benefit > 0 && (
                        <p className="benefit">Additional benefit: {formatCurrency(deductionComparison.benefit)}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tax Brackets */}
              {calculation.federalTaxBrackets && (
                <Card className="tax-brackets-card">
                  <CardHeader>
                    <CardTitle>Federal Tax Brackets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="brackets-table">
                      <div className="brackets-header">
                        <span>Income Range</span>
                        <span>Rate</span>
                        <span>Tax Owed</span>
                      </div>
                      {calculation.federalTaxBrackets.map((bracket, index) => (
                        <div key={index} className="bracket-row">
                          <span className="income-range">
                            {formatCurrency(bracket.minIncome)} - {bracket.maxIncome ? formatCurrency(bracket.maxIncome) : 'No limit'}
                          </span>
                          <span className="bracket-rate">{formatPercentage(bracket.rate)}</span>
                          <span className="bracket-tax">{formatCurrency(bracket.taxOwed)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="optimization">
          {optimization && (
            <div className="tax-optimization">
              <Card className="optimization-summary">
                <CardHeader>
                  <CardTitle>💡 Tax Optimization Opportunities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="optimization-stats">
                    <div className="stat-item">
                      <span className="stat-label">Current Marginal Rate</span>
                      <span className="stat-value">{formatPercentage(optimization.marginalTaxRate)}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Total Potential Savings</span>
                      <span className="stat-value savings">{formatCurrency(optimization.totalTaxSavings)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="optimization-recommendations">
                <Card className="contribution-optimization">
                  <CardHeader>
                    <CardTitle>Retirement Account Optimization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="contribution-grid">
                      <div className="contribution-item">
                        <h4>401(k) Contribution</h4>
                        <div className="contribution-details">
                          <span>Optimal: {formatCurrency(optimization.optimalContributions['401k'])}</span>
                          <span className="savings">Tax Savings: {formatCurrency(optimization.taxSavings['401k'])}</span>
                        </div>
                      </div>

                      <div className="contribution-item">
                        <h4>Traditional IRA</h4>
                        <div className="contribution-details">
                          <span>Optimal: {formatCurrency(optimization.optimalContributions.traditionalIRA)}</span>
                          <span className="savings">Tax Savings: {formatCurrency(optimization.taxSavings.traditionalIRA)}</span>
                        </div>
                      </div>

                      <div className="contribution-item">
                        <h4>HSA Contribution</h4>
                        <div className="contribution-details">
                          <span>Optimal: {formatCurrency(optimization.optimalContributions.hsa)}</span>
                          <span className="savings">Tax Savings: {formatCurrency(optimization.taxSavings.hsa)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {calculation && calculation.optimizationSuggestions && (
                  <Card className="suggestions-card">
                    <CardHeader>
                      <CardTitle>Personalized Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="suggestions-list">
                        {calculation.optimizationSuggestions.map((suggestion, index) => (
                          <div key={index} className={`suggestion-item priority-${suggestion.priority.toLowerCase()}`}>
                            <div className="suggestion-header">
                              <span className="suggestion-category">{suggestion.category}</span>
                              <span className="suggestion-priority">{suggestion.priority}</span>
                            </div>
                            <h4 className="suggestion-title">{suggestion.suggestion}</h4>
                            <p className="suggestion-description">{suggestion.description}</p>
                            <div className="suggestion-savings">
                              Potential Savings: {formatCurrency(suggestion.potentialSavings)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaxPlanner;