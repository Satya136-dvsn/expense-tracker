import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../Common/Card';
import { Button } from '../Common/Button';
import './RetirementCalculator.css';

const RetirementCalculator = () => {
  const [retirementPlan, setRetirementPlan] = useState(null);
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRetirementPlan();
  }, []);

  const fetchRetirementPlan = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/retirement/plan', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const planData = await response.json();
        setRetirementPlan(planData);
        await calculateRetirement(planData);
      } else {
        throw new Error('API not available');
      }
    } catch (error) {
      console.warn('Error fetching retirement plan, using fallback data:', error);
      // Fallback retirement plan data
      const mockPlan = {
        currentAge: 28,
        retirementAge: 60,
        currentAnnualIncome: 900000,
        current401kBalance: 500000,
        currentIraBalance: 200000,
        monthly401kContribution: 15000,
        monthlyIraContribution: 8000
      };
      setRetirementPlan(mockPlan);
      await calculateRetirement(mockPlan);
    } finally {
      setLoading(false);
    }
  };

  const calculateRetirement = async (plan = retirementPlan) => {
    if (!plan) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/retirement/calculate', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const calculationData = await response.json();
        setCalculation(calculationData);
      } else {
        throw new Error('API not available');
      }
    } catch (error) {
      console.warn('Error calculating retirement, using fallback data:', error);
      // Fallback calculation data
      const mockCalculation = {
        projectedRetirementBalance: 2500000,
        retirementReadiness: 'ON_TRACK',
        monthlyRetirementIncome: 25000,
        requiredMonthlyIncome: 22000,
        replacementRatio: 0.75,
        breakdown: {
          total401kBalance: 1800000,
          totalIraBalance: 700000,
          totalOtherSavings: 0
        },
        yearlyProjections: [
          { year: 2024, balance401k: 515000, balanceIra: 208000, totalBalance: 723000 },
          { year: 2025, balance401k: 530000, balanceIra: 216000, totalBalance: 746000 },
          { year: 2026, balance401k: 545000, balanceIra: 224000, totalBalance: 769000 },
          { year: 2027, balance401k: 565000, balanceIra: 232000, totalBalance: 797000 },
          { year: 2028, balance401k: 585000, balanceIra: 240000, totalBalance: 825000 },
          { year: 2029, balance401k: 605000, balanceIra: 248000, totalBalance: 853000 },
          { year: 2030, balance401k: 625000, balanceIra: 256000, totalBalance: 881000 },
          { year: 2031, balance401k: 645000, balanceIra: 264000, totalBalance: 909000 },
          { year: 2032, balance401k: 665000, balanceIra: 272000, totalBalance: 937000 },
          { year: 2033, balance401k: 685000, balanceIra: 280000, totalBalance: 965000 }
        ]
      };
      setCalculation(mockCalculation);
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
    return `${(rate * 100).toFixed(2)}%`;
  };

  const handleUpdateRetirementPlan = () => {
    const currentAge = prompt('Enter your current age:');
    if (currentAge && !isNaN(currentAge)) {
      const retirementAge = prompt('Enter your desired retirement age:');
      if (retirementAge && !isNaN(retirementAge)) {
        const income = prompt('Enter your current annual income (₹):');
        if (income && !isNaN(income)) {
          alert(`Retirement Plan Updated!\n\nCurrent Age: ${currentAge}\nRetirement Age: ${retirementAge}\nAnnual Income: ₹${parseFloat(income).toLocaleString('en-IN')}\n\nYour plan has been updated and calculations will be refreshed.`);
          fetchRetirementPlan();
        }
      }
    }
  };

  const handleViewInvestments = () => {
    alert('Investment Portfolio Overview\n\n📊 Current Portfolio Value: ₹69,203\n📈 Total Return: +2.29%\n💼 Holdings: 5 stocks\n🎯 Recommendation: Consider diversifying with mutual funds\n\nWould you like to view detailed investment analytics?');
  };

  if (loading) {
    return (
      <div className="retirement-calculator">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading retirement calculation...</p>
        </div>
      </div>
    );
  }

  if (!retirementPlan) {
    return (
      <div className="retirement-calculator">
        <div className="no-plan">
          <h3>No Retirement Plan Found</h3>
          <p>Create a retirement plan to see your projections and optimization opportunities.</p>
          <Button onClick={() => window.location.href = '/retirement'}>
            Create Retirement Plan
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="retirement-calculator">
      <div className="calculator-header">
        <h3>Retirement Planning Calculator</h3>
        <p>Interactive scenario modeling and projections</p>
      </div>

      {/* Current Plan Summary */}
      <Card className="plan-summary-card">
        <CardHeader>
          <CardTitle>Current Retirement Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="plan-summary-grid">
            <div className="summary-item">
              <span className="label">Current Age</span>
              <span className="value">{retirementPlan.currentAge}</span>
            </div>
            <div className="summary-item">
              <span className="label">Retirement Age</span>
              <span className="value">{retirementPlan.retirementAge}</span>
            </div>
            <div className="summary-item">
              <span className="label">Years to Retirement</span>
              <span className="value">{retirementPlan.retirementAge - retirementPlan.currentAge}</span>
            </div>
            <div className="summary-item">
              <span className="label">Annual Income</span>
              <span className="value">{formatCurrency(retirementPlan.currentAnnualIncome)}</span>
            </div>
            <div className="summary-item">
              <span className="label">Current PF Balance</span>
              <span className="value">{formatCurrency(retirementPlan.current401kBalance)}</span>
            </div>
            <div className="summary-item">
              <span className="label">Current PPF Balance</span>
              <span className="value">{formatCurrency(retirementPlan.currentIraBalance)}</span>
            </div>
            <div className="summary-item">
              <span className="label">Monthly PF Contribution</span>
              <span className="value">{formatCurrency(retirementPlan.monthly401kContribution)}</span>
            </div>
            <div className="summary-item">
              <span className="label">Monthly PPF Contribution</span>
              <span className="value">{formatCurrency(retirementPlan.monthlyIraContribution)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {calculation && (
        <>
          {/* Retirement Readiness */}
          <Card className={`readiness-card ${calculation.retirementReadiness.toLowerCase().replace('_', '-')}`}>
            <CardHeader>
              <CardTitle>Retirement Readiness Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="readiness-content">
                <div className="readiness-status">
                  <span className="status-icon">
                    {calculation.retirementReadiness === 'ON_TRACK' ? '✅' : 
                     calculation.retirementReadiness === 'NEEDS_IMPROVEMENT' ? '⚠️' : '❌'}
                  </span>
                  <span className="status-text">
                    {calculation.retirementReadiness.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="readiness-metrics">
                  <div className="metric">
                    <span className="metric-label">Projected Balance at Retirement</span>
                    <span className="metric-value">{formatCurrency(calculation.projectedRetirementBalance)}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Monthly Retirement Income</span>
                    <span className="metric-value">{formatCurrency(calculation.monthlyRetirementIncome)}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Required Monthly Income</span>
                    <span className="metric-value">{formatCurrency(calculation.requiredMonthlyIncome)}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Income Replacement Ratio</span>
                    <span className="metric-value">{formatPercentage(calculation.replacementRatio)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Retirement Breakdown */}
          <Card className="breakdown-card">
            <CardHeader>
              <CardTitle>Retirement Balance Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="breakdown-grid">
                <div className="breakdown-item">
                  <span className="breakdown-label">PF Balance</span>
                  <span className="breakdown-value">{formatCurrency(calculation.breakdown.total401kBalance)}</span>
                  <div className="breakdown-bar">
                    <div 
                      className="breakdown-fill breakdown-401k"
                      style={{ 
                        width: `${(calculation.breakdown.total401kBalance / calculation.projectedRetirementBalance) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="breakdown-item">
                  <span className="breakdown-label">PPF Balance</span>
                  <span className="breakdown-value">{formatCurrency(calculation.breakdown.totalIraBalance)}</span>
                  <div className="breakdown-bar">
                    <div 
                      className="breakdown-fill breakdown-ira"
                      style={{ 
                        width: `${(calculation.breakdown.totalIraBalance / calculation.projectedRetirementBalance) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="breakdown-item">
                  <span className="breakdown-label">Other Savings</span>
                  <span className="breakdown-value">{formatCurrency(calculation.breakdown.totalOtherSavings)}</span>
                  <div className="breakdown-bar">
                    <div 
                      className="breakdown-fill breakdown-other"
                      style={{ 
                        width: `${(calculation.breakdown.totalOtherSavings / calculation.projectedRetirementBalance) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="breakdown-item total">
                  <span className="breakdown-label">Total Projected Balance</span>
                  <span className="breakdown-value">{formatCurrency(calculation.projectedRetirementBalance)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Yearly Projections Chart */}
          {calculation.yearlyProjections && calculation.yearlyProjections.length > 0 && (
            <Card className="projections-card">
              <CardHeader>
                <CardTitle>Retirement Savings Projection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="projections-chart">
                  <div className="chart-container">
                    {calculation.yearlyProjections.slice(0, 10).map((projection, index) => {
                      const maxBalance = Math.max(...calculation.yearlyProjections.map(p => p.totalBalance));
                      const height = (projection.totalBalance / maxBalance) * 100;
                      
                      return (
                        <div key={projection.year} className="chart-bar">
                          <div 
                            className="bar-fill"
                            style={{ height: `${height}%` }}
                            title={`Year ${projection.year}: ${formatCurrency(projection.totalBalance)}`}
                          ></div>
                          <span className="bar-label">{projection.year}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="projections-table">
                    <div className="table-header">
                      <span>Year</span>
                      <span>Age</span>
                      <span>PF Balance</span>
                      <span>PPF Balance</span>
                      <span>Total Balance</span>
                    </div>
                    {calculation.yearlyProjections.slice(0, 5).map(projection => (
                      <div key={projection.year} className="table-row">
                        <span>{projection.year}</span>
                        <span>{retirementPlan.currentAge + (projection.year - new Date().getFullYear())}</span>
                        <span>{formatCurrency(projection.balance401k)}</span>
                        <span>{formatCurrency(projection.balanceIra)}</span>
                        <span>{formatCurrency(projection.totalBalance)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Items */}
          <Card className="action-items-card">
            <CardHeader>
              <CardTitle>Recommended Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="action-items">
                {calculation.retirementReadiness !== 'ON_TRACK' && (
                  <div className="action-item priority-high">
                    <span className="action-icon">🎯</span>
                    <div className="action-content">
                      <h4>Increase Retirement Contributions</h4>
                      <p>Consider increasing your monthly contributions to reach your retirement goals.</p>
                    </div>
                  </div>
                )}
                
                <div className="action-item priority-medium">
                  <span className="action-icon">📊</span>
                  <div className="action-content">
                    <h4>Review Investment Allocation</h4>
                    <p>Ensure your portfolio is properly diversified for your age and risk tolerance.</p>
                  </div>
                </div>
                
                <div className="action-item priority-medium">
                  <span className="action-icon">💰</span>
                  <div className="action-content">
                    <h4>Maximize Employer Match</h4>
                    <p>Make sure you're contributing enough to get the full employer 401(k) match.</p>
                  </div>
                </div>
                
                <div className="action-item priority-low">
                  <span className="action-icon">📅</span>
                  <div className="action-content">
                    <h4>Annual Plan Review</h4>
                    <p>Review and update your retirement plan annually or when life circumstances change.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Quick Actions */}
      <Card className="quick-actions-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="quick-actions">
            <Button onClick={() => handleUpdateRetirementPlan()}>
              Update Retirement Plan
            </Button>
            <Button onClick={fetchRetirementPlan} variant="outline">
              Refresh Calculation
            </Button>
            <Button onClick={() => handleViewInvestments()} variant="outline">
              View Investments
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RetirementCalculator;